# Implementation Plan: URL Encoder / Decoder

## Overview
Build a lightning-fast, purely client-side **URL Encoder & Decoder** tool to cleanly format URL strings and query parameters for safe network transmission.

## Proposed Changes

### Dependencies
- None! We will leverage the highly optimized, native browser APIs (`encodeURIComponent` and `decodeURIComponent`).

### Core Implementation
- **Tool Registry (`src/features/tools/tool-registry.ts`)**: Register `Link` icon from `lucide-react` and add `url-encoder` to the tools registry.
- **Page Wrapper (`src/app/tools/url-encoder/page.tsx`)**: Wrap the UI in the standard `<ToolPage>`.
- **Component (`src/features/url-encoder/components/UrlEncoderPage.tsx`)**:
  - **Mode Toggle**: `Encode` vs `Decode`.
  - **Input/Output**: Side-by-side textareas for instant conversion.
  - **Error Handling**: Graceful error UI for malformed URIs during decoding.
  - **Actions**: Copy to Clipboard and Clear.

## Verification Plan
- Paste a URL with spaces and emojis and verify it encodes perfectly.
- Verify decoding of complex query parameters works flawlessly.
