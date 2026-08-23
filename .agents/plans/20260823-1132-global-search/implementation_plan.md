# Global Search & Hero Redesign Plan

## Overview
Based on user feedback and project rules, this plan outlines the addition of a global `Cmd+K` Command Palette and an integrated live search input in the Landing Page Hero section.

## 1. Dependencies & UI Components
- Run `pnpm dlx shadcn@latest add dialog command` to install the required base primitives for the global search palette.

## 2. Hero Section Search (Client-Side Filtering)
- **File**: `src/app/page.tsx`
- **Changes**:
  - Convert the page to a Client Component (`"use client"`) to manage local search state.
  - Insert a large `<Input>` component inside a stylized `<FieldGroup>` in the center of the hero section.
  - Bind the input to dynamically filter the `availableTools` grid below it.
  - Ensure inputs strictly follow the `shadcn` rule: Form inputs must use `FieldGroup` and `Field`.

## 3. Global Command Palette
- **File**: `src/components/GlobalSearch.tsx`
- **Changes**:
  - Build a `CommandDialog` listener that responds to `Cmd+K` / `Ctrl+K`.
  - Iterate through `tools` from `src/features/tools/tool-registry.ts`.
  - Provide fuzzy searching across tool names, taglines, and categories.
  - On select, navigate to the tool URL.

## 4. Header Integration
- **File**: `src/components/Header.tsx` (or equivalent layout header)
- **Changes**:
  - Add a `<Button variant="outline">` with a `SearchIcon` to the navbar.
  - Ensure icon sizing follows `shadcn` rules (use `data-icon`, NO `size-4` utility classes on the SVG).

## User Review Required
Please review this plan. Because the environment PATH does not include `pnpm`, you will need to run the `shadcn` install command manually when we proceed:
`pnpm dlx shadcn@latest add dialog command`
