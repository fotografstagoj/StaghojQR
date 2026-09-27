# Installation

StaghojQR has no runtime dependencies.

## Direct browser use

Copy these files into your project:

```text
dist/staghojqr.js
dist/staghojqr.css
```

Include them:

```html
<link rel="stylesheet" href="/assets/staghojqr.css">
<script src="/assets/staghojqr.js"></script>
```

Then:

```html
<div id="qr" class="staghojqr staghojqr--md"></div>

<script>
StaghojQR.render(
  document.getElementById('qr'),
  'https://example.com',
  { title: 'Example QR code' }
);
</script>
```

## Compatibility mode

For projects written around qrcode.js-style calls:

```html
<script src="/assets/staghojqr.js"></script>
<script src="/assets/staghojqr-compat.js"></script>
```

## npm

The repository contains `package.json` so the project can later be published to npm.

After publication:

```bash
npm install staghojqr
```

Do not rely on this command until an official package has actually been published.

## Self-hosting

Self-hosting is recommended. The library does not need a remote QR generation service.

## Content Security Policy

StaghojQR does not require `eval`, inline remote scripts or network access for QR generation.
