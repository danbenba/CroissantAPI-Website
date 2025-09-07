import "../styles/main.css";
// import "../styles/phone.css";
import "../styles/atom-one-dark.min.css";
import "../styles/rarity.css";
import '../styles/globals.css';

import type { AppProps } from "next/app";
import MetaLinks from "../components/common/MetaLinks";
import Footer from "../components/common/Footer";
import ImagePreloader from "../components/utils/ImagePreloader";

import { useEffect, useState } from "react";
import LauncherNavbar from "./launcher/components/Navbar";
import LauncherLobby from "./launcher/components/Lobby";
import useAuth from "../hooks/useAuth";
import { AuthProvider } from "../hooks/AuthContext";
import { UserCacheProvider } from "../hooks/UserCacheContext";
import { ImageCacheProvider } from "../hooks/ImageCacheContext";
import useIsMobile from "../hooks/useIsMobile";
import NavBarDesktop from "../components/common/NavBarDesktop";
import NavBarMobile from "../components/common/NavBarMobile";
import Login from "./login";
import { LobbyProvider } from "../hooks/LobbyContext";
import { appWithTranslation } from 'next-i18next';
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

function AppContent({ Component, pageProps }: AppProps) {
  const [isLauncher, setIsLauncher] = useState(false);
  const { user } = useAuth();
  const [mainStyle, setMainStyle] = useState<string>('');

  // Set main style based on whether it's a launcher or not
  useEffect(() => {
    setMainStyle(
      window.location.href.includes("/oauth2/auth")
        ? "flex justify-center items-center p-0 m-auto h-[calc(100vh-30px)] top-0 left-0 right-0 bottom-0 fixed"
        : ""
    );
  }, []);

  // Determine launcher mode synchronously to avoid hydration errors
  const isLauncherPath =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/launcher");
  const isFromLauncher =
    typeof document !== "undefined" && document.cookie.includes("from=app");
  useEffect(() => {
    // Set app height for CSS variable
    const setAppHeight = () => {
      document.documentElement.style.setProperty(
        "--app-height",
        `${window.innerHeight}px`
      );
    };
    setAppHeight();
    window.addEventListener("resize", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
    };
  }, []);

  useEffect(() => {
    setIsLauncher(isLauncherPath || isFromLauncher);
  }, [isLauncherPath, isFromLauncher]);

  // --- Background image component ---
  const BackgroundImage = () => (
    <div 
      className="fixed -z-10 top-0 left-0 w-screen h-screen pointer-events-none overflow-hidden object-cover bg-gradient-custom"
      aria-hidden="true"
    >
      <img
        src="/assets/backgrounds/raiden-crow.webp"
        alt="background"
        className="absolute top-0 left-0 w-screen h-screen object-cover opacity-30 blur-[0.5px] transition-opacity duration-800 max-w-full"
      />
    </div>
  );

  // --- Layouts ---
  const LauncherLayout = () => (
    <>
      <BackgroundImage />
      <MetaLinks metaLinksTitle={"Croissant Launcher"} />

      {/* Précharger des images importantes */}
      <ImagePreloader
        images={["/assets/backgrounds/raiden-crow.webp"]}
        priority={true}
      />
      <nav className="flex px-4 py-0 border-b border-[#ddd] justify-start fixed w-full bg-[#222]">
        <img
          src="/assets/icons/favicon-32x32.avif"
          alt="Icon"
          className="w-6 h-6"
        />
        <span className="relative top-0.5 -right-2.5">
          Croissant Launcher
        </span>
      </nav>
      <LauncherNavbar />
      <main className="fixed inset-x-0 top-28 bottom-0 overflow-x-hidden overflow-y-auto launcher">
        <Component {...pageProps} />
      </main>
      <LauncherLobby />
    </>
  );

  const LauncherLogin = () => (
    <>
      <MetaLinks metaLinksTitle={pageProps?.title} from="app" />
      <Login />
    </>
  );

  const WebsiteLayout = () => {
    const isMobile = useIsMobile();

    return (
      <div>
        <BackgroundImage />
        <MetaLinks metaLinksTitle={pageProps?.title} />
        {(!pageProps?.isOauth2Auth && !pageProps?.isLauncher) && (
          isMobile ? <NavBarMobile /> : <NavBarDesktop />
        )}
        <main className={`${mainStyle} ${isMobile ? 'p-0' : ''}`}>
          <Component {...pageProps} />
        </main>
        {(!pageProps?.isOauth2Auth && !pageProps?.isLauncher) && <Footer />}
      </div>
    );
  };

  if (isLauncher) {
    return user ? <LauncherLayout /> : <LauncherLogin />;
  }
  return <WebsiteLayout />;
}

export function App(props: AppProps) {
  return (
    <ImageCacheProvider>
      <UserCacheProvider>
        <AuthProvider>
          <LobbyProvider>
            <AppContent {...props} />
          </LobbyProvider>
        </AuthProvider>
      </UserCacheProvider>
    </ImageCacheProvider>
  );
}

export default appWithTranslation(App);
