# PDF Compressor Fix Plan

## Root Cause Analysis

Exit code `495600` (hex `0x78E00`) is a WASM-level crash from qpdf, NOT a qpdf CLI exit code. Standard qpdf exit codes are 0, 2, or 3.

### How qpdf-run works (from source code analysis)

1. `createBrowserQpdfRunner()` creates a Web Worker that loads `qpdf.js` + `qpdf.wasm`
2. `runOne()` calls `run()` which sends `{type:'run', inputs, args, outputs}` to the worker
3. Worker writes inputs to MEMFS, calls `callMain(args)`, reads outputs from MEMFS
4. The `quit(status, toThrow)` function in the Emscripten Module throws when qpdf exits abnormally
5. `executeQpdf()` catches the throw, checks `getExitStatus()`, and re-throws if status is 0

### What the qpdf-run README actually documents

Only these flags appear in examples:
- `--linearize` (with `--` separator)
- `--object-streams=disable` (NOT `generate`)
- `--decode-level=all` (NOT `general`)
- `--qdf`

### What pdf-lock uses (working code)

```typescript
// Lock: uses -- separator
['--encrypt', userPassword, ownerPassword, '256', '--print=full', '--modify=none', '--extract=n', '--', 'input.pdf', 'output.pdf']

// Unlock: NO -- separator
['--decrypt', `--password=${password}`, 'input.pdf', 'output.pdf']
```

### What my compressor sends (crashing)

```typescript
['--object-streams=generate', '--decode-level=general', '--linearize', '--', 'input.pdf', 'output.pdf']
```

**Three likely issues:**
1. `--object-streams=generate` may not be supported by the bundled qpdf WASM version (only `disable` is documented)
2. `--decode-level=general` may not be valid (only `all` is documented)
3. Combining `--linearize` with `--object-streams` and `--decode-level` may be invalid — `--linearize` performs its own optimization pass

## Plan

### Step 1: Test minimal args first
Replace `buildCompressArgs` with just `['--linearize', '--', 'input.pdf', 'output.pdf']` to verify the runner works at all with this file.

### Step 2: Build args conservatively
Only use flags documented in qpdf-run README:
- `--linearize` for web mode
- `--object-streams=disable` + `--decode-level=all` for QDF/debug mode (not compression)

### Step 3: Simplify the UI
Since qpdf's compression capabilities are limited (structural optimization only, not lossy compression), simplify to:
- **Web Optimized**: `--linearize` (the only well-documented flag)
- **Maximum**: `--linearize` + `--object-streams=disable` + `--decode-level=all` (QDF-style, may not reduce size)

### Step 4: Add proper error reporting
Show stdout/stderr to the user on failure so we can debug further.

## Files to modify
- `src/features/pdf-compressor/hooks/usePdfCompressor.ts` — fix args, error handling
- `src/features/pdf-compressor/components/CompressOptions.tsx` — simplify options
- `src/features/pdf-compressor/components/CompressWorkspace.tsx` — update UI
