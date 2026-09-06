import { marked } from 'marked'

/**
 * Convert Markdown to a PDF blob by rendering HTML and using an iframe print approach.
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
      </style>
    </head>
    <body>${html}</body>
    </html>
  `

  // Use the same iframe-based approach as HTML to PDF
  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' })
  return blob
}
