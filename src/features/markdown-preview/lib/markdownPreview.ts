import { marked } from 'marked'

// Configure marked for safe rendering
marked.setOptions({
  breaks: true,
  gfm: true,
})

export function parseMarkdown(text: string): string {
  if (!text.trim()) return ''
  try {
    const html = marked.parse(text) as string
    return html
  } catch {
    return '<p>Error parsing markdown</p>'
  }
}
