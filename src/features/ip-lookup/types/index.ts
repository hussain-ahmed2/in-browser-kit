import * as z from 'zod'

export interface IpInfo {
  ip: string
  city: string
  region: string
  country: string
  org: string
  timezone: string
  latitude: number
  longitude: number
  postal: string
}

export const ipLookupSchema = z.object({
  ip: z.string().default(''),
})

export type IpLookupFormValues = z.input<typeof ipLookupSchema>
