# WebCodecs Editor Migration Plan

This plan outlines the architecture and steps required to upgrade our in-browser media converter to a high-performance, hardware-accelerated video editor (similar to Clipchamp) using the WebCodecs API and WebGL.

## Background Context
Currently, the application uses FFmpeg compiled to WebAssembly (WASM) to process video entirely on the CPU. While reliable, this approach lacks hardware acceleration, limiting speeds to around 0.5x - 3.5x real-time depending on quality settings. Modern in-browser video editors utilize the WebCodecs API, which hooks into the device's native GPU/hardware encoders (e.g., NVENC, VideoToolbox) to achieve massive performance gains (5x-10x real-time) while saving battery.

## User Review Required

> [!WARNING]
> WebCodecs is a relatively new API. While fully supported in modern Chromium browsers and Safari, Firefox support is still experimental or disabled by default in some configurations. We **must** maintain the current FFmpeg WASM implementation as a fallback.

## Open Questions

> [!IMPORTANT]
> 1. Do we want to build a full multi-track timeline UI first, or start by integrating WebCodecs for a simple "Trim" feature?
> 2. What libraries should we use for demuxing? `mp4box.js` is standard for WebCodecs, but we should confirm if you have a preference.

## Proposed Changes

### 1. WebCodecs Integration Layer
We will implement a new hook and service to manage WebCodecs.

#### [NEW] [useWebCodecs.ts](file:///d:/Code/Web/NextJS/in-browser-kit/src/features/media-converter/hooks/useWebCodecs.ts)
A React hook that determines if the browser supports `VideoEncoder` and `VideoDecoder`. If supported, it initializes the WebCodecs pipeline. If not, it falls back to `useFFmpegService.ts`.

#### [NEW] [webCodecsService.ts](file:///d:/Code/Web/NextJS/in-browser-kit/src/features/media-converter/lib/webCodecsService.ts)
A utility service that handles the low-level logic:
- Demuxing the MP4 container (using `mp4box.js`).
- Feeding compressed chunks into `VideoDecoder`.
- Taking raw `VideoFrame` objects and feeding them into `VideoEncoder`.
- Muxing the encoded chunks back into an MP4 container (using `mp4-muxer`).

### 2. Rendering and Effects Pipeline
To support visual effects, we will implement an offscreen canvas rendering loop.

#### [NEW] [canvasRenderer.ts](file:///d:/Code/Web/NextJS/in-browser-kit/src/features/media-converter/lib/canvasRenderer.ts)
A utility that takes a raw `VideoFrame` from the decoder, draws it to an `OffscreenCanvas`, applies any user-selected WebGL filters (brightness, crop, grayscale), and produces a new frame for the encoder.

### 3. User Interface Updates
We will upgrade the UI from a simple "Convert" form to an interactive editor.

#### [MODIFY] [MediaConverterPage.tsx](file:///d:/Code/Web/NextJS/in-browser-kit/src/features/media-converter/components/MediaConverterPage.tsx)
- Replace the simple form with a preview player.
- Add an interactive timeline component for trimming (Start Phase 1).
- Add a "Hardware Acceleration" toggle (enabled by default if supported) to let users switch between WebCodecs and FFmpeg WASM.

## Verification Plan

### Automated Tests
- N/A for this phase, we will rely on manual browser testing given the hardware-specific nature of WebCodecs.

### Manual Verification
- Test conversion on Chrome (Windows/Mac) to verify WebCodecs hardware encoding is active (check `chrome://media-internals`).
- Test conversion on Firefox to verify the fallback logic successfully routes to FFmpeg WASM.
- Verify that a 1080p MP4 file converts significantly faster via WebCodecs compared to the previous WASM approach.
