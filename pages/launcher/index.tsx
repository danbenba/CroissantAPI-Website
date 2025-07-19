import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";
import { useRouter } from "next/router";

const endpoint = "/api";

export async function fetchMe(token: string, callback: () => void) {
  await fetch(endpoint + "/users/@me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      // window.location.reload();
    }
    return res.json();
  }).then((data) => {
    localStorage.setItem("verificationKey", data.verificationKey);
    window.me = data;
    callback();
  });
}

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
    const router = useRouter();
    router.push("/launcher/home");

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
  return (<></>)
};

export default LauncherPage;
