import { useState, useEffect, useCallback, useRef } from "react";
import AppHead from "@/components/AppHead";
import GameCarousel from "@/components/GameCarousel";
import GameDetails from "@/components/GameDetails";
import useAudioManager from "@/components/useAudioManager";

function MovingBackground() {
  const ICON_SIZE = 64;
  const GAP = 32;
  const SPEED_PX_PER_SECOND = 20; // Adjust to control animation speed
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  useEffect(() => {
    const computeGrid = () => {
      const perCol = ICON_SIZE + GAP;
      const perRow = ICON_SIZE + GAP;
      const cols = Math.ceil((window.innerWidth + GAP) / perCol);
      const rows = Math.ceil((window.innerHeight + GAP) / perRow);
      setGrid({ cols, rows });
    };

    computeGrid();
    window.addEventListener("resize", computeGrid);
    return () => window.removeEventListener("resize", computeGrid);
  }, []);

  const columns = Array.from({ length: grid.cols });
  const rows = Array.from({ length: grid.rows });

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        flexWrap: "nowrap",
        overflow: "hidden",
        pointerEvents: "none",
        gap: GAP,
      }}
    >
      {columns.map((_, colIndex) => {
        const rowsCount = grid.rows || 0;
        const scrollDistance = rowsCount * (ICON_SIZE + GAP);
        const direction = colIndex % 2 === 0 ? "bgScrollUp" : "bgScrollDown";
        const durationSeconds = Math.max(1, scrollDistance / SPEED_PX_PER_SECOND);
        return (
          <div
            key={colIndex}
            style={{
              height: "100%",
              width: ICON_SIZE,
              minWidth: ICON_SIZE,
              flex: `0 0 ${ICON_SIZE}px`,
              overflow: "hidden",
              display: "flex",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: GAP,
                willChange: "transform",
                animationName: direction,
                animationDuration: `${durationSeconds}s`,
                animationTimingFunction: "linear",
                animationIterationCount: "infinite",
                "--scrollDistance": `${scrollDistance}px`,
              }}
            >
              {rows.map((_, rowIndex) => {
                const isSword = (colIndex + rowIndex) % 2 === 0;
                const src = isSword ? "/sword.svg" : "/heart.svg";
                return (
                  <img
                    key={`a-${rowIndex}`}
                    src={src}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    alt=""
                    style={{
                      opacity: 0.3,
                      transformOrigin: "center center",
                      willChange: "transform",
                      animationName: "pulseScale",
                      animationDuration: "2.4s",
                      animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                      animationIterationCount: "infinite",
                      animationDelay: `-${(colIndex * 0.15 + rowIndex * 0.1).toFixed(2)}s`,
                    }}
                  />
                );
              })}
              {rows.map((_, rowIndex) => {
                const isSword = (colIndex + rowIndex) % 2 === 0;
                const src = isSword ? "/sword.svg" : "/heart.svg";
                return (
                  <img
                    key={`b-${rowIndex}`}
                    src={src}
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    alt=""
                    style={{
                      opacity: 0.3,
                      transformOrigin: "center center",
                      willChange: "transform",
                      animationName: "pulseScale",
                      animationDuration: "2.4s",
                      animationTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                      animationIterationCount: "infinite",
                      animationDelay: `-${(colIndex * 0.15 + rowIndex * 0.1 + 1.2).toFixed(2)}s`,
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes bgScrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(-1 * var(--scrollDistance))); }
        }
        @keyframes bgScrollDown {
          0% { transform: translateY(calc(-1 * var(--scrollDistance))); }
          100% { transform: translateY(0); }
        }
        @keyframes pulseScale {
          0% { transform: scale(0.5); }
          40% { transform: scale(1.05); }
          55% { transform: scale(0.95); }
          70% { transform: scale(1.02); }
          100% { transform: scale(0.5); }
        }
      `}</style>
    </div>
  );
}

export default function HomeScreen({ games, setAppOpen, selectedGame, setSelectedGame }) {


  // selectedGame is now controlled by the parent (index.js)
  const [tokyoTime, setTokyoTime] = useState("");

  // Preload SFX and game clip audios for instant playback
  const sfxFiles = ["next.mp3", "prev.mp3", "shiba-bark.mp3"];
  const clipFiles = games.map((g) => g.gameClipAudio).filter(Boolean);
  const { play: playSound, playClip } = useAudioManager([...sfxFiles, ...clipFiles]);

  // When selected game changes, play its clip immediately using the preloaded element
  useEffect(() => {
    const clip = games[selectedGame]?.gameClipAudio;
    if (clip) {
      playClip(clip);
    }
  }, [selectedGame]);

  useEffect(() => {
    const updateTokyoTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Tokyo",
      }).format(now);
      setTokyoTime(formatted);
    };

    updateTokyoTime();
    const intervalId = setInterval(updateTokyoTime, 60 * 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <AppHead title="Shiba" />
      <main style={{ position: "relative", backgroundColor: games[selectedGame].bgColor, transition: "background-color 0.5s ease-in-out", minHeight: "100vh" }}>
        <MovingBackground />
        <div style={{
          position: "absolute",
          top: 16,
          left: 64,
          width: "calc(100% - 128px)",
          borderRadius: 16,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.51)",
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(4px)",
          border: "1px solid rgba(255, 255, 255, 0.35)",
          boxShadow: "inset 0 1px 1.5px rgba(255, 255, 255, 0.6), inset 0 -8px 16px rgba(255, 255, 255, 0.6)",
          borderBottom: "0px solid rgba(0, 0, 0, 0)",
          justifyContent: "space-between",
          padding: 16,
          paddingLeft: 24,
          paddingRight: 24
        }}>
          <div style={{
            display: "flex",
            height: 32,
            width: 32,
            aspectRatio: 1,

            backgroundColor: "white",
            border: "1px solid black",
            borderRadius: 2
          }}>
          </div>
          <p style={{ fontFamily: "GT Maru", fontWeight: "bold" }}>Shiba Arcade</p>
          <p style={{ margin: 0 }}>{tokyoTime}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
          <GameCarousel
            games={games}
            onSelect={setSelectedGame}
            playSound={playSound}
            setAppOpen={setAppOpen}
            selectedIndex={selectedGame}
          />
          <GameDetails game={games[selectedGame]} />
        </div>
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          display: "flex",
          backgroundColor: "rgba(255, 255, 255, 0.35)",
          alignItems: "center",
          backdropFilter: "saturate(180%) blur(14px)",
          WebkitBackdropFilter: "saturate(180%) blur(14px)",
          border: "1px solid #fff",
          boxShadow: "none",
          justifyContent: "space-between",
          paddingLeft: 16,
          paddingRight: 16,
          paddingTop: 32,
          paddingBottom: 32,
          WebkitClipPath: "polygon(0 0, 88px 0, 88px 64px, calc(100% - 88px) 64px, calc(100% - 88px) 0, 100% 0, 100% 100%, 0 100%)",
          clipPath: "polygon(0 0, 88px 0, 88px 64px, calc(100% - 88px) 64px, calc(100% - 88px) 0, 100% 0, 100% 100%, 0 100%)",
        }}>
          <div style={{
            display: "flex",
            height: 48,
            marginTop: -24,
            width: 48,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            aspectRatio: 1,
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "4px",
            padding: 8,
            boxSizing: "border-box",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img
              src="./ChatMessage.svg"
              alt="Chat Message"
              style={{
                width: "100%",
                opacity: 0.85,
                height: "100%",
                objectFit: "contain"
              }}
            />
          </div>
          <div style={{
            display: "flex",
            height: 64,
            width: "100%",
            marginLeft: 24,
            marginRight: 24,
            borderRadius: "0px 0px 16px 16px",
            marginTop: -33,
            backgroundColor: "transparent",
          }}>
          </div>
          <div
            onClick={() => playSound("shiba-bark.mp3")}
            style={{
              display: "flex",
              height: 48,
              width: 48,
              marginTop: -24,
              backgroundImage: `url(./shiba-photo.png)`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              aspectRatio: 1,
              border: "1px solid rgba(0, 0, 0, 0.1)",
              borderRadius: 4
            }}
          >
          </div>

        </div>
      </main>
    </>
  );
}


