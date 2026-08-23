import { rgb } from "pdf-lib";

export function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

export function getWatermarkPosition({
  anchor,
  pageWidth,
  pageHeight,
  textWidth,
  textHeight,
  rotation, // degrees
  margin = 40,
}: {
  anchor: string;
  pageWidth: number;
  pageHeight: number;
  textWidth: number;
  textHeight: number;
  rotation: number;
  margin?: number;
}) {
  let cx = 0;
  let cy = 0;

  switch (anchor) {
    case "top-left":
      cx = margin + textWidth / 2;
      cy = pageHeight - margin - textHeight / 2;
      break;
    case "top-center":
      cx = pageWidth / 2;
      cy = pageHeight - margin - textHeight / 2;
      break;
    case "top-right":
      cx = pageWidth - margin - textWidth / 2;
      cy = pageHeight - margin - textHeight / 2;
      break;
    case "middle-left":
      cx = margin + textWidth / 2;
      cy = pageHeight / 2;
      break;
    case "center":
      cx = pageWidth / 2;
      cy = pageHeight / 2;
      break;
    case "middle-right":
      cx = pageWidth - margin - textWidth / 2;
      cy = pageHeight / 2;
      break;
    case "bottom-left":
      cx = margin + textWidth / 2;
      cy = margin + textHeight / 2;
      break;
    case "bottom-center":
      cx = pageWidth / 2;
      cy = margin + textHeight / 2;
      break;
    case "bottom-right":
      cx = pageWidth - margin - textWidth / 2;
      cy = margin + textHeight / 2;
      break;
    default:
      cx = pageWidth / 2;
      cy = pageHeight / 2;
      break;
  }

  // To rotate around the center point (cx, cy), we apply a 2D rotation matrix
  // to the relative bottom-left point (-textWidth/2, -textHeight/2)
  const theta = (rotation * Math.PI) / 180;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);

  const x = cx + (-textWidth / 2) * cosT - (-textHeight / 2) * sinT;
  const y = cy + (-textWidth / 2) * sinT + (-textHeight / 2) * cosT;

  return { x, y };
}
