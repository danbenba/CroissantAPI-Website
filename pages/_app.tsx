import '../styles/launcher.css';
import '../styles/main.css';
import '../styles/atom-one-dark.min.css';
import '../styles/oauth2.css';

import type { AppProps } from 'next/app';
import MetaLinks from '../components/MetaLinks';
import Navbar from '../components/NavBar';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';

import LauncherNavbar from './launcher/components/Navbar';
import LauncherLobby from './launcher/components/Lobby';
import useAuth from '../hooks/useAuth';
import { AuthProvider } from '../hooks/AuthContext';

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
        callback();
    });
}


// --- Style constants ---
const launcherTitlebarStyle: React.CSSProperties = {
    display: "flex",
    padding: "0rem 1rem 0rem 1rem",
    borderBottom: "1px solid #ddd",
    justifyContent: "start",
    position: "fixed",
    width: "100%",
};
const launcherIconStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
};
const launcherTitleStyle: React.CSSProperties = {
    position: "relative",
    top: "2px",
    right: "10px",
};
const launcherMainStyle: React.CSSProperties = {
    position: "fixed",
    left: 0,
    right: 0,
    top: "7rem",
    bottom: 0,
    overflowX: "hidden",
    overflowY: "auto",
};
const loginContainerStyle: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#18181b",
    userSelect: "none",
};
const loginBoxStyle: React.CSSProperties = {
    background: "#23232a",
    padding: "40px 32px",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "320px",
};
const loginTitleStyle: React.CSSProperties = {
    color: "#fff",
    marginBottom: "32px",
};
const loginButtonStyle: React.CSSProperties = {
    width: "220px",
    height: "48px",
    background: "#ffb300",
    color: "#222",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: 600,
    cursor: "pointer",
    marginTop: "12px",
};

function AppContent({ Component, pageProps }: AppProps) {
    const [isLauncher, setIsLauncher] = useState(false);
    const { user, token } = useAuth();
    const [mainStyle, setMainStyle] = useState<React.CSSProperties>({});

    // Set main style based on whether it's a launcher or not
    useEffect(() => {
        setMainStyle(window.location.href.includes("/oauth2/auth") ? {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0",
            margin: "15px",
            width: "calc(100vw - 30px)",
            height: "calc(100vh - 30px)",
            top: "0",
            left: "0",
            position: "fixed",
        } : {});
    }, []);

    // Only call fetchMe if token is present
    useEffect(() => {
        if (token) fetchMe(token, () => { });
    }, [token]);

    // Handle launcher mode and app height
    useEffect(() => {
        const setAppHeight = () => {
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        };
        setAppHeight();
        window.addEventListener('resize', setAppHeight);

        // Detect launcher mode
        const isLauncherPath = window.location.pathname.startsWith('/launcher');
        const isFromLauncher = window.location.search.includes('from=launcher');
        setIsLauncher(isLauncherPath || isFromLauncher);

        return () => {
            window.removeEventListener('resize', setAppHeight);
        };
    }, []);

    // --- Background image component ---
    const BackgroundImage = () => (
        <div
            style={{
                position: 'fixed',
                zIndex: -1,
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                background: 'linear-gradient(to bottom, rgba(24,24,27,0.85) 0%, rgba(24,24,27,0.7) 60%, rgba(24,24,27,1) 100%)',
                overflow: 'hidden',
                objectFit: 'cover',
            }}
            aria-hidden="true"
        >
            <img
                src="/backgrounds/raiden-crow.webp"
                alt="background"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    objectFit: 'cover',
                    opacity: 0.32,
                    filter: 'blur(0.5px)',
                    transition: 'opacity 0.8s',
                    maxWidth: '100%',
                }}
            />
        </div>
    );

    // --- Layouts ---
    const LauncherLayout = () => (
        <>
            {/* <BackgroundImage /> */}
            <MetaLinks />
            <nav className="titlebar" style={launcherTitlebarStyle}>
                <img src="/launcher/icon.png" alt="Icon" style={launcherIconStyle} />
                <span className="navbar-title" style={launcherTitleStyle}>Croissant Launcher</span>
            </nav>
            <LauncherNavbar />
            <main style={launcherMainStyle} className="launcher">
                <Component {...pageProps} />
            </main>
            <LauncherLobby />
        </>
    );

    const LauncherLogin = () => (
        <>
            {/* <BackgroundImage /> */}
            <MetaLinks />
            <div style={loginContainerStyle}>
                <div style={loginBoxStyle}>
                    <h1 style={loginTitleStyle}>Login required</h1>
                    <button
                        style={loginButtonStyle}
                        onClick={() => {
                            // Redirects to the website login page
                            window?.electron?.window?.openEmailLogin?.();
                        }}
                    >
                        Log in on the website
                    </button>
                </div>
            </div>
        </>
    );

    const WebsiteLayout = () => (
        <div>
            <BackgroundImage />
            <MetaLinks />
            <Navbar />
            <main style={mainStyle}>
                <Component {...pageProps} />
            </main>
            <Footer />
        </div>
    );

    if (isLauncher) {
        return user ? <LauncherLayout /> : <LauncherLogin />;
    }
    return <WebsiteLayout />;
}

export default function App(props: AppProps) {
    return (
        <AuthProvider>
            <AppContent {...props} />
        </AuthProvider>
    );
}