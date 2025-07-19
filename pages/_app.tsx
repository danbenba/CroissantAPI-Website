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
import Unlogged from './launcher/components/Unlogged';

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
            <Unlogged />
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