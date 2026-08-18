# InBrowser

Privacy-first file tools. Compress images, merge PDFs, and more — all in your browser.

Every tool runs entirely client-side. Your files are never uploaded, stored, or sent to a server. Anything you process stays on your device.

## Tools

### PDF
- **PDF Merger** — combine multiple PDFs into one, with drag-and-drop reordering.
- **PDF Split** — split a PDF by pages or ranges into separate files.
- **PDF Rotate** — rotate all or selected pages of a PDF.
- **PDF Page Remover** — remove unwanted pages and download the cleaned file.
- **PDF Lock / Unlock** — encrypt a PDF with a password, or remove an existing password.
- **Image to PDF** — turn images (JPG/PNG) into a single PDF, with page size and fit control.

### Images
- **Image Compressor** — shrink JPG/PNG/WebP files with quality and dimension controls.
- **Resize & Convert** — resize images by max dimension and convert between JPG, PNG, and WebP.

### Security
- **Password Toolkit** — generate strong passwords and check their strength.
- **Hash Generator** — compute hashes (MD5, SHA-1, SHA-256, ...) of any text or file.

### Utilities
- **QR Code Generator** — create QR codes for URLs, Wi-Fi, contact info, and more, with ready-made templates.

## Tech Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) + shadcn/ui components
- Redux Toolkit (RTK) for client-side state
- [pdf-lib](https://pdf-lib.js.org), [pdfjs-dist](https://mozilla.github.io/pdf.js/), and [qpdf](https://qpdf.sourceforge.io/) (compiled to WebAssembly) for PDF work
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression) for image processing
- [vitest](https://vitest.dev) for testing

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to use the tools.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Production build |
| `pnpm start` | Run the production build |
| `pnpm lint` | ESLint (must pass with zero errors/warnings) |
| `pnpm test` | Run the vitest suite |
| `pnpm icons` | Regenerate favicon/app icons from source |

## Project Layout

- `src/features/<tool>/` — each tool is a self-contained feature (components, lib, slice, tests).
- `src/app/tools/<tool>/` — route pages for each tool.
- `src/features/tools/tool-registry.ts` — the central list of tools rendered on the homepage.
- `public/qpdf/` and `public/pdf.worker.min.mjs` — vendored third-party bundles (ignored by ESLint).

## Testing

```bash
pnpm test
```

Unit tests cover the pure logic of each feature (PDF operations, image helpers, QR payloads, hash generation, and state slices).
