import * as z from 'zod'

export const barcodeSchema = z.object({
  value: z.string().min(1, 'Value is required'),
  format: z.string().default('CODE128'),
  width: z.coerce.number().int().min(1).max(5).default(2),
  height: z.coerce.number().int().min(10).max(200).default(100),
  displayValue: z.boolean().default(true),
})

export type BarcodeFormValues = z.input<typeof barcodeSchema>

export const BARCODE_FORMATS = [
  { label: 'Code 128', value: 'CODE128' },
  { label: 'EAN-13', value: 'EAN13' },
  { label: 'EAN-8', value: 'EAN8' },
  { label: 'UPC-A', value: 'UPC' },
  { label: 'Code 39', value: 'CODE39' },
  { label: 'ITF-14', value: 'ITF14' },
  { label: 'MSI', value: 'MSI' },
] as const
