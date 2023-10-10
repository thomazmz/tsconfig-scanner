import crypto from 'crypto'

export function createCommaSeparatedList(array?: string[], defaultValue: string = '*'): string {
  return Array.isArray(array) && array.length > 0 ? array.join(',') : defaultValue
}

export function createStringHash(stringValue: string, algorithm: string = 'sha256'): string {
  return crypto.createHash(algorithm)
    .update(stringValue)
    .digest('hex')
}

export function createStringJson(value: any): string {
  return JSON.stringify(value, null, 2)
}

export function throwCaseNull<T>(value: any): T {
  if(value == null) {
    throw new Error(`Could not parse null property`)
  }

  return value
}

const MILISECONDS_IN_A_SECOND = 1000

const MILISECONDS_IN_A_MINUTE = 60 * MILISECONDS_IN_A_SECOND 

const MILISECONDS_IN_A_HOUR = 60 * MILISECONDS_IN_A_MINUTE

const MILISECONDS_IN_A_DAY = 24 * MILISECONDS_IN_A_HOUR

export function getDailyDateRange(date: Date): [ Date, Date ] {
  const time = date.getTime()
  const startTime = time - (time % MILISECONDS_IN_A_DAY)
  const endTime = new Date(startTime + MILISECONDS_IN_A_DAY - 1)
  return [ new Date(startTime), new Date(endTime) ]
}
