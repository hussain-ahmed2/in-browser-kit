# PDF Compressor Rewrite Plan

## Problem
qpdf-run is a PDF transformer (encrypt, merge, split), NOT a compressor. It cannot reduce file size — `--linearize` just restructures for progressive loading, and the WASM crashes on compression flags.

## Solution
Rewrite using `pdf-lib` + `pdfjs-dist` (already installed). Two strategies:

### Strategy 1: Lossless (fast, ~15-25% savings)
- Load PDF with `PDFDocument.load()`
- Re-save with `pdfDoc.save({ useObjectStreams: true })`
- Source: pdf-lib docs — `useObjectStreams` packs objects into compressed streams
- Preserves text selectability, fonts, vectors

### Strategy 2: Lossy (slower, ~60-90% savings)
- Render each page to canvas with `pdfjs-dist` at configurable DPI
- Export canvas as JPEG at configurable quality
- Build new PDF with `pdf-lib` using `embedJpg()`
- Source: Multiple production tools use this exact approach (Ultimate Tools, QuickTools.one)
- Text becomes non-selectable images — warn user

### Strategy 3: Smart (recommended)
- Try lossless first
- Compare output size vs original
- If savings < 20%, offer lossy option to user
- Return smallest result

## Architecture

### Files to modify
- `hooks/usePdfCompressor.ts` — complete rewrite, remove qpdf-run
- `components/CompressOptions.tsx` — add quality/DPI controls for lossy mode
- `components/CompressWorkspace.tsx` — update UI
- `components/PdfCompressorPage.tsx` — update UI

### New hook API
```typescript
interface CompressConfig {
  mode: "lossless" | "lossy" | "smart";
  quality: number;      // 0.1-1.0, JPEG quality for lossy
  scale: number;        // 0.5-3.0, render scale for lossy
}

interface CompressResult {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  strategy: "lossless" | "lossy";
  pageCount: number;
}
```

### Core compression functions
```typescript
// Lossless: re-save with object streams
async function compressLossless(input: ArrayBuffer): Promise<Uint8Array>

// Lossy: render to canvas + JPEG re-encode
async function compressLossy(input: ArrayBuffer, quality: number, scale: number, onProgress?): Promise<Uint8Array>

// Smart: try lossless, fall back to lossy if needed
async function compressSmart(input: ArrayBuffer, quality: number, scale: number): Promise<CompressResult>
```

### UI Presets
| Mode | Quality | Scale | Best for |
|------|---------|-------|----------|
| Lossless | N/A | N/A | Text documents, forms |
| Balanced | 0.7 | 1.5 | General use |
| Maximum | 0.5 | 1.0 | Scanned docs, images |

## Tradeoffs to communicate to user
- Lossless: preserves everything, modest savings
- Lossy: dramatic savings, but text becomes images (no search/select)
- Neither approach works well on already-optimized PDFs

## Sources
- pdf-lib save options: https://github.com/Hopding/pdf-lib/blob/master/src/api/PDFDocument.ts
- Canvas re-encoding approach: https://dev.to/shaishav_patel_271fdcd61a/compress-pdf-in-the-browser-without-a-server-how-it-works-pdf-lib-web-workers-14pb
- Lossless vs lossy tradeoffs: https://loopaloo.com/blog/reading-and-writing-pdfs-in-javascript/
