import React, { useEffect, useState } from "react";

const endpoint = "/api";

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
  useEffect(() => {
    console.log("Croissant Launcher v0.1.0");
    console.log("Croissant Launcher is running in " + process.env.NODE_ENV + " mode.");
    location.href = "/launcher/home";

  }, []);
  return (<></>)
};

export default LauncherPage;
