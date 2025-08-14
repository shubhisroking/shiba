/* eslint-disable react/prop-types */
import React, { useState } from "react";

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
export default function PlayGameComponent({ gameId, width = "100%", apiBase, style, gameName, thumbnailUrl }) {
  const base = apiBase || process.env.NEXT_PUBLIC_API_BASE || "";
  const normalizedWidth = typeof width === "number" ? `${width}` : width;
  const [started, setStarted] = useState(false);
  const [animating, setAnimating] = useState(false);

  if (!gameId) {
    return <div>Missing gameId.</div>;
  }

  const url = `${base}/play/${encodeURIComponent(gameId)}/`;

  // Aspect-ratio container (always 16:9.6 = 5:3), full width
  return (
    <div
      style={{
        position: "relative",
        width: normalizedWidth,
        aspectRatio: "5 / 3",
        overflow: "hidden",
        ...style,
      }}
    >
      {!started && (
        <button
          type="button"
          onClick={() => {
            if (animating || started) return;
            try {
              const audio = new Audio('/diskSpin.mp3');
              audio.currentTime = 0;
              // Play may return a promise; safely ignore rejection (e.g., autoplay policies)
              const playPromise = audio.play();
              if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
              }
            } catch (_) {}
            setAnimating(true);
            setTimeout(() => {
              setStarted(true);
              setAnimating(false);
            }, 900);
          }}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            background: "#444",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
            justifyContent: "center",
            border: 0,
            borderRadius: 8,
            cursor: "pointer",
            padding: 16,
            boxSizing: "border-box",
            textAlign: "center",
          }}
        >
          <div
            className={`cd${animating ? " animating" : ""}`}
            aria-hidden
            style={thumbnailUrl ? {
              backgroundImage: `url(${thumbnailUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : undefined}
          >
            <div className="cd-overlay" />
          </div>
          <p style={{ margin: 0, fontWeight: 800, opacity: animating ? 0 : 1, transition: "opacity 150ms ease-out" }}>
            {`Tap to start ${gameName ? gameName : "game"}`}
          </p>
          <style jsx>{`
            .cd {
              position: relative;
              width: 180px;
              height: 180px;
              border-radius: 100%;
              border: 1px solid grey;
              background: radial-gradient(circle at 40% 40%, #f0f0f0 0%, #d9d9d9 40%, #c7c7c7 70%, #bdbdbd 100%);
              transform-origin: center;
              transform-style: preserve-3d;
              will-change: transform;
              animation: spinY 6s linear infinite;
            }
            .cd.animating {
              animation: spinZoom 1500ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            .cd-overlay {
              position: absolute;
              inset: 0;
              border-radius: inherit;
              pointer-events: none;
              opacity: 0.18;
              background: conic-gradient(white, white, white, grey, grey, violet, deepskyblue, aqua, palegreen, yellow, orange, red, grey, grey, white, white, white, white, grey, grey, violet, deepskyblue, aqua, palegreen, yellow, orange, red, grey, grey, white);
              mix-blend-mode: screen;
            }
            .cd::before,
            .cd::after {
              content: '';
              position: absolute;
              top: 50%;
              left: 50%;
              border-radius: inherit;
              box-shadow: 0 0 1px grey;
              box-sizing: border-box;
            }
            .cd::before {
              width: 30%;
              height: 30%;
              margin: -15% 0 0 -15%;
              background: lightgrey;
              background-clip: padding-box;
              border: 10px solid rgba(0, 0, 0, 0.2);
            }
            .cd::after {
              width: 18%;
              height: 18%;
              margin: -9% 0 0 -9%;
              background: white;
              background-clip: padding-box;
              border: 10px solid rgba(0, 0, 0, 0.1);
              filter: drop-shadow(0 0 2px grey);
            }
            @keyframes spinY {
              0% { transform: rotateY(0deg); }
              100% { transform: rotateY(360deg); }
            }
            @keyframes spinZoom {
              0% { transform: rotateY(0deg) scale(1); }
              100% { transform: rotateY(720deg) scale(8); }
            }
          `}</style>
        </button>
      )}
      {started && (
        <iframe
          src={url}
          title={`Play ${gameId}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "1px solid #ddd", borderRadius: 8 }}
          allow="autoplay; fullscreen"
        />
      )}
    </div>
  );
}


