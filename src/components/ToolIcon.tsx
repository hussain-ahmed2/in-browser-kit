"use client"

import {
    Image,
    FileDown,
    KeyRound,
    Fingerprint,
    Scissors,
    RotateCw,
    FileX2,
    LockKeyhole,
    Crop,
    FileImage,
    QrCode,
    Code,
    Braces,
    Ruler,
    Search,
    type LucideIcon
} from "lucide-react"
import type { ToolIconName } from "@/features/tools/tool-registry"

const iconMap: Record<ToolIconName, LucideIcon> = {
    Image,
    FileDown,
    KeyRound,
    Fingerprint,
    Scissors,
    RotateCw,
    FileX2,
    LockKeyhole,
    Crop,
    FileImage,
    QrCode,
    Code,
    Braces,
    Ruler,
    Search
}

interface ToolIconProps {
    name: ToolIconName
    className?: string
    size?: number | string
    "aria-hidden"?: boolean | string
}

export function ToolIcon({ name, className, size, "aria-hidden": ariaHidden }: ToolIconProps) {
    const Icon = iconMap[name]
    if (!Icon) return null
    return <Icon className={className} size={size} aria-hidden={ariaHidden === "true" || ariaHidden === true} />
}