# Implementation Plan: Text & Code Diff Checker

## Overview
Build a highly responsive, purely client-side **Text & Code Diff Checker** to compare two blocks of text/code and visually highlight insertions and deletions. This tool will be added to the "Utilities" category of the platform.

## Proposed Changes

### Dependencies
- Install the lightweight `diff` library and `@types/diff` which provides powerful, client-side text differencing algorithms (lines, words, characters) without needing a heavy UI wrapper.

### Core Implementation
- **Tool Registry (`src/features/tools/tool-registry.ts`)**: Register `FileDiff` icon from `lucide-react` and add `diff-checker` to the tools registry under the `Utilities` category.
- **Page Wrapper (`src/app/tools/diff-checker/page.tsx`)**: Standard Next.js App Router page wrapper that leverages the `<ToolPage>` layout.
- **Component (`src/features/diff-checker/components/DiffChecker.tsx`)**:
  - **Input UI**: A responsive two-pane input area for "Original Text" and "Modified Text".
  - **Options**: A toggle to switch between **Word Diff** and **Line Diff**.
  - **Output UI**: A beautifully styled results pane that maps the output of the `diff` library to DOM elements, highlighting additions in green and deletions in red.

## Verification Plan
- The user will be able to load the page at `/tools/diff-checker`.
- Paste two slightly different blocks of text/code into the input fields.
- Instantly see a beautifully formatted diff highlight result entirely offline.
