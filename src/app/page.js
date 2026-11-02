import { statSync } from "node:fs";
import path from "node:path";
import { preload } from "react-dom";
import PortfolioViewer from "@/components/portfolio3d/Viewer";
import {
  SCENE_PRELOADS,
  TRACKED_ASSETS,
} from "@/components/portfolio3d/loading/sceneAssets";

// Real file sizes, read at build time, so the loading bar can follow the actual
// download even when the server sends no Content-Length (or a compressed one).
function getAssetBytes() {
  const sizes = {};
  for (const [key, url] of Object.entries(TRACKED_ASSETS)) {
    try {
      sizes[key] = statSync(path.join(process.cwd(), "public", url)).size;
    } catch {
      sizes[key] = 0;
    }
  }
  return sizes;
}

export default function Home() {
  // <link rel="preload"> the 3D files so they download together with the HTML/JS
  for (const { href, ...options } of SCENE_PRELOADS) preload(href, options);

  return (
    <main>
      <h1 className="sr-only">
        Erfan Mirasadi — Creative Frontend & 3D Web Developer Portfolio
      </h1>
      <PortfolioViewer assetBytes={getAssetBytes()} />
    </main>
  );
}
