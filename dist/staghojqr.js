/* StaghojQR 2.0.1
 * Lightweight self-hosted QR code engine.
 * No external service or CDN is required.
 * QR Version 6, error correction H, byte mode.
 */
(function(global){
'use strict';
const VERSION=6, SIZE=41, DATA_CODEWORDS=60, EC_PER_BLOCK=28;
const BLOCK_DATA=[15,15,15,15];
function utf8(s){ return Array.from(new TextEncoder().encode(s)); }
function bitsPush(bits, value, length){ for(let i=length-1;i>=0;i--) bits.push(((value>>>i)&1)!==0); }
function makeData(text){
  const bytes=utf8(text);
  if(bytes.length>58) throw new Error('QR content is too long for StaghojQR 2.0.1 (maximum 58 bytes).');
  const bits=[]; bitsPush(bits,4,4); bitsPush(bits,bytes.length,8); bytes.forEach(b=>bitsPush(bits,b,8));
  const cap=DATA_CODEWORDS*8; for(let i=0;i<Math.min(4,cap-bits.length);i++) bits.push(false);
  while(bits.length%8) bits.push(false);
  const data=[]; for(let i=0;i<bits.length;i+=8){ let b=0; for(let j=0;j<8;j++) if(bits[i+j]) b|=(1<<(7-j)); data.push(b); }
  let pad=true; while(data.length<DATA_CODEWORDS){ data.push(pad?0xEC:0x11); pad=!pad; }
  return data;
}
const EXP=new Array(512), LOG=new Array(256);
(function(){ let x=1; for(let i=0;i<255;i++){ EXP[i]=x; LOG[x]=i; x<<=1; if(x&0x100) x^=0x11d; } for(let i=255;i<512;i++) EXP[i]=EXP[i-255]; })();
function mul(a,b){ return (!a||!b)?0:EXP[LOG[a]+LOG[b]]; }
function polyMul(a,b){ const out=new Array(a.length+b.length-1).fill(0); for(let i=0;i<a.length;i++) for(let j=0;j<b.length;j++) out[i+j]^=mul(a[i],b[j]); return out; }
function generator(n){ let g=[1]; for(let i=0;i<n;i++) g=polyMul(g,[1,EXP[i]]); return g; }
const GEN=generator(EC_PER_BLOCK);
function ecc(data){ const msg=data.concat(new Array(EC_PER_BLOCK).fill(0)); for(let i=0;i<data.length;i++){ const coef=msg[i]; if(!coef) continue; for(let j=0;j<GEN.length;j++) msg[i+j]^=mul(GEN[j],coef); } return msg.slice(data.length); }
function interleave(data){ let p=0; const blocks=[]; BLOCK_DATA.forEach(n=>{ const d=data.slice(p,p+n); p+=n; blocks.push({d,e:ecc(d)}); }); const out=[],maxData=Math.max(...blocks.map(b=>b.d.length)); for(let i=0;i<maxData;i++) blocks.forEach(b=>{ if(i<b.d.length) out.push(b.d[i]); }); for(let i=0;i<EC_PER_BLOCK;i++) blocks.forEach(b=>out.push(b.e[i])); return out; }
function bchTypeInfo(data){ let d=data<<10; const g=0x537; while(bitLen(d)-bitLen(g)>=0) d^=(g<<(bitLen(d)-bitLen(g))); return ((data<<10)|d)^0x5412; }
function bitLen(x){ let n=0; while(x){n++;x>>>=1;} return n; }
function mask(mask,r,c){ switch(mask){case 0:return (r+c)%2===0;case 1:return r%2===0;case 2:return c%3===0;case 3:return (r+c)%3===0;case 4:return (Math.floor(r/2)+Math.floor(c/3))%2===0;case 5:return ((r*c)%2+(r*c)%3)===0;case 6:return (((r*c)%2+(r*c)%3)%2)===0;case 7:return (((r*c)%3+(r+c)%2)%2)===0;} return false; }
function blank(){ return Array.from({length:SIZE},()=>Array(SIZE).fill(null)); }
function finder(m,row,col){ for(let r=-1;r<=7;r++) for(let c=-1;c<=7;c++){ const rr=row+r,cc=col+c;if(rr<0||rr>=SIZE||cc<0||cc>=SIZE)continue; m[rr][cc]=(r>=0&&r<=6&&c>=0&&c<=6&&(r===0||r===6||c===0||c===6||(r>=2&&r<=4&&c>=2&&c<=4))); } }
function align(m,row,col){ for(let r=-2;r<=2;r++) for(let c=-2;c<=2;c++) m[row+r][col+c]=(Math.abs(r)===2||Math.abs(c)===2||(r===0&&c===0)); }
function setupBase(){ const m=blank(); finder(m,0,0);finder(m,SIZE-7,0);finder(m,0,SIZE-7); const pos=[6,34]; for(const r of pos) for(const c of pos) if(m[r][c]===null) align(m,r,c); for(let i=8;i<SIZE-8;i++){ if(m[i][6]===null)m[i][6]=(i%2===0); if(m[6][i]===null)m[6][i]=(i%2===0); } return m; }
function format(m,maskNo,test){ const bits=bchTypeInfo((2<<3)|maskNo); for(let i=0;i<15;i++){ const mod=!test&&(((bits>>i)&1)===1); if(i<6)m[i][8]=mod; else if(i<8)m[i+1][8]=mod; else m[SIZE-15+i][8]=mod; if(i<8)m[8][SIZE-i-1]=mod; else if(i<9)m[8][15-i]=mod; else m[8][15-i-1]=mod; } m[SIZE-8][8]=!test; }
function place(m,codewords,maskNo){ let row=SIZE-1,inc=-1,byte=0,bit=7; for(let col=SIZE-1;col>0;col-=2){ if(col===6)col--; while(true){ for(let c=0;c<2;c++){ const cc=col-c; if(m[row][cc]!==null)continue; let dark=false; if(byte<codewords.length) dark=((codewords[byte]>>>bit)&1)!==0; if(mask(maskNo,row,cc))dark=!dark; m[row][cc]=dark; bit--; if(bit<0){byte++;bit=7;} } row+=inc; if(row<0||row>=SIZE){row-=inc;inc=-inc;break;} } } }
function lost(m){ let p=0; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++){ let same=0,d=m[r][c]; for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){ if(!dr&&!dc)continue;let rr=r+dr,cc=c+dc;if(rr<0||rr>=SIZE||cc<0||cc>=SIZE)continue;if(m[rr][cc]===d)same++; } if(same>5)p+=3+same-5; }
 for(let r=0;r<SIZE-1;r++) for(let c=0;c<SIZE-1;c++){ const s=(m[r][c]?1:0)+(m[r+1][c]?1:0)+(m[r][c+1]?1:0)+(m[r+1][c+1]?1:0); if(s===0||s===4)p+=3; }
 for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE-6;c++) if(m[r][c]&&!m[r][c+1]&&m[r][c+2]&&m[r][c+3]&&m[r][c+4]&&!m[r][c+5]&&m[r][c+6])p+=40;
 for(let c=0;c<SIZE;c++) for(let r=0;r<SIZE-6;r++) if(m[r][c]&&!m[r+1][c]&&m[r+2][c]&&m[r+3][c]&&m[r+4][c]&&!m[r+5][c]&&m[r+6][c])p+=40;
 let dark=0; for(const row of m) for(const v of row) if(v)dark++; p+=Math.floor(Math.abs((dark*100/(SIZE*SIZE))-50)/5)*10; return p; }
