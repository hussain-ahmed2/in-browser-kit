# InBrowser

The ultimate privacy-first toolkit. Convert media, manage PDFs, generate developer tools, and more — all locally in your browser.

Every tool runs entirely client-side. Your files are never uploaded, stored, or sent to a server. Anything you process stays firmly on your device.

## Tools

### Video & Audio
- **Media Converter** — highly optimized hardware-accelerated (WebCodecs) and fallback (FFmpeg/WebAssembly) media converter. Convert between MP4, WebM, MP3, WAV, and GIF, with full control over bitrate, resolution, and codecs (H.264, HEVC, VP9, AV1).

### PDF Tools
- **PDF Merger** — combine multiple PDFs into one, with drag-and-drop reordering.
- **PDF Split** — split a PDF by pages or ranges into separate files.
- **PDF Rotate** — rotate all or selected pages of a PDF.
- **PDF Page Remover** — remove unwanted pages and download the cleaned file.
- **PDF Lock / Unlock** — encrypt a PDF with a password, or remove an existing password.
- **PDF to Images** — extract pages from a PDF as high-quality JPG or PNG images.
- **Image to PDF** — turn images (JPG/PNG) into a single PDF, with page size and fit control.

### Image Tools
- **Image Compressor** — shrink JPG/PNG/WebP files with quality and dimension controls.
- **Resize & Convert** — resize images by max dimension and convert between JPG, PNG, and WebP.
- **Image Metadata Viewer** — inspect and remove EXIF data (GPS, camera info) from your photos for privacy.

### Security & Developer Utilities
- **JWT Decoder** — decode and inspect JSON Web Tokens locally without sending them over the wire.
- **Regex Tester** — test regular expressions against text snippets in real-time.
- **JSON Formatter** — validate, format, and minify JSON payloads.
- **Base64 Encoder / Decoder** — safely encode or decode text and files to/from Base64.
- **Hash Generator** — compute hashes (MD5, SHA-1, SHA-256, SHA-512) of any text or file.
- **Password Toolkit** — generate strong, secure passwords and check their entropy/strength.
- **UUID Generator** — bulk generate v1, v4, or v7 UUIDs instantly.

### Everyday Utilities
- **QR Code Generator** — create QR codes for URLs, Wi-Fi, contact info, and more, with ready-made templates.
- **Unit Converter** — convert between lengths, weights, temperatures, and data sizes.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router) + TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com) + custom glassmorphism design system
- **State**: Redux Toolkit (RTK)
- **Media Engine**: [mediabunny](https://github.com/hussain-ahmed2/mediabunny) & FFmpeg WASM for blazing fast, local media conversion
- **PDF Engine**: [pdf-lib](https://pdf-lib.js.org), pdfjs-dist, and qpdf (WebAssembly)
- **Testing**: [vitest](https://vitest.dev)

## Author
Developed and maintained by **[Hussain Ahmed](https://github.com/hussain-ahmed2)**.

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
