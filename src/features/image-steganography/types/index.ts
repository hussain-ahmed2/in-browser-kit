import * as z from 'zod'

export const steganographySchema = z.object({
  mode: z.enum(['encode', 'decode']).default('encode'),
  secretMessage: z.string().default(''),
})

export type SteganographyFormValues = z.input<typeof steganographySchema>

export interface StegEncodeResult {
  file: File
  objectUrl: string
  width: number
  height: number
  messageLength: number
}

export interface StegDecodeResult {
  message: string
  success: boolean
}
