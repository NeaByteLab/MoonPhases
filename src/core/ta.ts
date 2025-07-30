/**
 * Technical Analysis utilities for moon phase calculations
 * Following Pine Script naming conventions
 */

export class ta {
  /**
   * Validate date input
   *
   * @param date - Date to validate
   * @param paramName - Parameter name for error message
   * @throws {Error} If date is invalid
   */
  static validateDate(date: Date, paramName: string = 'date'): void {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error(`Invalid ${paramName} provided`)
    }
  }
  /**
   * Calculate moon phase for given date using accurate astronomical algorithm
   *
   * @param date - Date to calculate phase for
   * @returns Moon phase value (0-1, where 0=New Moon, 0.5=Full Moon)
   * @throws {Error} If date is invalid
   */
  static moonPhase(date: Date): number {
    this.validateDate(date)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const jd = this.julianDay(year, month, day, hour, minute, second)
    const newMoonJD = 2451549.5
    const synodicMonth = 29.53058868
    const phase = ((jd - newMoonJD) % synodicMonth) / synodicMonth
    return phase < 0 ? phase + 1 : phase
  }

  /**
   * Calculate Julian Day Number
   *
   * @param year - Year
   * @param month - Month (1-12)
   * @param day - Day
   * @param hour - Hour (0-23)
   * @param minute - Minute (0-59)
   * @param second - Second (0-59)
   * @returns Julian Day Number
   * @throws {Error} If parameters are invalid
   */
  static julianDay(year: number, month: number, day: number, hour: number = 0, minute: number = 0, second: number = 0): number {
    if (year < -4712 || month < 1 || month > 12 || day < 1 || day > 31) {
      throw new Error('Invalid date parameters')
    }
    if (month <= 2) {
      year -= 1
      month += 12
    }
    const a = Math.floor(year / 100)
    const b = 2 - a + Math.floor(a / 4)
    const dayFraction = (hour + minute / 60 + second / 3600) / 24
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + dayFraction + b - 1524.5
  }

  /**
   * Get moon phase name from phase value
   *
   * @param phase - Phase value (0-1)
   * @returns Phase name
   * @throws {Error} If phase is out of range
   */
  static phaseName(phase: number): string {
    if (phase < 0 || phase > 1) {
      throw new Error('Phase must be between 0 and 1')
    }
    if (phase < 0.0625) {
      return 'New Moon'
    }
    if (phase < 0.1875) {
      return 'Waxing Crescent'
    }
    if (phase < 0.3125) {
      return 'First Quarter'
    }
    if (phase < 0.4375) {
      return 'Waxing Gibbous'
    }
    if (phase < 0.5625) {
      return 'Full Moon'
    }
    if (phase < 0.6875) {
      return 'Waning Gibbous'
    }
    if (phase < 0.8125) {
      return 'Last Quarter'
    }
    if (phase < 0.9375) {
      return 'Waning Crescent'
    }
    return 'New Moon'
  }

  /**
   * Calculate illumination percentage
   *
   * @param phase - Phase value (0-1)
   * @returns Illumination percentage (0-100)
   * @throws {Error} If phase is out of range
   */
  static illumination(phase: number): number {
    if (phase < 0 || phase > 1) {
      throw new Error('Phase must be between 0 and 1')
    }
    return Math.abs(Math.cos(phase * 2 * Math.PI)) * 100
  }

  /**
   * Find next new moon date using optimized bisection search
   *
   * @param fromDate - Starting date
   * @returns Date of next new moon
   * @throws {Error} If fromDate is invalid
   */
  static nextNewMoon(fromDate: Date): Date {
    this.validateDate(fromDate, 'fromDate')
    return this.findNextPhase(fromDate, 0, 'new moon')
  }

  /**
   * Find next full moon date using optimized bisection search
   *
   * @param fromDate - Starting date
   * @returns Date of next full moon
   * @throws {Error} If fromDate is invalid
   */
  static nextFullMoon(fromDate: Date): Date {
    this.validateDate(fromDate, 'fromDate')
    return this.findNextPhase(fromDate, 0.5, 'full moon')
  }

  /**
   * Calculate days between two dates
   *
   * @param fromDate - Starting date
   * @param toDate - Target date
   * @returns Number of days (can be negative if toDate is before fromDate)
   * @throws {Error} If dates are invalid
   */
  static daysBetween(fromDate: Date, toDate: Date): number {
    this.validateDate(fromDate, 'fromDate')
    this.validateDate(toDate, 'toDate')
    const msPerDay = 24 * 60 * 60 * 1000
    const fromTime = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()).getTime()
    const toTime = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()).getTime()
    return Math.round((toTime - fromTime) / msPerDay)
  }

  /**
   * Format relative time string
   *
   * @param days - Number of days
   * @returns Formatted relative time string
   * @throws {Error} If days is not a number
   */
  static formatRelativeTime(days: number): string {
    if (typeof days !== 'number' || isNaN(days)) {
      throw new Error('Days must be a valid number')
    }
    if (days === 0) {
      return 'Today'
    }
    if (days === 1) {
      return 'Tomorrow'
    }
    if (days === -1) {
      return 'Yesterday'
    }
    if (days > 0) {
      return `In ${days} days`
    }
    return `${Math.abs(days)} days ago`
  }

  /**
   * Find all major phase events in date range
   *
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Array of phase events with dates and types
   * @throws {Error} If dates are invalid
   */
  static findPhaseEvents(startDate: Date, endDate: Date): Array<{ date: Date; type: string; phase: number }> {
    this.validateDate(startDate, 'startDate')
    this.validateDate(endDate, 'endDate')
    const events: Array<{ date: Date; type: string; phase: number }> = []
    const searchDate = new Date(startDate)
    searchDate.setDate(searchDate.getDate() - 2)
    const endTime = endDate.getTime() + (2 * 24 * 60 * 60 * 1000)
    while (searchDate.getTime() <= endTime) {
      const phase = this.moonPhase(searchDate)
      const prevDate = new Date(searchDate)
      prevDate.setDate(prevDate.getDate() - 1)
      const prevPhase = this.moonPhase(prevDate)
      const nextDate = new Date(searchDate)
      nextDate.setDate(nextDate.getDate() + 1)
      const nextPhase = this.moonPhase(nextDate)
      let phaseType = ''
      if (phase < 0.05 && (prevPhase > 0.95 || nextPhase > 0.05)) {
        phaseType = 'new-moon'
      } else if (Math.abs(phase - 0.5) < 0.05 && (Math.abs(prevPhase - 0.5) > 0.05 || Math.abs(nextPhase - 0.5) > 0.05)) {
        phaseType = 'full-moon'
      } else if (Math.abs(phase - 0.25) < 0.05 && (Math.abs(prevPhase - 0.25) > 0.05 || Math.abs(nextPhase - 0.25) > 0.05)) {
        phaseType = 'quarter'
      } else if (Math.abs(phase - 0.75) < 0.05 && (Math.abs(prevPhase - 0.75) > 0.05 || Math.abs(nextPhase - 0.75) > 0.05)) {
        phaseType = 'quarter'
      }
      if (phaseType && searchDate >= startDate && searchDate <= endDate) {
        events.push({ date: new Date(searchDate), type: phaseType, phase })
      }
      searchDate.setDate(searchDate.getDate() + 1)
    }
    return events
  }

  /**
   * Find next occurrence of specific phase using optimized search
   *
   * @param fromDate - Starting date
   * @param targetPhase - Target phase (0-1)
   * @param phaseName - Phase name for error messages
   * @returns Date of next phase occurrence
   * @throws {Error} If phase cannot be found
   */
  private static findNextPhase(fromDate: Date, targetPhase: number, phaseName: string): Date {
    const date = new Date(fromDate)
    date.setHours(date.getHours() + 1)
    const synodicMonth = 29.53
    const maxDays = synodicMonth + 1
    let bestDate = new Date(date)
    let bestDiff = 1
    for (let hours = 0; hours < maxDays * 24; hours += 2) {
      const currentDate = new Date(date.getTime() + (hours * 60 * 60 * 1000))
      const phase = this.moonPhase(currentDate)
      let diff = Math.abs(phase - targetPhase)
      if (diff > 0.5) {
        diff = 1 - diff
      }
      if (diff < bestDiff) {
        bestDiff = diff
        bestDate = new Date(currentDate)
      }
      if (bestDiff < 0.02) {
        return this.refinePhaseDate(bestDate, targetPhase)
      }
    }
    if (bestDiff < 0.1) {
      return this.refinePhaseDate(bestDate, targetPhase)
    }
    throw new Error(`Could not find next ${phaseName} within search range`)
  }

  /**
   * Refine phase date to higher precision
   *
   * @param approximateDate - Approximate phase date
   * @param targetPhase - Target phase (0-1)
   * @returns Refined date
   */
  private static refinePhaseDate(approximateDate: Date, targetPhase: number): Date {
    let bestDate = new Date(approximateDate)
    let bestDiff = Math.abs(this.moonPhase(bestDate) - targetPhase)
    if (bestDiff > 0.5) {
      bestDiff = 1 - bestDiff
    }
    for (let minutes = -720; minutes <= 720; minutes += 30) {
      const testDate = new Date(approximateDate.getTime() + (minutes * 60 * 1000))
      const phase = this.moonPhase(testDate)
      let diff = Math.abs(phase - targetPhase)
      if (diff > 0.5) {
        diff = 1 - diff
      }
      if (diff < bestDiff) {
        bestDiff = diff
        bestDate = new Date(testDate)
      }
    }
    return bestDate
  }
}