# Image Tools Suite — Logs

## 2026-08-23 — Initial Planning

### Research Findings
- Searched popular web tools (CloudConvert, FreeConvert, Ezgif, Squoosh, remove.bg, etc.)
- Identified 121+ possible image tools, filtered to 27 that are fully client-side feasible
- Organized into 8 batches by complexity and dependency requirements

### Current State Analysis
- 5 existing image tools follow consistent pattern
- Pattern: feature dir + route + registry entry + shared components
- Existing libs: `browser-image-compression`, `exifr`, `qrcode`, `svgo`

### Decisions
- All tools must run 100% client-side (no server processing)
- Follow existing code patterns (no Redux for new tools, use local state + hooks)
- Batch by complexity to validate pattern before scaling
- No `any` types — use `unknown` or precise type definitions

### New Dependencies to Verify
- `gif.js` — GIF encoding library
- `gifuct.js` — GIF decoding library
- `jsQR` — QR code reading
- `JsBarcode` — Barcode generation
- `html2canvas` — HTML → Image
- `tesseract.js` — OCR via WASM
- `onnxruntime-web` — AI inference via WASM

## 2026-08-23 — Batch 1 Complete

### Built (5 tools)
1. `image-rotate` — Rotate 90/180/270 + flip H/V via Canvas API
2. `image-color-picker` — Click pixel → HEX/RGB/HSL via Canvas getImageData
3. `image-base64` — Image ↔ Base64 data URI encode/decode
4. `image-placeholder` — Generate solid, gradient, checkerboard, text, noise placeholders
5. `image-crop` — Visual crop with aspect ratio locks (1:1, 4:3, 16:9, etc.)

### Registry Refactor
- Split `tool-registry.ts` (512 lines) into `registry/` directory:
  - `types.ts` — ToolCategory, ToolDefinition types
  - `icons.ts` — Lucide imports, ToolIconName, TOOL_ICON_MAP
  - `pdf.ts` — 17 PDF tools
  - `images.ts` — 10 image tools
  - `security.ts` — 2 security tools
  - `video-audio.ts` — 1 video/audio tool
  - `utilities.ts` — 12 utility tools
  - `index.ts` — merges all, exports tools array + helpers
- Original `tool-registry.ts` now re-exports from `registry/` for backwards compatibility

### Issues Fixed
- `FileDropzone` API: uses `onFiles` callback + string `accept` (not object)
- Form values are strings from `useWatch` — cast to Number when needed
- `Shadow` and `Blur` icons don't exist in lucide-react → replaced with `Droplet` and `CloudFog`
- `LucideIcon` type needs explicit `export type` for re-export to work
