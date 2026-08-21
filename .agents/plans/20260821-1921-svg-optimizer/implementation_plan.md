# Implementation Plan: SVG Optimizer

## Overview
Build a fully client-side **SVG Optimizer** utilizing `svgo` to strip bloat and reduce SVG file sizes dramatically.

## Proposed Changes

### Dependencies
- Install `svgo` and utilize its browser bundle.

### Core Implementation
- **Tool Registry (`src/features/tools/tool-registry.ts`)**: Register `Scissors` icon and add `svg-optimizer`.
- **Page Wrapper (`src/app/tools/svg-optimizer/page.tsx`)**: Wrap the UI in the standard `<ToolPage>`.
- **Component (`src/features/svg-optimizer/components/SvgOptimizerPage.tsx`)**:
  - **Input/Output Textareas**: For pasting and copying raw markup.
  - **Visual Preview**: Visual renders of the before/after SVGs.
  - **Metrics**: Track and display byte sizes and compression savings.

## Verification Plan
- Paste a bloated SVG from Figma/Illustrator.
- Verify size reduction and visual integrity.
