import { marked } from 'marked'

/**
 * Convert Markdown to PDF using an iframe + window.print() approach.
 * Opens the browser print dialog where the user can "Save as PDF".
 * Also returns an HTML blob for direct download.
 */
export async function convertMarkdownToPdf(markdown: string): Promise<Blob> {
  // Convert markdown to HTML
  const html = await marked.parse(markdown)

  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: A4; margin: 15mm; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1a1a1a;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }
        h1 { font-size: 24pt; border-bottom: 2px solid #eee; padding-bottom: 0.3em; }
        h2 { font-size: 18pt; border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
        h3 { font-size: 14pt; }
        code { font-family: 'SF Mono', Consolas, monospace; background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }
        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow-x: auto; }
        pre code { background: none; padding: 0; }
        blockquote { border-left: 4px solid #dfe2e5; margin: 0; padding: 0 1em; color: #6a737d; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #dfe2e5; padding: 8px 12px; text-align: left; }
        th { background: #f6f8fa; font-weight: 600; }
        img { max-width: 100%; }
        a { color: #0366d6; }
        ul, ol { padding-left: 2em; }
        li { margin: 0.25em 0; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>${html}</body>
    </html>
  `

  // Open print dialog for PDF saving (browser only)
  if (typeof document !== 'undefined') {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-9999px'
    iframe.style.top = '-9999px'
    iframe.style.width = '210mm'
    iframe.style.height = '297mm'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument
    if (doc) {
      doc.open()
      doc.write(fullHtml)
      doc.close()

      // Wait for content to render, then open print dialog
      setTimeout(() => {
        try {
          iframe.contentWindow?.print()
        } catch {
          // Print blocked by browser — user can download HTML instead
        }
        // Clean up iframe after print dialog closes
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 1000)
      }, 500)
    }
  }

  // Return HTML blob for download fallback
  return new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
}
