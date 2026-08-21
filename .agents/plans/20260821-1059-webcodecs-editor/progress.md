# Progress Tracker: WebCodecs Editor Migration

- [x] **Phase 1: Basic FFmpeg Trimming**
  - [x] Add trimming controls (start/end sliders) to UI.
  - [x] Pass `-ss` and `-to` to FFmpeg based on UI input.
  - [x] Render a basic video preview for trimming selection.
- [x] **Phase 2: WebCodecs Hardware Acceleration**
  - [x] Integrate `mediabunny` as the hardware engine.
  - [x] Implement `useWebCodecs` hook with capability detection.
  - [x] Configure fallback routing to FFmpeg WASM when WebCodecs is unsupported or fails.
  - [x] Add Hardware Acceleration toggle to UI.
  - [x] Implement WebCodecs Trimming (`trimStart`, `trimEnd`).
- [ ] **Phase 3: Real-Time Filters (Canvas/WebGL)**
  - [ ] Draw `VideoFrame` to an offscreen `<canvas>`.
  - [ ] Implement WebGL shaders for basic filters (brightness, contrast, grayscale).
  - [ ] Capture the canvas stream and feed it into the `VideoEncoder`.
- [ ] **Phase 4: Timeline UI**
  - [ ] Build a multi-track timeline component.
  - [ ] Synchronize video playback with the timeline state.
