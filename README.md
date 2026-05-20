# CutClean Background Remover

CutClean is a small Micro SaaS-style MVP for removing the background from one image directly in the browser.

## Features

- Upload or drag and drop one PNG, JPG, JPEG, or WebP image.
- Remove the background client-side with `@imgly/background-removal`.
- Preview original and transparent PNG result side by side.
- Switch preview background between transparent checkerboard, white, and color.
- Download the processed PNG.
- Local-only demo credits and pricing strip for the SaaS shell.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

## Build

```bash
npm run build
```

## Notes

- Images are processed in the browser session and are not uploaded to a backend.
- Auth, billing, real quotas, and storage are intentionally out of scope for this MVP.
- `@imgly/background-removal` is published under AGPL-3.0. Review licensing before using this in a closed-source commercial product.
