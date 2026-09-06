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
  KeySquare,
  ScanSearch,
  Film,
  FileDiff,
  Table,
  Link2,
  Paintbrush,
  FileArchive,
  Stamp,
  LayoutGrid,
  FileText,
  PenTool,
  Hash,
  ListOrdered,
  Layers,
  Pipette,
  Binary,
  Square,
  Sparkles,
  ArrowLeftRight,
  Globe,
  Info,
  Images,
  Minimize2,
  GitCompare,
  Droplet,
  Frame,
  BarChart3,
  Share2,
  User,
  Laugh,
  ScanLine,
  Barcode,
  Shield,
  Grid3x3,
  Camera,
  CloudFog,
  Terminal,
  EyeOff,
  Maximize,
  Droplets,
  Type,
  CaseSensitive,
  BookText,
  FileCode,
  Clock,
  Palette,
  Monitor,
  Mic,
  Database,
  Volume2,
  Gauge,
  Play,
  VolumeX,
  Music,
  type LucideIcon,
} from "lucide-react";

export type { LucideIcon };

export type ToolIconName =
  | "Image"
  | "FileDown"
  | "KeyRound"
  | "Fingerprint"
  | "Scissors"
  | "RotateCw"
  | "FileX2"
  | "LockKeyhole"
  | "Crop"
  | "FileImage"
  | "QrCode"
  | "Code"
  | "Braces"
  | "Ruler"
  | "Search"
  | "KeySquare"
  | "ScanSearch"
  | "Film"
  | "FileDiff"
  | "Table"
  | "Link2"
  | "Paintbrush"
  | "FileArchive"
  | "Stamp"
  | "LayoutGrid"
  | "FileText"
  | "PenTool"
  | "Hash"
  | "ListOrdered"
  | "Layers"
  | "Pipette"
  | "Binary"
  | "Square"
  | "Sparkles"
  | "ArrowLeftRight"
  | "Globe"
  | "Info"
  | "Images"
  | "Minimize2"
  | "GitCompare"
  | "Droplet"
  | "Frame"
  | "BarChart3"
  | "Share2"
  | "User"
  | "Laugh"
  | "ScanLine"
  | "Barcode"
  | "Shield"
  | "Grid3x3"
  | "Camera"
  | "CloudFog"
  | "Terminal"
  | "EyeOff"
  | "Maximize"
  | "Droplets"
  | "Type"
  | "CaseSensitive"
  | "BookText"
  | "FileCode"
  | "Clock"
  | "Palette"
  | "Monitor"
  | "Mic"
  | "Database"
  | "Play"
  | "VolumeX"
  | "Music"
  | "Volume2"
  | "Gauge";

export const TOOL_ICON_MAP: Record<ToolIconName, LucideIcon> = {
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
  KeySquare,
  ScanSearch,
  Film,
  FileDiff,
  Table,
  Link2,
  Paintbrush,
  FileArchive,
  Stamp,
  LayoutGrid,
  FileText,
  PenTool,
  Hash,
  ListOrdered,
  Layers,
  Pipette,
  Binary,
  Square,
  Sparkles,
  ArrowLeftRight,
  Globe,
  Info,
  Images,
  Minimize2,
  GitCompare,
  Droplet,
  Frame,
  BarChart3,
  Share2,
  User,
  Laugh,
  ScanLine,
  Barcode,
  Shield,
  Grid3x3,
  Camera,
  CloudFog,
  Terminal,
  EyeOff,
  Maximize,
  Droplets,
  Type,
  CaseSensitive,
  BookText,
  FileCode,
  Clock,
  Palette,
  Monitor,
  Mic,
  Database,
  Play,
  VolumeX,
  Music,
  Volume2,
  Gauge,
};

export function getToolIcon(iconName: ToolIconName): LucideIcon {
  return TOOL_ICON_MAP[iconName];
}
