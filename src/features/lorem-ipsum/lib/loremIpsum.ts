const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
  'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
  'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
  'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'perspiciatis', 'unde',
  'omnis', 'iste', 'natus', 'error', 'voluptatem', 'accusantium', 'doloremque',
  'laudantium', 'totam', 'rem', 'aperiam', 'eaque', 'ipsa', 'quae', 'ab', 'illo',
  'inventore', 'veritatis', 'quasi', 'architecto', 'beatae', 'vitae', 'dicta',
  'explicabo', 'nemo', 'ipsam', 'quia', 'voluptas', 'aspernatur', 'aut', 'odit',
  'fugit', 'consequuntur', 'magni', 'dolores', 'eos', 'ratione', 'sequi', 'nesciunt',
  'neque', 'porro', 'quisquam', 'nihil', 'impedit', 'quo', 'minus', 'maxime',
  'placeat', 'facere', 'possimus', 'omnis', 'repellat',
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateWord(): string {
  return pickRandom(LOREM_WORDS)
}

function generateSentence(wordCount?: number): string {
  const count = wordCount ?? randomInt(8, 18)
  const words: string[] = []
  for (let i = 0; i < count; i++) {
    words.push(generateWord())
  }
  const sentence = words.join(' ')
  return sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.'
}

function generateParagraph(sentenceCount?: number): string {
  const count = sentenceCount ?? randomInt(4, 8)
  const sentences: string[] = []
  for (let i = 0; i < count; i++) {
    sentences.push(generateSentence())
  }
  return sentences.join(' ')
}

export interface LoremOptions {
  type: 'paragraphs' | 'sentences' | 'words'
  count: number
  startWithLorem: boolean
}

export function generateLorem(options: LoremOptions): string {
  const { type, count, startWithLorem } = options
  let result = ''

  if (type === 'words') {
    const words: string[] = []
    for (let i = 0; i < count; i++) {
      words.push(generateWord())
    }
    result = words.join(' ')
    if (startWithLorem && result) {
      const parts = result.split(' ')
      parts[0] = 'Lorem'
      parts[1] = 'ipsum'
      result = parts.join(' ')
    }
  } else if (type === 'sentences') {
    const sentences: string[] = []
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence())
    }
    result = sentences.join(' ')
    if (startWithLorem && result) {
      result = result.replace(/^[A-Z]/, 'L')
      result = 'Lorem ipsum' + result.slice(5)
    }
  } else {
    const paragraphs: string[] = []
    for (let i = 0; i < count; i++) {
      paragraphs.push(generateParagraph())
    }
    result = paragraphs.join('\n\n')
    if (startWithLorem && result) {
      result = result.replace(/^[A-Z]/, 'L')
      result = 'Lorem ipsum' + result.slice(5)
    }
  }

  return result
}
