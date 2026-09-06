import * as z from 'zod'

export interface PortResult {
  host: string
  port: number
  status: 'open' | 'closed' | 'filtered'
  responseTime: number
}

export const COMMON_PORTS = [
  { port: 80, name: 'HTTP' },
  { port: 443, name: 'HTTPS' },
  { port: 22, name: 'SSH' },
  { port: 21, name: 'FTP' },
  { port: 25, name: 'SMTP' },
  { port: 53, name: 'DNS' },
  { port: 3306, name: 'MySQL' },
  { port: 5432, name: 'PostgreSQL' },
  { port: 6379, name: 'Redis' },
  { port: 27017, name: 'MongoDB' },
] as const

export const portScannerSchema = z.object({
  host: z.string().min(1, 'Host is required'),
  ports: z.array(z.number()).min(1, 'Select at least one port'),
})

export type PortScannerFormValues = z.input<typeof portScannerSchema>
