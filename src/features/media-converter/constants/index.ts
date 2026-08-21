export const MAX_MEDIA_SIZE_MB = 500; // Increased to 500MB since we now have proper garbage collection

export const OUTPUT_FORMAT_OPTIONS_VIDEO = [
  { label: "MP4 Video", value: "mp4" },
  { label: "WebM Video", value: "webm" },
  { label: "GIF Animation", value: "gif" },
  { label: "MP3 Audio", value: "mp3" },
  { label: "WAV Audio", value: "wav" },
];

export const OUTPUT_FORMAT_OPTIONS_AUDIO = [
  { label: "MP3 Audio", value: "mp3" },
  { label: "WAV Audio", value: "wav" },
];

export const RESOLUTION_OPTIONS = [
  { label: "Original", value: "original" },
  { label: "1080p (FHD)", value: "1080p" },
  { label: "720p (HD)", value: "720p" },
  { label: "480p (SD)", value: "480p" },
  { label: "360p", value: "360p" },
];

export const QUALITY_OPTIONS = [
  { label: "High (Larger size)", value: "high" },
  { label: "Medium (Balanced)", value: "medium" },
  { label: "Low (Smaller size)", value: "low" },
];

export const VIDEO_CODEC_OPTIONS = [
  { label: "Default (Auto)", value: "default" },
  { label: "H.264 (Most Compatible)", value: "avc" },
  { label: "H.265 / HEVC (Best Compression)", value: "hevc" },
  { label: "VP9 (WebM Optimized)", value: "vp9" },
  { label: "AV1 (Next-Gen)", value: "av1" },
];

export const FILTER_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Grayscale", value: "grayscale" },
  { label: "Sepia", value: "sepia" },
  { label: "Invert", value: "invert" },
  { label: "Blur", value: "blur" },
];

export const SAVE_MODE_OPTIONS = [
  { label: "Direct-to-Disk (0MB RAM, Recommended)", value: "direct" },
  { label: "In-Memory (Download Later)", value: "memory" },
];
