export interface CronFields {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export function generateCron(fields: CronFields): string {
  return `${fields.minute} ${fields.hour} ${fields.dayOfMonth} ${fields.month} ${fields.dayOfWeek}`
}

const MINUTE_NAMES: Record<string, string> = {
  '0': 'at minute 0',
  '15': 'at minute 15',
  '30': 'at minute 30',
  '45': 'at minute 45',
}

const HOUR_NAMES: Record<string, string> = {
  '0': 'at 12:00 AM',
  '1': 'at 1:00 AM',
  '2': 'at 2:00 AM',
  '3': 'at 3:00 AM',
  '4': 'at 4:00 AM',
  '5': 'at 5:00 AM',
  '6': 'at 6:00 AM',
  '7': 'at 7:00 AM',
  '8': 'at 8:00 AM',
  '9': 'at 9:00 AM',
  '10': 'at 10:00 AM',
  '11': 'at 11:00 AM',
  '12': 'at 12:00 PM',
  '13': 'at 1:00 PM',
  '14': 'at 2:00 PM',
  '15': 'at 3:00 PM',
  '16': 'at 4:00 PM',
  '17': 'at 5:00 PM',
  '18': 'at 6:00 PM',
  '19': 'at 7:00 PM',
  '20': 'at 8:00 PM',
  '21': 'at 9:00 PM',
  '22': 'at 10:00 PM',
  '23': 'at 11:00 PM',
}

const DAY_NAMES: Record<string, string> = {
  '0': 'Sunday',
  '1': 'Monday',
  '2': 'Tuesday',
  '3': 'Wednesday',
  '4': 'Thursday',
  '5': 'Friday',
  '6': 'Saturday',
}

const MONTH_NAMES: Record<string, string> = {
  '1': 'January',
  '2': 'February',
  '3': 'March',
  '4': 'April',
  '5': 'May',
  '6': 'June',
  '7': 'July',
  '8': 'August',
  '9': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December',
}

function describeField(field: string, type: 'minute' | 'hour' | 'dayOfMonth' | 'month' | 'dayOfWeek'): string {
  if (field === '*') {
    switch (type) {
      case 'minute': return 'every minute'
      case 'hour': return 'every hour'
      case 'dayOfMonth': return 'every day'
      case 'month': return ''
      case 'dayOfWeek': return ''
    }
  }

  // Handle step values like */5
  if (field.startsWith('*/')) {
    const step = field.slice(2)
    switch (type) {
      case 'minute': return `every ${step} minutes`
      case 'hour': return `every ${step} hours`
      default: return `every ${step}`
    }
  }

  // Handle ranges like 1-5
  if (field.includes('-')) {
    const [start, end] = field.split('-')
    if (type === 'dayOfWeek') {
      return `${DAY_NAMES[start] || start} through ${DAY_NAMES[end] || end}`
    }
    if (type === 'month') {
      return `${MONTH_NAMES[start] || start} through ${MONTH_NAMES[end] || end}`
    }
    return `from ${start} to ${end}`
  }

  // Handle lists like 1,3,5
  if (field.includes(',')) {
    const values = field.split(',')
    if (type === 'dayOfWeek') {
      return `on ${values.map((v) => DAY_NAMES[v] || v).join(', ')}`
    }
    if (type === 'month') {
      return `in ${values.map((v) => MONTH_NAMES[v] || v).join(', ')}`
    }
    return `at minutes ${values.join(', ')}`
  }

  // Handle named day of week
  if (type === 'dayOfWeek' && DAY_NAMES[field]) {
    return `on ${DAY_NAMES[field]}`
  }

  // Handle named month
  if (type === 'month' && MONTH_NAMES[field]) {
    return `in ${MONTH_NAMES[field]}`
  }

  // Single values
  switch (type) {
    case 'minute': return MINUTE_NAMES[field] || `at minute ${field}`
    case 'hour': return HOUR_NAMES[field] || `at hour ${field}`
    case 'dayOfMonth': return `on day ${field} of the month`
    default: return field
  }
}

export function describeCron(expression: string): string[] {
  const parts = expression.trim().split(/\s+/)
  if (parts.length !== 5) {
    return ['Invalid cron expression: must have exactly 5 fields']
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

  const descriptions: string[] = []

  const minuteDesc = describeField(minute, 'minute')
  const hourDesc = describeField(hour, 'hour')
  const dayOfMonthDesc = describeField(dayOfMonth, 'dayOfMonth')
  const monthDesc = describeField(month, 'month')
  const dayOfWeekDesc = describeField(dayOfWeek, 'dayOfWeek')

  descriptions.push(`Runs ${minuteDesc}`)
  descriptions.push(`Runs ${hourDesc}`)
  if (dayOfMonthDesc) descriptions.push(`Runs ${dayOfMonthDesc}`)
  if (monthDesc) descriptions.push(`Runs ${monthDesc}`)
  if (dayOfWeekDesc) descriptions.push(`Runs ${dayOfWeekDesc}`)

  return descriptions
}

export const COMMON_EXPRESSIONS: { label: string; value: string }[] = [
  { label: 'Every minute', value: '* * * * *' },
  { label: 'Every 5 minutes', value: '*/5 * * * *' },
  { label: 'Every 15 minutes', value: '*/15 * * * *' },
  { label: 'Every 30 minutes', value: '*/30 * * * *' },
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 2 hours', value: '0 */2 * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Every day at midnight', value: '0 0 * * *' },
  { label: 'Every day at noon', value: '0 12 * * *' },
  { label: 'Every Sunday', value: '0 0 * * 0' },
  { label: 'Monday to Friday at 9 AM', value: '0 9 * * 1-5' },
  { label: 'First day of month', value: '0 0 1 * *' },
  { label: 'Every midnight', value: '0 0 * * *' },
  { label: 'Every Saturday at midnight', value: '0 0 * * 6' },
]
