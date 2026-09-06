import * as z from 'zod'

export const excelToPdfSchema = z.object({})

export type ExcelToPdfFormValues = z.input<typeof excelToPdfSchema>