function matrix(text){ const cw=interleave(makeData(text)); let best=null,score=Infinity; for(let maskNo=0;maskNo<8;maskNo++){ const m=setupBase(); format(m,maskNo,false); place(m,cw,maskNo); const s=lost(m); if(s<score){score=s;best=m;} } return best; }
function svg(text,opts){ opts=opts||{}; const quiet=4,m=matrix(text),n=SIZE+quiet*2; let path=''; for(let r=0;r<SIZE;r++) for(let c=0;c<SIZE;c++) if(m[r][c]) path+='M'+(c+quiet)+' '+(r+quiet)+'h1v1h-1z'; const title=String(opts.title||'StaghojQR code').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s])); return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+n+' '+n+'" role="img" aria-label="'+title+'" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="'+path+'" fill="#000"/></svg>'; }
function render(el,text,opts){ if(!el) return; el.innerHTML=svg(text,opts); el.dataset.qrValue=text; }
function downloadSvg(text,filename){ const blob=new Blob([svg(text,{title:'StaghojQR code'})],{type:'image/svg+xml;charset=utf-8'}); const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=filename||'staghojqr.svg';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000); }
function pngCanvas(text,sizePx){
  sizePx=Math.max(128,Math.min(4096,parseInt(sizePx||1024,10)||1024));
  const quiet=4,m=matrix(text),n=SIZE+quiet*2,canvas=document.createElement('canvas');
  canvas.width=sizePx;canvas.height=sizePx;
  const ctx=canvas.getContext('2d',{alpha:false});
  ctx.imageSmoothingEnabled=false;ctx.fillStyle='#fff';ctx.fillRect(0,0,sizePx,sizePx);ctx.fillStyle='#000';
  for(let r=0;r<SIZE;r++)for(let c=0;c<SIZE;c++)if(m[r][c]){
    const x0=Math.round((c+quiet)*sizePx/n),x1=Math.round((c+quiet+1)*sizePx/n);
    const y0=Math.round((r+quiet)*sizePx/n),y1=Math.round((r+quiet+1)*sizePx/n);
    ctx.fillRect(x0,y0,Math.max(1,x1-x0),Math.max(1,y1-y0));
  }
  return canvas;
}
function downloadPng(text,filename,sizePx){
  const canvas=pngCanvas(text,sizePx);
  canvas.toBlob(blob=>{
    if(!blob)return;
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download=filename||'staghojqr.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  },'image/png');
}
global.StaghojQR={matrix,svg,render,downloadSvg,downloadPng,pngCanvas,version:'2.0.1',qrVersion:VERSION,errorCorrection:'H'};
if(typeof module!=='undefined'&&module.exports)module.exports=global.StaghojQR;
})(typeof window!=='undefined'?window:globalThis);
