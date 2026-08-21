# Implementation Plan: CSV ↔ JSON Converter

## Overview
Build a high-performance, strictly client-side **CSV ↔ JSON Converter** to translate CSV into structured JSON arrays, and vice-versa, without uploading sensitive data to a server.

## Proposed Changes

### Dependencies
- Install `papaparse` and `@types/papaparse` for robust, high-speed CSV parsing.

### Core Implementation
- **Tool Registry (`src/features/tools/tool-registry.ts`)**: Register `Table` icon from `lucide-react` and add `csv-json-converter` to the tools registry.
- **Page Wrapper (`src/app/tools/csv-json-converter/page.tsx`)**: Wrap the UI in the standard `<ToolPage>`.
- **Component (`src/features/csv-json/components/CsvJsonConverter.tsx`)**:
  - **Direction Toggle**: `CSV ➡️ JSON` vs `JSON ➡️ CSV`.
  - **Input/Output**: Side-by-side textareas for instant conversion.
  - **Options**: Delimiter selection, Header Row toggle, and Pretty Print.
  - **Actions**: Copy to Clipboard and Download File.

## Verification Plan
- Paste a complex CSV string with quoted commas and verify the output instantly translates to valid JSON.
- Verify the reverse (JSON to CSV) successfully generates valid CSV rows.
