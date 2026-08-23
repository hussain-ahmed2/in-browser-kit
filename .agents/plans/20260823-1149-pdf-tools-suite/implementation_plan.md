# Comprehensive PDF Tools Suite Implementation Plan

## Goal
Expand the current InBrowser PDF toolkit (7 tools) to a comprehensive suite of 20+ tools that rivals market leaders (iLovePDF, Smallpdf), while keeping everything 100% local/client-side using `pdf-lib`, `pdf.js`, and `qpdf-run` WebAssembly.

## Proposed New Tools (Client-Side)

### 1. Document Organization & Editing
- **Organize PDF:** Visual drag-and-drop interface to reorder pages (using existing `@dnd-kit` + `pdf-lib`).
- **PDF Cropper:** Crop page margins visually by modifying the PDF CropBox array.
- **PDF Watermarker:** Add customizable text or image watermarks with opacity and rotation controls.
- **Add Page Numbers:** Automatically stamp sequential page numbers (e.g., "Page 1 of 10") across the document.

### 2. Extraction & Conversion
- **Extract PDF Images:** Parse the PDF structure (using `pdfjs-dist` or `qpdf`) to extract all embedded JPEGs/PNGs into a ZIP file.
- **PDF to Text / Markdown:** Extract raw text from the PDF using `pdfjs-dist` and format it cleanly.
- **Flatten PDF:** Burn form fields and interactive annotations into the PDF layers so they can no longer be edited.

### 3. Utility & Security
- **PDF Metadata Editor:** View and modify hidden metadata (Title, Author, Subject, Keywords).
- **PDF Signer:** A canvas interface to draw, type, or upload a signature and stamp it onto the PDF.
- **PDF Redactor:** Draw black boxes over sensitive information and flatten the document (Note: true text redaction client-side is complex, this will be visual obfuscation + flattening).

### 4. Advanced / WASM Powered
- **PDF Compressor:** Use `qpdf-run` (already installed) to linearize the PDF, remove object streams, and strip unused objects to reduce file size.

## Open Questions & User Review Required

> [!WARNING]
> **Format Conversions (Office ↔ PDF)**
> Competitors offer "Word to PDF" or "PDF to Excel". These require a full rendering engine (like Microsoft Office or LibreOffice). Doing this **100% client-side** in the browser is nearly impossible without shipping a 50MB+ WebAssembly port of LibreOffice, or relying on a server API.
> 
> **Question:** Do you want to skip Office format conversions to maintain the "100% offline/local" promise, or do you want to implement them via an external API route?

> [!TIP]
> **PDF Compression Limits**
> Client-side PDF compression is limited. We can strip metadata and optimize structure using `qpdf`, but we cannot easily downsample all embedded high-res JPEGs without rendering the entire PDF to a canvas and rebuilding it (which degrades quality). Are you okay with "light" structural compression?

## Verification Plan
- Build the core logic for the easiest tools first (Watermark, Numbering, Metadata, Organize) using `pdf-lib`.
- Test `pdf.js` text extraction on a sample PDF for the PDF-to-Text tool.
- Test `qpdf-run` WebAssembly compilation for the compressor.
