import type { Metadata } from 'next'
import { ToolPage } from '@/features/tools/components/ToolPage'
import { ImageQrReaderPage } from '@/features/image-qr-reader/components/ImageQrReaderPage'
import { toolMetadata, SITE_URL } from '@/lib/site'
import { StructuredData } from '@/components/StructuredData'

export const metadata: Metadata = toolMetadata('image-qr-reader')

export default function Page() {
  return (
    <ToolPage slug="image-qr-reader">
      <StructuredData
        name="QR Code Reader"
        description="Upload an image to scan and decode QR codes instantly."
        url={`${SITE_URL}/tools/image-qr-reader`}
        category="ImageEditing"
      />
      <ImageQrReaderPage />
    </ToolPage>
  )
}
