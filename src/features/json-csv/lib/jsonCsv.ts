import Papa from 'papaparse'

export function jsonToCsv(
  json: string,
  options?: { delimiter?: string; includeHeader?: boolean }
): string {
  if (!json.trim()) throw new Error('Empty input')

  const parsed = JSON.parse(json)
  const data = Array.isArray(parsed) ? parsed : [parsed]

  const result = Papa.unparse(data, {
    delimiter: options?.delimiter ?? ',',
    header: options?.includeHeader ?? true,
  })

  return result
}

export function csvToJson(
  csv: string,
  options?: { delimiter?: string; header?: boolean }
): object[] {
  if (!csv.trim()) throw new Error('Empty input')

  const result = Papa.parse(csv, {
    header: options?.header ?? true,
    skipEmptyLines: true,
    delimiter: options?.delimiter,
  })

  if (result.errors && result.errors.length > 0) {
    const firstError = result.errors[0]
    throw new Error(firstError.message || 'Parse error')
  }

  return result.data as object[]
}
