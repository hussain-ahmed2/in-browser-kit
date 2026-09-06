import * as z from 'zod'

export const profilePicSchema = z.object({
  shape: z.enum(['circle', 'square']).default('circle'),
  size: z.coerce.number().int().min(64).max(2048).default(512),
  borderWidth: z.coerce.number().int().min(0).max(20).default(0),
  borderColor: z.string().default('#ffffff'),
})

export type ProfilePicFormValues = z.input<typeof profilePicSchema>
