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

export default function App({ Component, pageProps }: AppProps) {
    const [isLauncher, setIsLauncher] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // This is a workaround to ensure that the page is fully loaded before applying styles
        document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        window.addEventListener('resize', () => {
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        });

        window.location.pathname.startsWith('/launcher') ? setIsLauncher(true) : setIsLauncher(false);
        // Checking for query "from" to be "launcher" too
        if (window.location.search.includes('from=launcher')) {
            setIsLauncher(true);
        }
    }, []);

    return isLauncher ? (
        user ? (
            <>
                <nav className="titlebar" style={{ display: "flex", padding: "0rem 1rem 0rem 1rem", borderBottom: "1px solid #ddd", justifyContent: "start", position: "fixed", width: "100%" }}>
                    <img src="/launcher/icon.png" alt="Icon" style={{ width: "24px", height: "24px" }} />
                    <span className="navbar-title" style={{ position: "relative", top: "2px", right: "10px" }}>Croissant Launcher</span>
                </nav>
                <LauncherNavbar />
                <main style={{ position: "fixed", left: 0, right: 0, top: "7rem", bottom: 0, overflowX: "hidden", overflowY: "auto" }}>
                    <Component {...pageProps} />
                </main>
                <LauncherLobby />
            </>
        ) : (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    background: "#18181b",
                    userSelect: "none",
                }}
            >
                <div
                    style={{
                        background: "#23232a",
                        padding: "40px 32px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: "320px",
                    }}
                >
                    <h1 style={{ color: "#fff", marginBottom: "32px" }}>Login required</h1>
                    <button
                        style={{
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
                        }}
                        onClick={() => {
                            // Redirects to the website login page
                            window?.electron?.window?.openEmailLogin?.();
                        }}
                    >
                        Log in on the website
                    </button>
                </div>
            </div>
        )
    ) : (
        <div>
            <MetaLinks />
            <Navbar />
            <main>
                <Component {...pageProps} />
            </main>
            <Footer />
        </div>
    )
}