import type { IpInfo } from '../types'

const IPIFY_URL = 'https://api.ipify.org?format=json'
const IPAPI_URL = 'https://ipapi.co'

export async function lookupIp(manualIp?: string): Promise<IpInfo> {
  const ip =
    manualIp && manualIp.trim()
      ? manualIp.trim()
      : await fetchOwnIp()

  const res = await fetch(`${IPAPI_URL}/${ip}/json/`)
  if (!res.ok) {
    throw new Error(`Failed to look up IP details: ${res.statusText}`)
  }

  const data = await res.json()

  if (data.error) {
    throw new Error(data.reason || 'Invalid IP address')
  }

  return {
    ip: data.ip ?? ip,
    city: data.city ?? 'N/A',
    region: data.region ?? 'N/A',
    country: data.country_name ?? data.country ?? 'N/A',
    org: data.org ?? 'N/A',
    timezone: data.timezone ?? 'N/A',
    latitude: data.latitude ?? 0,
    longitude: data.longitude ?? 0,
    postal: data.postal ?? 'N/A',
  }
}

async function fetchOwnIp(): Promise<string> {
  const res = await fetch(IPIFY_URL)
  if (!res.ok) {
    throw new Error('Failed to fetch your IP address')
  }
  const data = await res.json()
  return data.ip
}
