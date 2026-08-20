<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# UI and Styling Rules

- **Shadcn Buttons**: Never add margin classes (like `mr-2` or `ml-2`) or sizing classes (like `size-4` or `h-4 w-4`) to SVG icons inside Shadcn `<Button>` components. The Shadcn button component automatically applies `gap-2` for spacing and handles the SVG sizes automatically via its internal selectors.
