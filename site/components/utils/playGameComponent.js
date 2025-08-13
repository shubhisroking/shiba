/* eslint-disable react/prop-types */
import React from "react";

/**
 * Renders a game from the Shiba API in an iframe.
 *
 * Props:
 * - gameId: string (required)
 * - width: number|string (optional) iframe width, e.g., 800 or "100%" (default: "100%")
 * - height: number|string (optional) iframe height, e.g., 600 or "600" (default: 600)
 * - apiBase: string (optional) override API base URL; defaults to NEXT_PUBLIC_API_BASE or same-origin
 * - style: React.CSSProperties (optional)
 */
export default function PlayGameComponent({ gameId, width = "100%", height = 600, apiBase, style }) {
  const base = apiBase || process.env.NEXT_PUBLIC_API_BASE || "";
  const normalizedWidth = typeof width === "number" ? `${width}` : width;
  const normalizedHeight = typeof height === "number" ? `${height}` : height;

  if (!gameId) {
    return <div>Missing gameId.</div>;
  }

  const url = `${base}/play/${encodeURIComponent(gameId)}/`;

  return (
    <iframe
      src={url}
      title={`Play ${gameId}`}
      width={normalizedWidth}
      height={normalizedHeight}
      style={{ border: "1px solid #ddd", borderRadius: 8, ...style }}
      allow="autoplay; fullscreen"
    />
  );
}


