import Head from "next/head";

export default function AppHead({ title = "Shiba" }) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
      {/* Preload commonly used audio to reduce first-play latency */}
      <link rel="preload" as="audio" href="/next.mp3" />
      <link rel="preload" as="audio" href="/prev.mp3" />
      <link rel="preload" as="audio" href="/shiba-bark.mp3" />
      <link rel="preload" as="audio" href="/MyGames.mp3" />
      <link rel="preload" as="audio" href="/Global.mp3" />
      <link rel="preload" as="audio" href="/Shop.mp3" />
      <link rel="preload" as="audio" href="/Help.mp3" />
      <link rel="preload" as="audio" href="/WelcomeToShibaArcade.mp3" />
    </Head>
  );
}


