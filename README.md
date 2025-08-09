# 3D Portfolio House

Interactive portfolio showcase inside a 3D house environment.

## Quick Start

Install dependencies:

```bash
yarn install
```

Add your house model to `public/models/main.glb` (47MB GLB supported).

Run development server:

```bash
yarn dev
```

Build for production:

```bash
yarn build
yarn start
```

## Structure

- `src/components/portfolio3d/Viewer.jsx`: Full-screen 3D canvas
- `src/components/portfolio3d/scene/HouseScene.jsx`: Main house scene
- `src/components/portfolio3d/scene/model/HouseModel.jsx`: GLB model loader

## Features

- ✅ Full-screen 3D experience (90° FOV for wide-angle feel)
- ✅ Server-side rendering (3D client-only)
- ✅ Optimized for large models (47MB+ GLB files)
- ✅ Static showcase (no animations)
- ✅ OrbitControls navigation
- ✅ Long cache headers for assets
