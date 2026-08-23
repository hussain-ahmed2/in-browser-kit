# PDF Compressor Implementation Plan

## Goal
Implement a client-side PDF compression tool using `qpdf-run` WASM that reduces file sizes through structural optimization.

## Architecture

### Pattern: Local Hooks (not Redux)
Following the newer tool pattern (pdf-flatten, pdf-cropper, pdf-watermark). Simple flow: Upload -> Configure -> Compress -> Download.

### File Structure
```
src/features/pdf-compressor/
  hooks/usePdfCompressor.ts
  components/PdfCompressorPage.tsx
src/app/tools/pdf-compressor/
  page.tsx
```

## Implementation Details

### 1. usePdfCompressor.ts

**State:**
- file, originalSize, compressConfig, progress, downloadUrl, resultSize

**CompressConfig:**
- linearize (boolean) - web-optimized
- recompressFlate (boolean) - re-compress Flate streams
- objectStreams ('generate' | 'disable' | 'preserve')
- decodeLevel ('general' | 'all' | 'none')

**qpdf args builder:**
- --linearize (if enabled)
- --recompress-flate (if enabled)
- --object-streams=X
- --decode-level=X
- -- input.pdf output.pdf

**Runner pattern:** Same as pdf-lock (dynamic import, 60s timeout, destroy after use)

### 2. PdfCompressorPage.tsx

**UI Flow:**
1. Upload via PdfUploader
2. Show original size + compression options panel
3. Compress button -> spinner -> PdfResult with size comparison

**Options panel:**
- Toggle: Optimize for web (linearize)
- Toggle: Recompress streams
- Select: Object streams (Generate/Disable/Preserve)
- Select: Decode level (General/All/None)

### 3. Route Page

Standard pattern with StructuredData and toolMetadata.

### 4. Tool Registry

Remove `planned: true` from pdf-compressor entry.
