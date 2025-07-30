import { ta } from '@/core/ta'

/**
 * Lunar cycle history timeline component
 */
export class Timeline {
  private container!: HTMLElement
  private track!: HTMLElement
  private cursor!: HTMLElement
  private monthDisplay!: HTMLElement
  private prevButton!: HTMLElement
  private nextButton!: HTMLElement
  private currentDate: Date
  private timelineMonth: Date
  private onDateSelect: (date: Date) => void

  /**
   * Initialize timeline component
   *
   * @param onDateSelect - Callback when date is selected
   * @throws {Error} If required elements not found
   */
  constructor(onDateSelect: (date: Date) => void) {
    if (typeof onDateSelect !== 'function') {
      throw new Error('onDateSelect must be a function')
    }
    this.onDateSelect = onDateSelect
    this.currentDate = new Date()
    this.timelineMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1)
    this.initElements()
    this.setupEventListeners()
    this.render()
  }

  /**
   * Initialize DOM elements
   *
   * @throws {Error} If required elements not found
   */
  private initElements(): void {
    this.container = document.getElementById('timeline-container')!
    this.track = document.getElementById('timeline-track')!
    this.cursor = document.getElementById('timeline-cursor')!
    this.monthDisplay = document.getElementById('timeline-month')!
    this.prevButton = document.getElementById('prev-month')!
    this.nextButton = document.getElementById('next-month')!
    if (!this.container || !this.track || !this.cursor || !this.monthDisplay || !this.prevButton || !this.nextButton) {
      throw new Error('Required timeline elements not found')
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.prevButton.addEventListener('click', () => {
      this.timelineMonth.setMonth(this.timelineMonth.getMonth() - 1)
      this.render()
    })
    this.nextButton.addEventListener('click', () => {
      this.timelineMonth.setMonth(this.timelineMonth.getMonth() + 1)
      this.render()
    })
    this.container.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target && target.classList.contains('phase-marker')) {
        const dateStr = target.dataset.date
        if (dateStr) {
          const date = new Date(dateStr)
          this.onDateSelect(date)
        }
      }
    })
  }

  /**
   * Update current date and refresh display
   *
   * @param date - New current date
   * @throws {Error} If date is invalid
   */
  updateCurrentDate(date: Date): void {
    ta.validateDate(date)
    this.currentDate = new Date(date)
    this.updateCursor()
  }

  /**
   * Render timeline for current month
   */
  private render(): void {
    this.monthDisplay.textContent = this.timelineMonth.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    })
    this.track.innerHTML = ''
    setTimeout(() => {
      this.renderDayMarkers()
      this.renderPhaseMarkers()
      this.updateCursor()
    }, 10)
  }

  /**
   * Render day markers for the month
   */
  private renderDayMarkers(): void {
    const daysInMonth = new Date(this.timelineMonth.getFullYear(), this.timelineMonth.getMonth() + 1, 0).getDate()
    for (let day = 1; day <= daysInMonth; day++) {
      const dayMarker = document.createElement('div')
      dayMarker.className = 'day-marker'
      if (day % 7 === 1 || day === 1 || day === 15 || day === daysInMonth) {
        dayMarker.classList.add('major')
      }
      const position = ((day - 1) / (daysInMonth - 1)) * 100
      dayMarker.style.left = `${position}%`
      this.track.appendChild(dayMarker)
    }
  }

  /**
   * Render phase markers for the month
   */
  private renderPhaseMarkers(): void {
    const monthStart = new Date(this.timelineMonth)
    const monthEnd = new Date(this.timelineMonth.getFullYear(), this.timelineMonth.getMonth() + 1, 0)
    const daysInMonth = monthEnd.getDate()
    const phases = ta.findPhaseEvents(monthStart, monthEnd)
    phases.forEach(phaseData => {
      const marker = document.createElement('div')
      marker.className = `phase-marker ${phaseData.type}`
      marker.dataset.date = phaseData.date.toISOString()
      const phaseName = ta.phaseName(phaseData.phase)
      const dateStr = phaseData.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      marker.title = `${phaseName} - ${dateStr}`
      marker.setAttribute('title', `${phaseName} - ${dateStr}`)
      const dayOfMonth = phaseData.date.getDate()
      const position = daysInMonth === 1 ? 50 : ((dayOfMonth - 1) / (daysInMonth - 1)) * 100
      marker.style.left = `${Math.max(0, Math.min(100, position))}%`
      marker.style.position = 'absolute'
      if (this.isSameDay(phaseData.date, this.currentDate)) {
        marker.classList.add('current')
      }
      this.track.appendChild(marker)
    })
  }

  /**
   * Update cursor position
   */
  private updateCursor(): void {
    if (this.currentDate.getMonth() === this.timelineMonth.getMonth() &&
        this.currentDate.getFullYear() === this.timelineMonth.getFullYear()) {
      const daysInMonth = new Date(this.timelineMonth.getFullYear(), this.timelineMonth.getMonth() + 1, 0).getDate()
      const currentDay = this.currentDate.getDate()
      const position = ((currentDay - 1) / (daysInMonth - 1)) * 100
      this.cursor.style.left = `${position}%`
      this.cursor.style.display = 'block'
    } else {
      this.cursor.style.display = 'none'
    }
  }

  /**
   * Check if two dates are the same day
   *
   * @param date1 - First date
   * @param date2 - Second date
   * @returns True if same day
   */
  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }
}