import * as z from 'zod'

export const socialResizerSchema = z.object({
  preset: z.string().default('instagram-post'),
  fit: z.enum(['cover', 'contain', 'stretch']).default('cover'),
})

export type SocialResizerFormValues = z.input<typeof socialResizerSchema>

export interface SocialPreset {
  label: string
  value: string
  width: number
  height: number
  platform: string
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  { label: 'Instagram Post', value: 'instagram-post', width: 1080, height: 1080, platform: 'Instagram' },
  { label: 'Instagram Story', value: 'instagram-story', width: 1080, height: 1920, platform: 'Instagram' },
  { label: 'Instagram Landscape', value: 'instagram-landscape', width: 1080, height: 566, platform: 'Instagram' },
  { label: 'X/Twitter Post', value: 'twitter-post', width: 1200, height: 675, platform: 'X' },
  { label: 'X/Twitter Header', value: 'twitter-header', width: 1500, height: 500, platform: 'X' },
  { label: 'LinkedIn Post', value: 'linkedin-post', width: 1200, height: 627, platform: 'LinkedIn' },
  { label: 'LinkedIn Banner', value: 'linkedin-banner', width: 1584, height: 396, platform: 'LinkedIn' },
  { label: 'Facebook Post', value: 'facebook-post', width: 1200, height: 630, platform: 'Facebook' },
  { label: 'Facebook Cover', value: 'facebook-cover', width: 820, height: 312, platform: 'Facebook' },
  { label: 'Pinterest Pin', value: 'pinterest-pin', width: 1000, height: 1500, platform: 'Pinterest' },
  { label: 'YouTube Thumbnail', value: 'youtube-thumbnail', width: 1280, height: 720, platform: 'YouTube' },
]
