# StaghojQR API Reference

This document describes StaghojQR 2.0.1.

## Configuration

StaghojQR 2.0.1 uses a fixed QR configuration:

| Property | Value |
|---|---|
| QR version | 6 |
| Matrix size | 41 × 41 modules |
| Error correction | H |
| Encoding mode | Byte |
| Maximum payload | 58 UTF-8 bytes |
| Quiet zone | 4 modules |

Runtime metadata is available as:

```js
StaghojQR.version
StaghojQR.qrVersion
StaghojQR.errorCorrection
```

## `StaghojQR.matrix(text)`

Builds and returns the QR matrix.

```js
const matrix = StaghojQR.matrix('https://example.com');
```

The returned value is a two-dimensional Boolean array.

## `StaghojQR.svg(text, options)`

Returns the complete QR code as an SVG string.

```js
const svg = StaghojQR.svg(
  'https://example.com',
  { title: 'Example QR code' }
);
```

### Options

`title`  
Accessible label used for the generated SVG.

## `StaghojQR.render(element, text, options)`

Renders an SVG QR code into an existing DOM element.

```js
const element = document.getElementById('qr');

StaghojQR.render(
  element,
  'https://example.com',
  { title: 'Example QR code' }
);
```

The function also writes the encoded value to:

```js
element.dataset.qrValue
```

The first argument must be a DOM element. It is not a CSS selector string.

## `StaghojQR.downloadSvg(text, filename)`

Creates an SVG file and starts a browser download.

```js
StaghojQR.downloadSvg(
  'https://example.com',
  'example-qr.svg'
);
```

The default filename is `staghojqr.svg`.

## `StaghojQR.pngCanvas(text, sizePx)`

Returns a Canvas element containing a QR code.

```js
const canvas = StaghojQR.pngCanvas(
  'https://example.com',
  1024
);
```

The requested size is constrained to 128–4096 pixels.

## `StaghojQR.downloadPng(text, filename, sizePx)`

Creates a PNG and starts a browser download.

```js
StaghojQR.downloadPng(
  'https://example.com',
  'example-qr.png',
  1024
);
```

The default filename is `staghojqr.png`.

## Payload length

The payload is encoded as UTF-8 and may contain at most 58 bytes.

For example, ASCII characters generally use one byte each, while other Unicode characters may require multiple bytes.

When the limit is exceeded, StaghojQR throws an error.

## Compatibility API

Load:

```html
<script src="staghojqr.js"></script>
<script src="staghojqr-compat.js"></script>
```

Then use:

```js
const qr = new QRCode(document.getElementById('qr'), {
  text: 'https://example.com',
  title: 'Example QR code'
});
```

### `qr.makeCode(text)`

Replaces the current QR code.

```js
qr.makeCode('https://example.org');
```

### `qr.clear()`

Clears the target element.

```js
qr.clear();
```

### `QRCode.CorrectLevel`

The compatibility object exposes:

```js
QRCode.CorrectLevel.L
QRCode.CorrectLevel.M
QRCode.CorrectLevel.Q
QRCode.CorrectLevel.H
```

This exists for compatibility. StaghojQR 2.0.1 itself always generates Version 6 / H QR codes.
