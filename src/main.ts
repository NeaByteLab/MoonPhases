import { MoonRenderer } from '@/components/MoonRenderer'
import { DateTracker } from '@/components/DateTracker'
import { Timeline } from '@/components/Timeline'
import { ta } from '@/core/ta'

/**
 * Main application class for 3D Moon Phase Tracker
 */
class MoonPhaseApp {
  private moonRenderer!: MoonRenderer
  private dateTracker!: DateTracker
  private timeline!: Timeline
  private dateDisplay!: HTMLElement
  private phaseDisplay!: HTMLElement
  private _isAnimating: boolean = false
  private isUpdatingFromTimeline: boolean = false

  /**
   * Initialize the application
   */
  constructor() {
    this.initUI()
    this.initRenderer()
    this.initDateTracker()
    this.initTimeline()
    this.setupKeyboardControls()
    this.updateUI()
  }

  /**
   * Initialize UI elements
   */
  private initUI(): void {
    this.dateDisplay = document.getElementById('date-display')!
    this.phaseDisplay = document.getElementById('phase-display')!
    if (!this.dateDisplay || !this.phaseDisplay) {
      throw new Error('Required UI elements not found')
    }
  }

  /**
   * Initialize 3D moon renderer
   */
  private initRenderer(): void {
    const container = document.getElementById('moon-container')
    if (!container) {
      throw new Error('Moon container not found')
    }
    this.moonRenderer = new MoonRenderer(container)
  }

  /**
   * Initialize date tracking system
   */
  private initDateTracker(): void {
    this.dateTracker = new DateTracker(new Date(), (date: Date) => {
      this.moonRenderer.updatePhase(date, false)
      if (!this.isUpdatingFromTimeline) {
        this.timeline.updateCurrentDate(date)
      }
      this.updateUI()
    })
  }

  /**
   * Initialize timeline component
   */
  private initTimeline(): void {
    this.timeline = new Timeline((date: Date) => {
      this.isUpdatingFromTimeline = true
      this.dateTracker.stopAnimation()
      this.moonRenderer.updatePhase(date, true)
      this.dateTracker.setDate(date, false)
      setTimeout(() => {
        this.isUpdatingFromTimeline = false
      }, 1500)
    })
  }

  /**
   * Setup keyboard controls for navigation
   */
  private setupKeyboardControls(): void {
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      this._isAnimating = true
      switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        this.dateTracker.addDays(-1, true)
        break
      case 'ArrowRight':
        e.preventDefault()
        this.dateTracker.addDays(1, true)
        break
      case 'ArrowUp':
        e.preventDefault()
        this.dateTracker.addDays(-7, true)
        break
      case 'ArrowDown':
        e.preventDefault()
        this.dateTracker.addDays(7, true)
        break
      case 'n':
      case 'N':
        e.preventDefault()
        this.dateTracker.goToNextNewMoon(true)
        break
      case 'f':
      case 'F':
        e.preventDefault()
        this.dateTracker.goToNextFullMoon(true)
        break
      case ' ':
        e.preventDefault()
        this.dateTracker.setDate(new Date(), true)
        break
      case 't':
      case 'T':
        e.preventDefault()
        this.toggleTimeline()
        break
      }
      setTimeout(() => {
        this._isAnimating = false
      }, 2000)
    })
  }

  /**
   * Update UI display elements
   */
  private updateUI(): void {
    const currentDate = this.dateTracker.getCurrentDate()
    const phaseInfo = this.dateTracker.getCurrentPhaseInfo()
    this.dateDisplay.textContent = currentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const nextNewMoonDate = phaseInfo.nextNewMoon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const nextFullMoonDate = phaseInfo.nextFullMoon.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const daysToNewMoon = ta.daysBetween(currentDate, phaseInfo.nextNewMoon)
    const daysToFullMoon = ta.daysBetween(currentDate, phaseInfo.nextFullMoon)
    const newMoonRelative = ta.formatRelativeTime(daysToNewMoon)
    const fullMoonRelative = ta.formatRelativeTime(daysToFullMoon)
    this.phaseDisplay.innerHTML = `
      <div><strong>${phaseInfo.name}</strong> (${Math.round(phaseInfo.illumination)}% illuminated)</div>
      <div style="margin-top: 8px; font-size: 12px;">
        <div>Next New Moon: ${nextNewMoonDate} <span style="opacity: 0.8;">(${newMoonRelative})</span></div>
        <div>Next Full Moon: ${nextFullMoonDate} <span style="opacity: 0.8;">(${fullMoonRelative})</span></div>
      </div>
      <div style="margin-top: 10px; font-size: 11px; opacity: 0.7;">
        <div>← → : Days | ↑ ↓ : Weeks | T: Timeline</div>
        <div>N: New Moon | F: Full Moon | Space: Today</div>
      </div>
    `
  }

  /**
   * Toggle timeline visibility
   */
  private toggleTimeline(): void {
    const timelinePanel = document.getElementById('timeline-panel')
    if (timelinePanel) {
      if (timelinePanel.style.display === 'none') {
        timelinePanel.style.display = 'block'
      } else {
        timelinePanel.style.display = 'none'
      }
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    new MoonPhaseApp()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to initialize Moon Phase App:', error)
    document.body.innerHTML = `
      <div style="color: white; text-align: center; margin-top: 50px;">
        <h1>Error</h1>
        <p>Failed to load 3D Moon Phase application.</p>
        <p style="font-size: 12px; opacity: 0.7;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    `
  }
})