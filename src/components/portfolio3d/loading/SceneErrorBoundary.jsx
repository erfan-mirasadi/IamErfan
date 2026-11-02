"use client";

import { Component } from "react";

// Catches anything that kills the 3D scene (model download failed, no WebGL, ...)
// so the Loader can show a retry message instead of leaving a black page.
export default class SceneErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error("[Loader] 3D scene failed to load", error);
    this.props.onError?.(error);
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
