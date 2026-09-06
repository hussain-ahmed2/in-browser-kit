import * as z from 'zod'

export const cronGeneratorSchema = z.object({
  minute: z.string().default('*'),
  hour: z.string().default('*'),
  dayOfMonth: z.string().default('*'),
  month: z.string().default('*'),
  dayOfWeek: z.string().default('*'),
})

export type CronGeneratorFormValues = z.input<typeof cronGeneratorSchema>
