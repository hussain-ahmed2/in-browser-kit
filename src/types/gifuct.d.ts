declare module 'gifuct-js' {
  export interface GIF {
    lsd: {
      width: number;
      height: number;
      loopCount: number;
      backgroundColorIndex: number;
      gct: {
        exists: boolean;
        resolution: number;
        size: number;
        sort: boolean;
      };
    };
    gct?: number[];
    frames: GIFFrame[];
  }

  export interface GIFFrame {
    delay: number;
    disposalType: number;
    dims: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    colorTable: number[];
    transparentIndex?: number;
    patch: Uint8ClampedArray;
    index?: number;
  }

  export interface DecompressedFrame {
    index: number;
    delay: number;
    disposalType: number;
    dims: {
      top: number;
      left: number;
      width: number;
      height: number;
    };
    colorTable: number[];
    transparentIndex?: number;
    patch: Uint8ClampedArray;
  }

  export function parseGIF(buffer: ArrayBuffer | Uint8Array): GIF;
  export function decompressFrames(gif: GIF, buildPatch: boolean): DecompressedFrame[];
}