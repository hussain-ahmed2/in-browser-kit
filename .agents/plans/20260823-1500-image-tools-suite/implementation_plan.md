# Image Tools Suite — Implementation Plan

## Overview
Add 27 new client-side image tools to the In-Browser Kit, organized into 8 batches by complexity. Total image tools will go from 5 → 32.

## Current Image Tools (5)
- `image-compressor` — Image Compressor
- `image-resize` — Resize & Convert
- `svg-optimizer` — SVG Optimizer
- `image-watermarker` — Image Watermarker
- `image-metadata` — Image Metadata

## Existing Pattern (replicate for each tool)
Each tool follows:
1. `src/features/{slug}/components/{Name}Page.tsx` — main client component
2. `src/features/{slug}/lib/{name}.ts` — pure processing functions
3. `src/features/{slug}/types/index.ts` — Zod schema + TS types (if form needed)
4. `src/app/tools/{slug}/page.tsx` — thin route wrapper
5. Registry entry in `tool-registry.ts` (icon, slug, name, tagline, category)

Shared components: `FileDropzone`, `StepIndicator`, `Card`, form fields, `StructuredData`, `sonner` toast.

## Batch 1 — Canvas-Only (no new deps)
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 1 | `image-rotate` | Rotate & Flip | Rotate images by any angle and flip horizontally or vertically. | `RotateCw` |
| 2 | `image-color-picker` | Color Picker | Pick any color from an image and get HEX, RGB, and HSL values. | `Pipette` |
| 3 | `image-base64` | Image ↔ Base64 | Encode images to Base64 data URIs and decode them back. | `Binary` |
| 4 | `image-placeholder` | Placeholder Generator | Generate colored or textured placeholder images at any size. | `Square` |
| 5 | `image-crop` | Image Crop | Visually crop images with free or locked aspect ratios. | `Crop` |

**Processing**: All use Canvas API (`drawImage`, `getImageData`, `toBlob`). No external libraries.

## Batch 2 — Filters & Format Conversion
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 6 | `image-filters` | Filters & Effects | Apply brightness, contrast, blur, sepia, grayscale, and more. | `Sparkles` |
| 7 | `image-format-converter` | Format Converter | Convert between JPG, PNG, WebP, BMP, TIFF, and AVIF. | `ArrowLeftRight` |
| 8 | `image-favicon` | Favicon Generator | Create multi-size favicons and apple-touch-icons from any image. | `Globe` |
| 9 | `image-info` | Image Info Viewer | View DPI, color space, file size, dimensions, and ICC profile. | `Info` |

**Processing**: Canvas `toBlob()` for format conversion, `browser-image-compression` for resize/compress helpers.

## Batch 3 — GIF & Animation
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 10 | `image-gif-maker` | GIF Maker | Create animated GIFs from a sequence of images. | `Film` |
| 11 | `image-gif-extractor` | GIF Frame Extractor | Extract individual frames from animated GIFs. | `Images` |
| 12 | `image-gif-optimizer` | GIF Optimizer | Reduce GIF file size by optimizing colors and frames. | `Minimize2` |

**New deps**: `gif.js` (GIF encoding), `gifuct.js` (GIF decoding)

## Batch 4 — Overlay & Compositing
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 13 | `image-annotate` | Image Annotate | Draw arrows, shapes, and text on images. | `PenTool` |
| 14 | `image-collage` | Collage Maker | Combine multiple photos into a beautiful collage layout. | `LayoutGrid` |
| 15 | `image-comparator` | Image Diff | Compare two images side-by-side, overlay, or pixel diff. | `GitCompare` |
| 16 | `image-drop-shadow` | Drop Shadow | Add configurable drop shadows to images. | `Shadow` |
| 17 | `image-border` | Image Border | Add decorative borders, frames, and rounded corners. | `Frame` |
| 18 | `image-overlay` | Image Overlay | Layer one image on another with opacity and blend modes. | `Layers` |
| 19 | `image-histogram` | Image Histogram | View RGB and luminance channel distributions. | `BarChart3` |

