declare module 'gif.js' {
  export interface GIFOptions {
    workers?: number;
    quality?: number;
    width: number;
    height: number;
    workerScript?: string;
    background?: string;
  }

  export interface GIF {
    addFrame(image: CanvasRenderingContext2D | HTMLImageElement | HTMLCanvasElement | ImageData, options?: {
      delay?: number;
      disposal?: number;
      copy?: boolean;
    }): void;
    render(): void;
    on(event: 'finished', callback: (blob: Blob) => void): void;
    on(event: 'error', callback: (error: Error) => void): void;
    on(event: 'progress', callback: (progress: number) => void): void;
    on(event: string, callback: (...args: unknown[]) => void): void;
  }

  const GIF: {
    new (options: GIFOptions): GIF;
  };

  export default GIF;
}