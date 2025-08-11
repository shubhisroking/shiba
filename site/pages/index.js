import Head from "next/head";
import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";

function GameCard({ game, style }) {
  const [imageFailed, setImageFailed] = useState(false);
  const baseStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    aspectRatio: "1 / 1",
    boxSizing: "border-box",
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

export default function Home() {


    const games = [
        {
            name: "Shop",
            description: "Purchase items from the shop.",
            image: "Shop.png",
        },
        {
            name: "Play",
            description: "Use playtest tickets to play games by others.",
            image: "Play.png",
        },
        {
            name: "My Games",
            description: "Create, update, and ship your games",
            image: "MyGames.png",
        },
        {
            name: "Profile",
            description: "View and edit your profile.",
            image: "Profile.png",
        },
        {
            name: "Global Activity",
            description: "View the global activity feed.",
            image: "GlobalActivity.png",
        },
        {
            name: "Docs",
            description: "Learn how to use Shiba.",
            image: "Docs.png",
        },
        
    ];

    const [selectedGame, setSelectedGame] = useState(0);
    const numGames = games.length;

    const [viewportRef, embla] = useEmblaCarousel({
      loop: true,
      align: "center",
      slidesToScroll: 1,
    });

    const [soundsToPlay, setSoundsToPlay] = useState([]);
    const soundIdRef = useRef(0);
    const playSound = useCallback((fileName) => {
      const id = soundIdRef.current++;
      setSoundsToPlay((prev) => [...prev, { id, fileName }]);
    }, []);

    const handleAudioDone = useCallback((id) => {
      setSoundsToPlay((prev) => prev.filter((s) => s.id !== id));
    }, []);

    const handleKeyDown = useCallback(
        (event) => {
            if (event.key === "ArrowRight") {
                event.preventDefault();
                playSound("next.mp3");
                if (embla) embla.scrollNext();
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                playSound("prev.mp3");
                if (embla) embla.scrollPrev();
            }
        },
        [embla, playSound]
    );

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [handleKeyDown]);

    useEffect(() => {
        if (!embla) return undefined;
        const onSelect = () => {
            const idx = embla.selectedScrollSnap();
            setSelectedGame(idx);
        };
        embla.on("select", onSelect);
        onSelect();
        return () => {
            embla.off("select", onSelect);
        };
    }, [embla]);

    const leftNeighborIndex = (selectedGame - 1 + numGames) % numGames;
    const rightNeighborIndex = (selectedGame + 1) % numGames;

    const getCardStyle = useCallback(
      (idx) => {
        const isActive = idx === selectedGame;
        const isNeighbor = idx === leftNeighborIndex || idx === rightNeighborIndex;
        if (isActive) return { opacity: 1, transform: "scale(1.0)" };
        if (isNeighbor) return { opacity: 0.5, transform: "scale(0.5)" };
        return { opacity: 0, transform: "scale(0)" };
      },
      [selectedGame, leftNeighborIndex, rightNeighborIndex]
    );


  return (
    <>
      <Head>
        <title>Shiba</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100vh", justifyContent: "center" }}>
        <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
          <div ref={viewportRef} style={{ overflow: "hidden", width: "90vw", maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {games.map((game, idx) => (
                <div key={game.name} style={{ flex: "0 0 33.3333%", display: "flex", justifyContent: "center", alignItems: "center", padding: "2vw" }}>
                  <GameCard game={game} style={getCardStyle(idx)} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <p style={{fontSize: 24}}>{games[selectedGame]?.name}</p>
          <p style={{fontSize: 12}}>{games[selectedGame]?.description}</p>
        </div>
        </div>
      </main>
      {soundsToPlay.map(({ id, fileName }) => (
        <audio
          key={id}
          autoPlay
          src={`/${fileName}`}
          onEnded={() => handleAudioDone(id)}
          onError={() => handleAudioDone(id)}
          style={{ display: "none" }}
        />
      ))}
    </>
  );
}


