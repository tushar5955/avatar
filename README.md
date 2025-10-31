# Avatar Project

This is a Vite + React TypeScript project featuring a cybernetic avatar and a 3D, parametric solar system where the cybernetic face acts as the central sun.

## Features
- Modular avatar components (face, eyes, data particles)
- 3D Solar System built with React Three Fiber and Drei
  - Circular orbits using x=r*cos(ωt), y=r*sin(ωt), z=r*sin(i)*sin(ωt)
  - Scaled orbital radii and periods based on real planetary data
  - Accelerated time (default: 1 second = 1 Earth day)
  - Orbit trails, exaggerated planet sizes for visibility, optional axial rotation
  - Central solar illumination from the cybernetic face
- Easily extendable for new avatar features and celestial bodies (moons, asteroid belts)
- Modern React + TypeScript codebase
- Vite for fast development and builds

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open the app and use the mouse to orbit the camera around the scene.

### Build
```bash
npm run build
```

## Project Structure
```
avatar-app/
  src/
    components/
      Avatar.tsx
      solar/
        SolarSystem.tsx        # Main solar system component
        OrbitingBody.tsx       # Generic orbiting body with parametric motion + trail
        planetData.ts          # Planet specs: radii, periods, inclinations, colors
      cybernetic/
        CyberneticFace.tsx
        CyberneticEyes.tsx
        DataParticles.tsx
    App.tsx
    main.tsx
  public/
  styles/
  package.json
  vite.config.ts
```

## License
MIT

## Tuning and Extensibility

- Solar system props (see `SolarSystem.tsx`):
  - timeScaleDaysPerSec: number (default 1) — e.g. 2 means 1 sec = 2 Earth days
  - sizeScale: number (default 2.2) — multiplies planet visual radii
  - showOrbitRings: boolean (default true)
  - showTrails: boolean (default true)

- Change orbital scaling in `planetData.ts` via `AU_TO_UNITS`.

- Add a moon or satellite: nest another `OrbitingBody` as a child of a planet's `OrbitingBody`.
  Example included: Earth's Moon has a small local orbit.

- Add an asteroid belt: render many small `OrbitingBody` instances with randomized phases, colors, and radii at a chosen AU band (e.g., 2–3.5 AU).

---

For more information, see the [GitHub repository](https://github.com/tushar5955/avatar.git).
