import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageSteganographyPage } from '@/features/image-steganography/components/ImageSteganographyPage'
import { toolMetadata } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-steganography')

export default function Page() {
  return (
    <ToolPage slug="image-steganography">
      <StructuredData
        name="Steganography"
        description="Hide secret text data inside images using LSB encoding."
        url="https://inbrowserkit.netlify.app/tools/image-steganography"
        category="ImageEditing"
      />
      <ImageSteganographyPage />
    </ToolPage>
  )
}
