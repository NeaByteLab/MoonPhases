import * as THREE from 'three'
import { ta } from '@/core/ta'

/**
 * 3D Moon Phase Renderer with realistic lighting and textures
 */
export class MoonRenderer {
  private scene!: THREE.Scene
  private camera!: THREE.PerspectiveCamera
  private renderer!: THREE.WebGLRenderer
  private moon!: THREE.Mesh
  private light!: THREE.DirectionalLight
  private ambientLight!: THREE.AmbientLight
  private container: HTMLElement
  private animationId: number | null = null
  private targetRotation: { x: number; y: number } = { x: 0, y: 0 }
  private currentRotation: { x: number; y: number } = { x: 0, y: 0 }
  private isTransitioning: boolean = false
  private transitionSpeed: number = 0.05

  /**
   * Initialize 3D moon renderer
   *
   * @param container - HTML container element
   * @throws {Error} If container is invalid
   */
  constructor(container: HTMLElement) {
    if (!container) {
      throw new Error('Container element is required')
    }
    this.container = container
    this.initScene()
    this.createMoon()
    this.setupLighting()
    this.setupControls()
    this.animate()
  }

  /**
   * Initialize Three.js scene
   */
  private initScene(): void {
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a1f)
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    this.camera.position.z = 5
    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
    this.container.appendChild(this.renderer.domElement)
    this.createStarField()
    window.addEventListener('resize', () => this.onWindowResize())
  }

  /**
   * Create star texture with proper star shape
   */
  private createStarTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')!
    const centerX = 16
    const centerY = 16
    const outerRadius = 12
    const innerRadius = 6
    const spikes = 4
    ctx.fillStyle = 'white'
    ctx.beginPath()
    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2
      const radius = i % 2 === 0 ? outerRadius : innerRadius
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(centerX - 0.5, 0, 1, 32)
    ctx.fillRect(0, centerY - 0.5, 32, 1)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.7, 'rgba(255,255,255,0.4)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.globalCompositeOperation = 'source-atop'
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 32, 32)
    const texture = new THREE.CanvasTexture(canvas)
    return texture
  }

  /**
   * Create star field background
   */
  private createStarField(): void {
    const starTexture = this.createStarTexture()
    const starGeometry = new THREE.BufferGeometry()
    const starCount = 300
    const positions = new Float32Array(starCount * 3)
    const sizes = new Float32Array(starCount)
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120
      sizes[i] = Math.random() * 0.8 + 0.3
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    const starMaterial = new THREE.PointsMaterial({
      map: starTexture,
      color: 0xffffff,
      size: 0.8,
      transparent: true,
      alphaTest: 0.1,
      sizeAttenuation: true
    })
    const stars = new THREE.Points(starGeometry, starMaterial)
    this.scene.add(stars)
  }

  /**
   * Create 3D moon mesh with detailed geometry
   */
  private createMoon(): void {
    const geometry = new THREE.SphereGeometry(2, 64, 32)
    const material = new THREE.MeshPhongMaterial({
      color: 0xf5f5dc,
      map: this.createMoonTexture(),
      shininess: 5,
      emissive: 0x111111
    })
    this.moon = new THREE.Mesh(geometry, material)
    this.moon.castShadow = true
    this.moon.receiveShadow = true
    this.scene.add(this.moon)
  }

  /**
   * Create procedural moon surface texture
   *
   * @returns THREE.Texture Moon surface texture
   */
  private createMoonTexture(): THREE.Texture {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.3, '#f0f0f0')
    gradient.addColorStop(0.6, '#e0e0e0')
    gradient.addColorStop(1, '#d0d0d0')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 512
      const radius = Math.random() * 20 + 5
      const alpha = Math.random() * 0.3 + 0.1
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#888888'
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    return texture
  }

  /**
   * Setup lighting for moon phases
   */
  private setupLighting(): void {
    this.ambientLight = new THREE.AmbientLight(0x202040, 0.2)
    this.scene.add(this.ambientLight)
    this.light = new THREE.DirectionalLight(0xffffcc, 1.2)
    this.light.position.set(5, 0, 0)
    this.light.castShadow = true
    this.light.shadow.mapSize.width = 2048
    this.light.shadow.mapSize.height = 2048
    this.light.shadow.camera.near = 0.1
    this.light.shadow.camera.far = 15
    this.scene.add(this.light)
    const rimLight = new THREE.DirectionalLight(0x4466ff, 0.3)
    rimLight.position.set(-5, 2, -2)
    this.scene.add(rimLight)
  }

  /**
   * Setup mouse controls for interaction
   */
  private setupControls(): void {
    let isDragging = false
    let previousMousePosition = { x: 0, y: 0 }
    this.renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
      isDragging = true
      previousMousePosition = { x: e.clientX, y: e.clientY }
    })
    this.renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
      if (!isDragging) {
        return
      }
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      }
      this.currentRotation.y += deltaMove.x * 0.01
      this.currentRotation.x += deltaMove.y * 0.01
      this.targetRotation.y = this.currentRotation.y
      this.targetRotation.x = this.currentRotation.x
      previousMousePosition = { x: e.clientX, y: e.clientY }
    })
    this.renderer.domElement.addEventListener('mouseup', () => {
      isDragging = false
    })
  }

  /**
   * Update moon phase visualization with smooth rotation
   *
   * @param date - Date to display phase for
   * @param animate - Whether to animate transition
   * @throws {Error} If date is invalid
   */
  updatePhase(date: Date, animate: boolean = false): void {
    ta.validateDate(date)
    const phase = ta.moonPhase(date)
    const angle = phase * Math.PI * 2
    this.light.position.set(Math.cos(angle) * 5, 0, Math.sin(angle) * 5)
    const illumination = ta.illumination(phase)
    this.light.intensity = 0.9 + (illumination / 100) * 0.6
    this.ambientLight.intensity = 0.15 + (illumination / 100) * 0.1
    if (animate && !this.isTransitioning) {
      this.animateToPhase(phase)
    } else if (!animate) {
      this.currentRotation.y = phase * Math.PI * 2
      this.targetRotation.y = this.currentRotation.y
      this.isTransitioning = false
    }
  }

  /**
   * Animate moon rotation to show phase progression
   *
   * @param targetPhase - Target phase value (0-1)
   */
  private animateToPhase(targetPhase: number): void {
    const targetY = targetPhase * Math.PI * 2
    let shortestPath = targetY - this.currentRotation.y
    if (shortestPath > Math.PI) {
      shortestPath -= Math.PI * 2
    } else if (shortestPath < -Math.PI) {
      shortestPath += Math.PI * 2
    }
    this.targetRotation.y = this.currentRotation.y + shortestPath
    this.isTransitioning = true
  }

  /**
   * Animation loop
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(() => this.animate())
    if (this.isTransitioning) {
      const deltaY = this.targetRotation.y - this.currentRotation.y
      if (Math.abs(deltaY) < 0.01) {
        this.currentRotation.y = this.targetRotation.y
        this.isTransitioning = false
      } else {
        this.currentRotation.y += deltaY * this.transitionSpeed
      }
    } else {
      this.currentRotation.y += 0.002
      this.targetRotation.y = this.currentRotation.y
    }
    this.moon.rotation.y = this.currentRotation.y
    this.moon.rotation.x = this.currentRotation.x
    this.renderer.render(this.scene, this.camera)
  }

  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    this.renderer.dispose()
    window.removeEventListener('resize', () => this.onWindowResize())
  }
}