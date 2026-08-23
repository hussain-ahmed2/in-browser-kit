"use client"

import type { ToolIconName } from "@/features/tools/tool-registry"
import { TOOL_ICON_MAP } from "@/features/tools/tool-registry"

interface ToolIconProps {
    name: ToolIconName
    className?: string
    size?: number | string
    "aria-hidden"?: boolean | string
}

export function ToolIcon({ name, className, size, "aria-hidden": ariaHidden }: ToolIconProps) {
    const Icon = TOOL_ICON_MAP[name]
    if (!Icon) return null
    return <Icon className={className} size={size} aria-hidden={ariaHidden === "true" || ariaHidden === true} />
}