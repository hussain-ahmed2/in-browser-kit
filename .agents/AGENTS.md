<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI and Styling Rules

- **Shadcn Buttons**: Never add margin classes (like `mr-2` or `ml-2`) or sizing classes (like `size-4` or `h-4 w-4`) to SVG icons inside Shadcn `<Button>` components. The Shadcn button component automatically applies `gap-2` for spacing and handles the SVG sizes automatically via its internal selectors.

# TypeScript & FFmpeg Rules

- **No `any` Types**: NEVER use the `any` type in TypeScript under any circumstances. If you are importing a dynamic module or dealing with complex generics, use `unknown`, precise type definitions, or `typeof import("package")`.
- **FFmpeg Enums**: Never import `FFFSType` or other enums from `@ffmpeg/ffmpeg` at runtime. The `@ffmpeg/ffmpeg` package has broken ESM/SSR exports for its enums, and importing them will crash Next.js (e.g. `Export FFFSType doesn't exist in target module`). Instead, use the literal string and cast it (e.g., `"WORKERFS" as any`) and disable the linter for that line.

# Agent Planning & Execution Rules

- **Persistent Planning Directory**: Whenever you (or any other agent) are tasked with creating an implementation plan or a significant feature, you MUST persist your planning artifacts in the repository under `.agents/plans/`.
- **Directory Structure**: Create a dedicated directory for each plan using the format: `.agents/plans/<YYYYMMDD-HHMM>-<feature-name>/`.
- **Required Files**: Inside the plan directory, you must maintain the following files:
  1. `implementation_plan.md` - The detailed technical plan and proposed changes.
  2. `progress.md` - A living document or task list (like a checklist) to track what has been completed.
  3. `logs.md` - A record of decisions made, bugs encountered, or important findings during execution.

# Research & Dependency Rules

- **Verify Before Installing**: Never blindly install npm packages based on your pre-trained knowledge, especially for rapidly evolving web APIs (like WebCodecs). You MUST use web search to verify the latest standard libraries and check for deprecations (e.g., `mp4-muxer` is deprecated in favor of `mediabunny`).
- **Read Official Docs**: Always read the official documentation of a new library or Web API before attempting a complex implementation.
