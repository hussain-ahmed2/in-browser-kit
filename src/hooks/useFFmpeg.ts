import { useState, useRef, useCallback, useEffect } from "react"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState("")

  const load = useCallback(async () => {
    if (ffmpegRef.current) return
    const ffmpeg = new FFmpeg()
    ffmpeg.on("progress", ({ progress: p }) => {
      setProgress(Math.max(0, Math.min(100, Math.round(p * 100))))
    })
    ffmpeg.on("log", ({ message }) => setStatus(message))

    const baseURL = "/ffmpeg"
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript"),
    })
    ffmpegRef.current = ffmpeg
    setIsLoaded(true)
  }, [])

  /** Single-file exec: writes inputs, runs args, reads the last arg as output. */
  const exec = useCallback(
    async (
      args: string[],
      files: { name: string; data: Uint8Array }[],
    ): Promise<Uint8Array | null> => {
      if (!ffmpegRef.current) await load()
      const ffmpeg = ffmpegRef.current!

      setIsProcessing(true)
      setProgress(0)
      setStatus("Processing...")

      try {
        for (const f of files) {
          await ffmpeg.writeFile(f.name, f.data)
        }

        const exitCode = await ffmpeg.exec(args)
        if (exitCode !== 0) throw new Error(`FFmpeg exited with code ${exitCode}`)

        // Find output file (last arg that looks like a filename)
        const outputFile = args[args.length - 1]
        const data = await ffmpeg.readFile(outputFile)

        return data as unknown as Uint8Array
      } finally {
        // Cleanup
        for (const f of files) {
          try { await ffmpeg.deleteFile(f.name) } catch {}
        }
        try { await ffmpeg.deleteFile(args[args.length - 1]) } catch {}
        setIsProcessing(false)
        setProgress(0)
        setStatus("")
      }
    },
    [load],
  )

  /**
   * Low-level helpers for tools that need direct access to the FFmpeg instance
   * (e.g. multi-file output like frame extraction). These bypass the
   * automatic read/cleanup logic of `exec`.
   */
  const writeFile = useCallback(
    async (name: string, data: Uint8Array) => {
      if (!ffmpegRef.current) await load()
      await ffmpegRef.current!.writeFile(name, data)
    },
    [load],
  )

  const readFile = useCallback(
    async (name: string): Promise<Uint8Array> => {
      if (!ffmpegRef.current) throw new Error("FFmpeg not loaded")
      return (await ffmpegRef.current.readFile(name)) as unknown as Uint8Array
    },
    [],
  )

  const run = useCallback(
    async (args: string[]): Promise<number> => {
      if (!ffmpegRef.current) await load()
      setIsProcessing(true)
      setProgress(0)
      setStatus("Processing...")
      try {
        const exitCode = await ffmpegRef.current!.exec(args)
        if (exitCode !== 0) throw new Error(`FFmpeg exited with code ${exitCode}`)
        return exitCode
      } finally {
        setIsProcessing(false)
        setProgress(0)
        setStatus("")
      }
    },
    [load],
  )

  const deleteFile = useCallback(async (name: string) => {
    try { await ffmpegRef.current?.deleteFile(name) } catch {}
  }, [])

  useEffect(() => {
    return () => {
      ffmpegRef.current?.terminate()
    }
  }, [])

  return { isLoaded, isProcessing, progress, status, load, exec, writeFile, readFile, run, deleteFile }
}
