# 🏠 Erfan's 3D Portfolio House

<div align="center">

![3D Portfolio](https://img.shields.io/badge/3D-Portfolio-00ff88?style=for-the-badge&logo=three.js&logoColor=black)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black?style=for-the-badge&logo=next.js)
![React Three Fiber](https://img.shields.io/badge/React%20Three%20Fiber-9.3.0-000000?style=for-the-badge&logo=react&logoColor=61DAFB)
![Blender](https://img.shields.io/badge/Blender-3D%20Modeling-orange?style=for-the-badge&logo=blender&logoColor=white)

**An Immersive 3D Portfolio Experience Built with Blender & Modern Web Technologies**

</div>

---

## ✨ Overview

Welcome to my **3D Interactive Portfolio House** - a cutting-edge digital showcase that combines the power of **Blender 3D modeling** with modern web development. This isn't just a portfolio; it's an immersive journey through my creative universe, where every corner tells a story and every interaction reveals a new dimension of my work.

## 🚀 Features

### 🎨 **Immersive 3D Experience**

- **Full-screen 3D canvas** with cinematic 90° FOV
- **Real-time lighting** with dynamic shadows and bloom effects
- **Performance-optimized** rendering with adaptive quality
- **Smooth camera animations** powered by Theatre.js

### 🏗️ **Interactive House Environment**

- **Custom 3D house model** crafted in Blender
- **Multiple interactive zones** for different portfolio sections
- **Smooth scroll-based navigation** through the experience
- **Responsive design** that adapts to any device

### 🎯 **Portfolio Showcase**

- **Project displays** with interactive elements
- **Skills visualization** through 3D objects
- **Contact integration** seamlessly embedded
- **Professional presentation** of work and achievements

### ⚡ **Technical Excellence**

- **Next.js 15** with React 19 for modern performance
- **Three.js** with React Three Fiber for 3D rendering
- **DRACO compression** for optimized 3D models
- **Post-processing effects** for stunning visual quality

## 🛠️ Tech Stack

| Category         | Technology        | Version |
| ---------------- | ----------------- | ------- |
| **Frontend**     | Next.js           | 15.4.6  |
| **3D Engine**    | Three.js          | 0.179.1 |
| **React 3D**     | React Three Fiber | 9.3.0   |
| **3D Utilities** | React Three Drei  | 10.6.1  |
| **Animation**    | Theatre.js        | 0.7.2   |
| **Styling**      | Tailwind CSS      | 4.0     |
| **Build Tool**   | Yarn              | Latest  |

## 🎬 **3D Model Creation**

This portfolio features a **custom 3D house environment** meticulously crafted in **Blender**:

- **Architectural design** with attention to detail
- **Optimized geometry** for web performance
- **Professional lighting** setup for dramatic effects
- **Interactive elements** designed for user engagement

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Yarn package manager
- Modern browser with WebGL support

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/erfan-3d-portfolio.git
cd erfan-3d-portfolio

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Build & Deploy

```bash
# Build for production
yarn build

# Start production server
yarn start

# Optimize 3D models (optional)
yarn model:draco
```

## 📁 Project Structure

```
erfan-3d-portfolio/
├── 🎭 src/components/portfolio3d/
│   ├── Viewer.jsx              # Main 3D canvas controller
│   ├── scene/
│   │   ├── HouseScene.jsx      # 3D scene orchestration
│   │   └── model/
│   │       └── HouseModel.jsx  # Blender model loader
│   ├── interactables/          # Interactive 3D elements
│   ├── overlays/               # UI overlays & modals
│   └── Loader.jsx              # Loading experience
├── 🎨 public/
│   ├── models/                 # 3D model assets
│   ├── draco/                  # Compression libraries
│   └── images/                 # Texture assets
└── 🎬 scripts/
    └── build-draco.mjs         # 3D model optimization
```

## 🎯 **Interactive Elements**

- **🚪 Door Lock** - Portfolio introduction
- **🌍 Planets** - Skills showcase
- **📚 Books** - Knowledge & education
- **💪 Bodybuilding** - Personal interests
- **🚴 Bike** - Lifestyle & hobbies
- **🎸 Setar** - Cultural background
- **💼 Projects** - Professional work

## 🌟 **Performance Features**

- **Adaptive rendering** based on device capabilities
- **Lazy loading** of 3D assets
- **Optimized shaders** for smooth performance
- **Memory management** for large 3D models
- **Progressive enhancement** for all devices

## 🎨 **Visual Effects**

- **Bloom lighting** for atmospheric glow
- **Dynamic shadows** with soft edges
- **Post-processing** for cinematic quality
- **Environment mapping** for realistic reflections
- **Color grading** for professional aesthetics

## 🔧 **Development Commands**

```bash
# Development
yarn dev              # Start development server
yarn lint             # Run ESLint

# Building
yarn build            # Build for production
yarn start            # Start production server

# 3D Assets
yarn model:draco      # Optimize 3D models
```

## 🌐 **Browser Support**

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ Requires WebGL 2.0 support

## 📱 **Responsive Design**

- **Desktop-first** 3D experience
- **Mobile-optimized** navigation
- **Touch-friendly** interactions
- **Adaptive performance** scaling

## 🎭 **Animation System**

Powered by **Theatre.js** for professional-grade animations:

- **Scroll-based** timeline control
- **Smooth transitions** between sections
- **Performance-optimized** keyframe system
- **Professional** animation workflows

## 🚀 **Deployment**

Optimized for modern hosting platforms:

- **Vercel** (recommended)
- **Netlify**
- **AWS S3 + CloudFront**
- **Any static hosting** with Node.js support

## 🤝 **Contributing**

This is a personal portfolio project, but suggestions and feedback are welcome!

## 📄 **License**

Personal project - All rights reserved.

---

<div align="center">

**Built with ❤️ using Blender, Three.js, and Next.js**

_Experience the future of portfolio presentation_

</div>
