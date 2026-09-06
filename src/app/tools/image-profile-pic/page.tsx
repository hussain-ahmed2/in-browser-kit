import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageProfilePicPage } from '@/features/image-profile-pic/components/ImageProfilePicPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-profile-pic')

export default function Page() {
  return (
    <ToolPage slug="image-profile-pic">
      <StructuredData
        name="Profile Picture Maker"
        description="Create perfectly cropped profile pictures with borders and shapes."
        url="https://inbrowserkit.netlify.app/tools/image-profile-pic"
        category="ImageEditing"
      />
      <ImageProfilePicPage />
    </ToolPage>
  )
}
