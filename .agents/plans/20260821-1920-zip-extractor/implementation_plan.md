# Implementation Plan: ZIP Archive Viewer / Extractor

## Overview
Build a high-performance, fully client-side **ZIP Archive Viewer & Extractor** utilizing `jszip` to allow users to view inside archives and extract individual files locally.

## Proposed Changes

### Dependencies
- Install `jszip`.

### Core Implementation
- **Tool Registry (`src/features/tools/tool-registry.ts`)**: Register `FileArchive` icon and add `zip-extractor`.
- **Page Wrapper (`src/app/tools/zip-extractor/page.tsx`)**: Wrap the UI in the standard `<ToolPage>`.
- **Component (`src/features/zip-extractor/components/ZipExtractorPage.tsx`)**:
  - **Upload Zone**: A dropzone or file input strictly accepting `.zip`.
  - **Explorer Table**: A table detailing the contents (Name, Size, Type) of the ZIP.
  - **Selective Extraction**: Action buttons on rows to trigger `zipEntry.async('blob')` and seamlessly download just that file.

## Verification Plan
- Upload a ZIP containing various files.
- Verify the table accurately represents the internal folder/file structure.
- Selectively download a specific file to test client-side extraction.
