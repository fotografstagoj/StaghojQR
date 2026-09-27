# StaghojQR

A small, dependency-free JavaScript QR code engine for websites and web applications.

StaghojQR 2.0.1 is self-hosted and generates QR codes locally in the browser. It does not require an external QR API or CDN.

## Current capabilities

- QR Version 6
- Error correction level H
- Byte mode
- UTF-8 input
- Maximum payload: 58 bytes
- Automatic mask selection
- SVG output
- PNG output
- Canvas output
- Direct rendering into a DOM element
- qrcode.js-style compatibility helper
- No runtime dependencies

## Quick start

Include the files:

```html
<link rel="stylesheet" href="dist/staghojqr.css">
<script src="dist/staghojqr.js"></script>
```

Add a target:

```html
<div id="qr" class="staghojqr staghojqr--md"></div>
```

Render a QR code:

```html
<script>
const target = document.getElementById('qr');

StaghojQR.render(
  target,
  'https://example.com',
  { title: 'Example QR code' }
);
</script>
```

## Download as SVG

```js
StaghojQR.downloadSvg(
  'https://example.com',
  'example-qr.svg'
);
```

## Download as PNG

```js
StaghojQR.downloadPng(
  'https://example.com',
  'example-qr.png',
  1024
);
```

PNG size is constrained by the library to 128–4096 pixels.

## Compatibility API

If an existing project uses qrcode.js-style calls, load the compatibility helper after StaghojQR:

```html
<script src="dist/staghojqr.js"></script>
<script src="dist/staghojqr-compat.js"></script>
```

Then:

```js
new QRCode(document.getElementById('qr'), {
  text: 'https://example.com',
  title: 'Example QR code'
});
```

## Important payload limit

StaghojQR 2.0.1 uses a fixed QR Version 6 / H configuration and accepts a maximum of 58 UTF-8 bytes.

This means the limit is **bytes, not characters**. Non-ASCII characters may use more than one byte.

```js
try {
  StaghojQR.svg('https://example.com');
} catch (error) {
  console.error(error.message);
}
```

## API

The global `StaghojQR` object exposes:

```text
matrix(text)
svg(text, options)
render(element, text, options)
downloadSvg(text, filename)
downloadPng(text, filename, sizePx)
pngCanvas(text, sizePx)
version
qrVersion
errorCorrection
```

See [API documentation](docs/API.md).

## CDN via jsDelivr

StaghojQR can be loaded directly from a tagged GitHub release through jsDelivr:

```html
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/gh/fotografstagoj/StaghojQR@v2.0.1/dist/staghojqr.css">

<script
  src="https://cdn.jsdelivr.net/gh/fotografstagoj/StaghojQR@v2.0.1/dist/staghojqr.js"></script>
```

Pin an exact release such as `v2.0.1` in production. Avoid unversioned CDN URLs because future repository changes could alter what your site loads.

Compatibility helper:

```html
<script
  src="https://cdn.jsdelivr.net/gh/fotografstagoj/StaghojQR@v2.0.1/dist/staghojqr-compat.js"></script>
```

## CSS

The QR engine does not require CSS to generate valid codes.

`dist/staghojqr.css` is included only as an optional responsive presentation layer.

## Examples

- [Basic browser example](examples/basic.html)
- [SVG example](examples/svg.html)
- [PNG download example](examples/png.html)
- [Compatibility example](examples/compat.html)

## Security and privacy

QR data is generated locally. StaghojQR itself does not send the encoded text to a remote QR service.

As with any QR generator, applications should validate untrusted user input where appropriate. A generated QR code can point to an unsafe destination.

See [Security Policy](SECURITY.md).

## License

MIT License. See [LICENSE](LICENSE).

Copyright © 2026 StaghojQR contributors.
