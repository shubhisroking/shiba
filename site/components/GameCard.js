import { useState } from "react";

export default function GameCard({ game, style }) {
  const [imageFailed, setImageFailed] = useState(false);
  const baseStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    aspectRatio: "1 / 1",
    backgroundColor: "white",
    boxSizing: "border-box",
    borderRadius: "8px",
    border: "1px solid black",
    transition: "transform 300ms ease, opacity 300ms ease",
  };
  return (
    <div style={{ ...baseStyle, ...style, overflow: "hidden" }}>
      {!imageFailed ? (
        <img
          src={`/${game.image}`}
          alt={game.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <p style={{ textAlign: "center" }}>{game.name}</p>
      )}
    </div>
  );
}


