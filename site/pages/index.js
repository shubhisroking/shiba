import { useState, useEffect } from "react";
import HomeScreen from "@/components/HomeScreen";
import StartScreen from "@/components/StartScreen";
import MyGamesComponent from "@/components/MyGamesComponent";
import GlobalGamesComponent from "@/components/GlobalGamesComponent";
import ShopComponent from "@/components/ShopComponent";
import HelpComponent from "@/components/HelpComponent";

export default function Home() {
  const [token, setToken] = useState(null);

  const [appOpen, setAppOpen] = useState("Home");
  const [selectedGame, setSelectedGame] = useState(0);


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const requestOtp = async (email) => {
    try {
      const res = await fetch("/api/newLogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      return { ok: res.ok, ...data };
    } catch (e) {
      return { ok: false, message: "Network error" };
    }
  };

  const verifyOtp = async (email, otp) => {
    try {
      const res = await fetch("/api/tryOTP", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.token) {
        localStorage.setItem("token", data.token);
      }
      return { ok: res.ok, ...data };
    } catch (e) {
      return { ok: false, message: "Network error" };
    }
  };

  if (token === null) {
    return <StartScreen setToken={setToken} requestOtp={requestOtp} verifyOtp={verifyOtp} />;
  }

  if (token !== null) {
    if (appOpen === "Home") {
      return (
        <HomeScreen
          appOpen={appOpen}
          setAppOpen={setAppOpen}
          selectedGame={selectedGame}
          setSelectedGame={setSelectedGame}
        />
      );
    }

    const components = {
      "My Games": <MyGamesComponent />,
      "Global Games": <GlobalGamesComponent />,
      "Shop": <ShopComponent />,
      "Help": <HelpComponent />,
    };

    const SelectedComponent = components[appOpen];
    if (SelectedComponent) {
      return (
        <div>
          <button onClick={() => setAppOpen("Home")}>home</button>
          {SelectedComponent}
        </div>
      );
    }
  }
}