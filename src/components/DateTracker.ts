import { ta } from '@/core/ta'

/**
 * Date tracking and phase transition manager
 */
export class DateTracker {
  private currentDate: Date
  private onDateChange: (date: Date) => void
  private animationSpeed: number = 1
  private isAnimating: boolean = false
  private _targetDate: Date | null = null
  private animationId: number | null = null
  private lastUpdateTime: number = 0
  private readonly updateThrottle: number = 100

  /**
   * Initialize date tracker
   *
   * @param initialDate - Starting date
   * @param onDateChange - Callback for date changes
   * @throws {Error} If parameters are invalid
   */
  constructor(initialDate: Date = new Date(), onDateChange: (date: Date) => void) {
    ta.validateDate(initialDate, 'initialDate')
    if (typeof onDateChange !== 'function') {
      throw new Error('onDateChange must be a function')
    }
    this.currentDate = new Date(initialDate)
    this.onDateChange = onDateChange
  }

  /**
   * Get current date
   *
   * @returns Current date
   */
  getCurrentDate(): Date {
    return new Date(this.currentDate)
  }

  /**
   * Set new date with optional animation
   *
   * @param date - Target date
   * @param animate - Whether to animate transition
   * @throws {Error} If date is invalid
   */
  setDate(date: Date, animate: boolean = false): void {
    ta.validateDate(date)
    if (animate) {
      this.animateToDate(date)
    } else {
      this.currentDate = new Date(date)
      this.onDateChange(this.currentDate)
    }
  }

  /**
   * Jump to next new moon
   *
   * @param animate - Whether to animate transition
   */
  goToNextNewMoon(animate: boolean = true): void {
    const nextNewMoon = ta.nextNewMoon(this.currentDate)
    this.setDate(nextNewMoon, animate)
  }

  /**
   * Jump to next full moon
   *
   * @param animate - Whether to animate transition
   */
  goToNextFullMoon(animate: boolean = true): void {
    const nextFullMoon = ta.nextFullMoon(this.currentDate)
    this.setDate(nextFullMoon, animate)
  }

  /**
   * Add days to current date
   *
   * @param days - Number of days to add
   * @param animate - Whether to animate transition
   * @throws {Error} If days is not a number
   */
  addDays(days: number, animate: boolean = false): void {
    if (typeof days !== 'number' || isNaN(days)) {
      throw new Error('Days must be a valid number')
    }
    const newDate = new Date(this.currentDate)
    newDate.setDate(newDate.getDate() + days)
    this.setDate(newDate, animate)
  }

  /**
   * Set animation speed
   *
   * @param speed - Animation speed multiplier
   * @throws {Error} If speed is invalid
   */
  setAnimationSpeed(speed: number): void {
    if (typeof speed !== 'number' || speed <= 0) {
      throw new Error('Speed must be a positive number')
    }
    this.animationSpeed = speed
  }

  /**
   * Animate to target date
   *
   * @param targetDate - Date to animate to
   */
  private animateToDate(targetDate: Date): void {
    if (this.isAnimating && this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.isAnimating = true
    this._targetDate = new Date(targetDate)
    const startDate = new Date(this.currentDate)
    const totalDuration = Math.abs(targetDate.getTime() - startDate.getTime())
    const startTime = Date.now()
    const animate = (): void => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / (totalDuration / this.animationSpeed), 1)
      const easeProgress = this.easeInOutCubic(progress)
      const currentTime = startDate.getTime() + (targetDate.getTime() - startDate.getTime()) * easeProgress
      this.currentDate = new Date(currentTime)
      const now = Date.now()
      if (now - this.lastUpdateTime >= this.updateThrottle || progress >= 1) {
        this.onDateChange(this.currentDate)
        this.lastUpdateTime = now
      }
      if (progress < 1) {
        this.animationId = requestAnimationFrame(animate)
      } else {
        this.isAnimating = false
        this._targetDate = null
      }
    }
    animate()
  }

  /**
   * Easing function for smooth animations
   *
   * @param t - Progress value (0-1)
   * @returns Eased progress value
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  /**
   * Get current moon phase info
   *
   * @returns Phase info object
   */
  getCurrentPhaseInfo(): { phase: number; name: string; illumination: number; nextNewMoon: Date; nextFullMoon: Date } {
    const phase = ta.moonPhase(this.currentDate)
    return {
      phase,
      name: ta.phaseName(phase),
      illumination: ta.illumination(phase),
      nextNewMoon: ta.nextNewMoon(this.currentDate),
      nextFullMoon: ta.nextFullMoon(this.currentDate)
    }
  }

  /**
   * Stop any running animations
   */
  stopAnimation(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.isAnimating = false
    this._targetDate = null
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopAnimation()
  }
}