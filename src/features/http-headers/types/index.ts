import * as z from 'zod'

export interface HeadersTiming {
  dns: number
  connect: number
  tls: number
  ttfb: number
  total: number
}

export interface HeadersResult {
  url: string
  headers: Record<string, string>
  statusCode?: number
  redirectChain?: string[]
  timing: HeadersTiming
}

export const httpHeadersSchema = z.object({
  url: z.string().url('Please enter a valid URL').default(''),
})

export type HttpHeadersFormValues = z.input<typeof httpHeadersSchema>
