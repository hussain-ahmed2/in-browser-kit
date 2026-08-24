import * as z from 'zod'

export const imageInfoSchema = z.object({
  // No form fields needed - this is a viewer tool
})

export type ImageInfoFormValues = z.input<typeof imageInfoSchema>