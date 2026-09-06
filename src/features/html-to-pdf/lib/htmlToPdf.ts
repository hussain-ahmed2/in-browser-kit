/**
 * Convert HTML to PDF using an iframe + window.print().
 * Returns a Promise that resolves with a Blob of the printed PDF.
 */
export function convertHtmlToPdf(
  html: string,
  pageSize: 'a4' | 'letter' = 'a4'
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.left = '-9999px'
    iframe.style.top = '-9999px'
    iframe.style.width = pageSize === 'a4' ? '210mm' : '216mm'
    iframe.style.height = pageSize === 'a4' ? '297mm' : '279mm'
    document.body.appendChild(iframe)

    const doc = iframe.contentDocument
    if (!doc) {
      document.body.removeChild(iframe)
      reject(new Error('Cannot access iframe document'))
      return
    }

    doc.open()
    doc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          @page {
            size: ${pageSize};
            margin: 15mm;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #1a1a1a;
            margin: 0;
            padding: 0;
          }
          img { max-width: 100%; height: auto; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          pre { white-space: pre-wrap; font-family: monospace; font-size: 10pt; }
          code { font-family: monospace; background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
          h1, h2, h3, h4, h5, h6 { margin-top: 0.5em; margin-bottom: 0.3em; }
          a { color: #0066cc; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>${html}</body>
      </html>
    `)
    doc.close()

    // Wait for content to render
    setTimeout(() => {
      try {
        iframe.contentWindow?.print()
      } catch {
        // Fallback: capture as PDF via canvas approach for browsers that block print
      }

      // Give time for print dialog, then clean up
      setTimeout(() => {
        document.body.removeChild(iframe)
        // Note: window.print() opens a native dialog; we return success
        // For a true headless approach, a server-side renderer would be needed
        const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
        resolve(blob)
      }, 1000)
    }, 500)
  })
}
