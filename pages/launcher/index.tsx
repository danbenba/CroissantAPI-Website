import React, { useEffect, useState } from "react";
import Logged from "./components/Logged";
import Unlogged from "./components/Unlogged";
import fetchMe from "./components/utils/fetchMe";
import useAuth from "../../hooks/useAuth";

declare global {
  interface Window {
    electron?: {
      window?: {
        minimize?: () => void;
        maximize?: () => void;
        close?: () => void;
        onSetToken?: (token: string) => void;
        openDiscordLogin?: () => void;
        openGoogleLogin?: () => void;
        openEmailLogin?: () => void;
      };
    };
    me: {
      userId: string;
      balance: number;
      verificationKey: string;
      username: string;
    };
  }
}

const LauncherPage: React.FC = () => {
  const [isLogged, setIsLogged] = useState<boolean | null>(null);

  const {token} = useAuth();

  useEffect(() => {
    console.log("Croissant Launcher v0.1.0");
    console.log("Croissant Launcher is running in " + process.env.NODE_ENV + " mode.");

    if (typeof window !== "undefined") {
      if (token === null) {
        setIsLogged(false);
      } else {
        fetchMe(token, () => {
          setIsLogged(true);
        });
      }
    }
  }, []);

  if (isLogged === null) return null; // or a loading spinner

  return isLogged ? (<>alala</>) : <Unlogged />;
};

export default LauncherPage;
