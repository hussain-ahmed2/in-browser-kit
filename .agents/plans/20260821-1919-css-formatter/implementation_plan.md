# Implementation Plan: CSS Formatter & Minifier

## Overview
Build a purely client-side **CSS Formatter & Minifier** to pretty-print messy stylesheets or compress them for production.

## Proposed Changes

### Dependencies
- Install `prettier` to utilize its standalone browser plugins for perfect CSS formatting.

### Core Implementation
- **Tool Registry (`src/features/tools/tool-registry.ts`)**: Register `Paintbrush` icon from `lucide-react` and add `css-formatter`.
- **Page Wrapper (`src/app/tools/css-formatter/page.tsx`)**: Wrap the UI in the standard `<ToolPage>`.
- **Component (`src/features/css-formatter/components/CssFormatterPage.tsx`)**:
  - **Mode Toggle**: `Format` vs `Minify`.
  - **Input/Output**: Side-by-side textareas for instant conversion.
  - **Actions**: Enhanced Copy to Clipboard (with success visual feedback) and Clear.

## Verification Plan
- Paste a massive, unformatted block of CSS and verify it formats cleanly.
- Verify minification strips all spaces and comments accurately.