**Processing**: Canvas `globalCompositeOperation`, `getImageData`, `putImageData`.

## Batch 5 — Social & Presets
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 20 | `image-social-resizer` | Social Media Resizer | Resize images to exact dimensions for Instagram, X, LinkedIn, and more. | `Share2` |
| 21 | `image-profile-pic` | Profile Picture Maker | Crop any photo into a perfect circle or square profile picture. | `User` |
| 22 | `image-meme` | Meme Generator | Add top and bottom text to images with font controls. | `Laugh` |

**Processing**: Canvas resize with preset dimensions, text rendering.

## Batch 6 — QR, Barcode & Metadata
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 23 | `image-qr-reader` | QR Code Reader | Scan and decode QR codes and barcodes from images. | `ScanLine` |
| 24 | `image-barcode` | Barcode Generator | Generate barcodes in Code128, EAN-13, and more formats. | `Barcode` |
| 25 | `image-exif-stripper` | EXIF Stripper | Remove all EXIF metadata (GPS, camera info) before sharing. | `Shield` |

**New deps**: `jsQR` (QR reading), `JsBarcode` (barcode generation)
**Existing dep**: `exifr` (EXIF reading, already installed)

## Batch 7 — Developer Tools
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 26 | `image-css-sprite` | CSS Sprite Generator | Combine images into a sprite sheet with auto-generated CSS. | `Grid3x3` |
| 27 | `image-html-to-image` | HTML to Image | Screenshot any HTML snippet or URL as a PNG image. | `Camera` |
| 28 | `image-lazy-placeholder` | Lazy Load Placeholder | Generate tiny blurred thumbnails for lazy loading. | `Blur` |

**New deps**: `html2canvas` (HTML → Image)

## Batch 8 — Advanced (WASM/ML)
| # | Slug | Name | Tagline | Icon |
|---|------|------|---------|------|
| 29 | `image-ascii` | Image to ASCII Art | Convert any image into text-based ASCII art. | `Terminal` |
| 30 | `image-steganography` | Steganography | Hide secret text data inside images using LSB encoding. | `EyeOff` |
| 31 | `image-ocr` | OCR Text Recognition | Extract text from images in 10+ languages using Tesseract.js. | `FileText` |
| 32 | `image-ai-upscaler` | AI Image Upscaler | Upscale images 2x or 4x using Real-ESRGAN neural network. | `Maximize` |

**New deps**: `tesseract.js` (OCR WASM), `onnxruntime-web` (AI inference WASM)

## New Dependencies Summary
| Package | Version | Batch | Purpose |
|---------|---------|-------|---------|
| `gif.js` | latest | 3 | GIF encoding |
| `gifuct.js` | latest | 3 | GIF decoding |
| `jsQR` | latest | 6 | QR code reading |
| `JsBarcode` | latest | 6 | Barcode generation |
| `html2canvas` | latest | 7 | HTML → Image |
| `tesseract.js` | latest | 8 | OCR (WASM) |
| `onnxruntime-web` | latest | 8 | AI inference (WASM) |

## Shared Components to Reuse
- `@/features/tools/components/ToolPage` — page layout
- `@/components/FileDropzone` — file upload
- `@/components/StepIndicator` — step progress
- `@/components/ui/card` — Card, CardHeader, CardContent
- `@/components/ui/button` — Button
- `@/components/ui/alert` — Alert
- `@/components/form/*` — InputField, SelectField, SliderField
- `@/components/StructuredData` — JSON-LD
- `sonner` — toast notifications
- `lucide-react` — icons

## Rules Compliance
- No `any` types (use `unknown` or precise types)
- No margin/sizing classes on SVG icons in Shadcn buttons
- All planning artifacts in `.agents/plans/`
- Verify new deps before installing (web search)
