/* StaghojQR 2.0.1 compatibility API for code using qrcode.js-style calls. */
(function(global){
'use strict';
function QRCode(el,opts){
  if(!(this instanceof QRCode))return new QRCode(el,opts);
  this.el=typeof el==='string'?document.getElementById(el):el;
  this.opts=opts||{};
  const text=String(this.opts.text||'');
  if(text)this.makeCode(text);
}
QRCode.CorrectLevel={L:1,M:0,Q:3,H:2};
QRCode.prototype.clear=function(){if(this.el)this.el.innerHTML='';};
QRCode.prototype.makeCode=function(text){
  if(!global.StaghojQR)throw new Error('StaghojQR is not loaded.');
  global.StaghojQR.render(this.el,String(text),{title:String(this.opts.title||'QR code')});
};
global.QRCode=QRCode;
})(typeof window!=='undefined'?window:globalThis);
