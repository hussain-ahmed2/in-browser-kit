import * as z from 'zod'

export const jsonYamlSchema = z.object({
  input: z.string().default(''),
  mode: z.enum(['json-to-yaml', 'yaml-to-json']).default('json-to-yaml'),
})

export type JsonYamlFormValues = z.input<typeof jsonYamlSchema>
