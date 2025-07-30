# 🌙 MoonPhases - 3D Lunar Cycle Tracker

A beautiful, interactive 3D moon phase visualization built with Three.js and TypeScript. Track lunar cycles, explore moon phases, and navigate through time with smooth animations.

## ✨ Features

- **3D Moon Visualization** - Realistic moon rendering with proper lighting and textures
- **Interactive Timeline** - Navigate through months and click on specific moon phases
- **Smooth Animations** - Fluid transitions between different lunar phases
- **Real-time Phase Information** - Current phase, illumination percentage, and upcoming events
- **Keyboard Navigation** - Arrow keys for date navigation, shortcuts for New/Full moon
- **Responsive Design** - Works on desktop and mobile devices
- **Astronomical Accuracy** - Uses precise Julian Day calculations for moon phases

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/NeaByteLab/MoonPhases.git
cd MoonPhases

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173/MoonPhases/](http://localhost:5173/MoonPhases/) to view the application.

## 🎮 Controls

### Keyboard Shortcuts
- `←/→` Arrow keys - Navigate days
- `↑/↓` Arrow keys - Navigate weeks  
- `N` - Jump to next New Moon
- `F` - Jump to next Full Moon
- `Space` - Return to today
- `T` - Toggle timeline visibility

### Mouse Controls
- **Drag** - Rotate the 3D moon
- **Click timeline markers** - Jump to specific moon phases

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run typecheck    # Run TypeScript checks
```

### Project Structure

```
src/
├── core/
│   └── ta.ts              # Core astronomical calculations
├── components/
│   ├── MoonRenderer.ts    # 3D moon visualization
│   ├── DateTracker.ts     # Date management and animations
│   └── Timeline.ts        # Interactive timeline component
└── main.ts                # Application entry point
```

### Technical Stack

- **Three.js** - 3D graphics and rendering
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting and formatting

## 🌟 Moon Phase Algorithm

The application uses accurate astronomical calculations:

- **Julian Day Number** conversion for precise date handling
- **Synodic Month** calculations (29.53 days average)
- **Phase illumination** based on sun-moon-earth geometry
- **Next phase predictions** using iterative refinement

## 🎨 Visual Features

- **Procedural Moon Texture** - Realistic crater and surface details
- **Dynamic Lighting** - Sun position changes with moon phase
- **Star Field Background** - Subtle stellar atmosphere
- **Responsive Timeline** - Visual phase markers and date navigation
- **Smooth Animations** - Eased transitions between dates

## 🔧 Configuration

The application uses centralized utilities following Pine Script conventions:

```typescript
// Core astronomical functions
ta.moonPhase(date)        // Get current phase (0-1)
ta.nextNewMoon(date)      // Find next new moon
ta.nextFullMoon(date)     // Find next full moon
ta.illumination(phase)    // Calculate illumination %
ta.daysBetween(d1, d2)    // Days between dates
```

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires WebGL support for 3D rendering.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.