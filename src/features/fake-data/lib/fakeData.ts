// Simple seeded PRNG (mulberry32) for reproducible results within a session
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let rng = mulberry32(Date.now())

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

function randomHex(): string {
  return '#' + Math.floor(rng() * 0xffffff).toString(16).padStart(6, '0')
}

function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (rng() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─── Word lists ───
const firstNames = [
  'James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth',
  'William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen',
  'Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra',
  'Donald','Ashley','Steven','Dorothy','Paul','Kimberly','Andrew','Emily','Joshua','Donna',
  'Kenneth','Michelle','Kevin','Carol','Brian','Amanda','George','Melissa','Timothy','Deborah',
  'Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia',
  'Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna',
  'Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen',
  'Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel',
  'Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather',
  'Tyler','Diane','Aaron','Ruth','Jose','Julie','Adam','Olivia','Nathan','Joyce',
]

const lastNames = [
  'Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez',
  'Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin',
  'Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson',
  'Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores',
  'Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts',
  'Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes',
  'Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper',
  'Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson',
  'Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes',
  'Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez',
]

const streets = [
  'Main St','Oak Ave','Pine Rd','Elm St','Maple Dr','Cedar Ln','Walnut St','2nd Ave',
  '3rd St','Washington Blvd','Park Ave','Lake Dr','Hill Rd','River Rd','Spring St',
  'Union Ave','Broadway','Market St','Church St','High St','First Ave','Fifth Ave',
  'Sunset Blvd','Franklin Ave','Lincoln St','Jefferson Ave','Adams St','Madison Ave',
  'Monroe St','Jackson Blvd','Harrison St','Van Buren St','Chestnut St','Spruce St',
]

const cities = [
  'New York','Los Angeles','Chicago','Houston','Phoenix','Philadelphia','San Antonio',
  'San Diego','Dallas','San Jose','Austin','Jacksonville','Fort Worth','Columbus',
  'Charlotte','Indianapolis','San Francisco','Seattle','Denver','Washington',
  'Nashville','Oklahoma City','El Paso','Boston','Portland','Las Vegas','Memphis',
  'Louisville','Baltimore','Milwaukee','Albuquerque','Tucson','Fresno','Sacramento',
  'Mesa','Kansas City','Atlanta','Omaha','Colorado Springs','Raleigh',
]

const states = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
  'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY',
  'NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
]

const domains = ['gmail.com','yahoo.com','outlook.com','hotmail.com','icloud.com','protonmail.com','aol.com','mail.com','zoho.com','yandex.com']

const adjectives = ['quick','lazy','brave','calm','dark','eager','fair','glad','happy','keen','mild','nice','proud','sharp','vivid','wild','bold','cool','dry','fast','gold','iron','just','kind','loud','neat','pure','rare','safe','tall','vast','warm','wise','young','deep','rich','soft','long','wide','blue']

const animals = ['fox','wolf','bear','hawk','lion','deer','lynx','mink','seal','toad','worm','crab','dove','hare','mole','owl','ram','Crow','Duck','Goat','Lark','Mink','Newt','Pike','Rook','Swan','Wren','Bass','Carp','Eels','Gnat','Ibis','Jackal','Kite','Lemur','Narwhal','Orca','Quail','Raven','Snail','Tuna']

// ─── Generators ───

export function generateNames(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    results.push(`${pick(firstNames)} ${pick(lastNames)}`)
  }
  return results
}

export function generateEmails(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const first = pick(firstNames).toLowerCase()
    const last = pick(lastNames).toLowerCase()
    const sep = pick(['.', '_', ''])
    const num = rng() > 0.5 ? Math.floor(rng() * 999) : ''
    results.push(`${first}${sep}${last}${num}@${pick(domains)}`)
  }
  return results
}

export function generatePhones(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const area = Math.floor(rng() * 800) + 200
    const mid = Math.floor(rng() * 900) + 100
    const end = Math.floor(rng() * 9000) + 1000
    const fmt = pick(['us', 'dots', 'paren', 'intl'])
    if (fmt === 'us') results.push(`${area}-${mid}-${end}`)
    else if (fmt === 'dots') results.push(`${area}.${mid}.${end}`)
    else if (fmt === 'paren') results.push(`(${area}) ${mid}-${end}`)
    else results.push(`+1 (${area}) ${mid}-${end}`)
  }
  return results
}

export function generateAddresses(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const num = Math.floor(rng() * 9999) + 1
    const zip = Math.floor(rng() * 90000) + 10000
    results.push(`${num} ${pick(streets)}, ${pick(cities)}, ${pick(states)} ${zip}`)
  }
  return results
}

export function generateCreditCards(count: number): string[] {
  const prefixes: Record<string, string> = {
    Visa: '4',
    Mastercard: '5',
    Amex: '37',
    Discover: '6',
  }
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const brand = pick(Object.keys(prefixes))
    const prefix = prefixes[brand]
    const len = brand === 'Amex' ? 15 : 16
    let num = prefix
    while (num.length < len - 1) {
      num += Math.floor(rng() * 10).toString()
    }
    // Simple checksum digit (Luhn approximation)
    let sum = 0
    for (let j = 0; j < num.length; j++) {
      sum += parseInt(num[j], 10)
    }
    num += ((10 - (sum % 10)) % 10).toString()
    // Format with spaces
    results.push(num.replace(/(\d{4})(?=\d)/g, '$1 '))
  }
  return results
}

export function generateUuids(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    results.push(uuidv4())
  }
  return results
}

export function generateDates(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const year = 2000 + Math.floor(rng() * 25)
    const month = Math.floor(rng() * 12) + 1
    const day = Math.floor(rng() * 28) + 1
    results.push(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)
  }
  return results
}

export function generatePasswords(count: number): string[] {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    const len = Math.floor(rng() * 10) + 12 // 12-21 chars
    let pw = ''
    for (let j = 0; j < len; j++) {
      pw += charset[Math.floor(rng() * charset.length)]
    }
    results.push(pw)
  }
  return results
}

export function generateNumbers(count: number, min: number, max: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    results.push((Math.floor(rng() * (max - min + 1)) + min).toString())
  }
  return results
}

export function generateColors(count: number): string[] {
  const results: string[] = []
  for (let i = 0; i < count; i++) {
    results.push(randomHex())
  }
  return results
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

export type FakeDataType =
  | 'names'
  | 'emails'
  | 'phones'
  | 'addresses'
  | 'creditCards'
  | 'uuids'
  | 'dates'
  | 'passwords'
  | 'numbers'
  | 'colors'

export const DATA_TYPE_LABELS: Record<FakeDataType, string> = {
  names: 'Full Names',
  emails: 'Email Addresses',
  phones: 'Phone Numbers',
  addresses: 'Street Addresses',
  creditCards: 'Credit Card Numbers',
  uuids: 'UUID v4',
  dates: 'Random Dates (ISO)',
  passwords: 'Secure Passwords',
  numbers: 'Random Numbers',
  colors: 'Hex Colors',
}

export function generateFakeData(type: FakeDataType, count: number, min?: number, max?: number): string[] {
  switch (type) {
    case 'names': return generateNames(count)
    case 'emails': return generateEmails(count)
    case 'phones': return generatePhones(count)
    case 'addresses': return generateAddresses(count)
    case 'creditCards': return generateCreditCards(count)
    case 'uuids': return generateUuids(count)
    case 'dates': return generateDates(count)
    case 'passwords': return generatePasswords(count)
    case 'numbers': return generateNumbers(count, min ?? 0, max ?? 1000)
    case 'colors': return generateColors(count)
  }
}
