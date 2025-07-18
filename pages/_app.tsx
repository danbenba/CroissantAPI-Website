import '../styles/main.css';
import '../styles/atom-one-dark.min.css';
import type { AppProps } from 'next/app';
import MetaLinks from '../components/MetaLinks';
import Navbar from '../portions/NavBar';
import Footer from '../portions/Footer';

export default function App({ Component, pageProps }: AppProps) {
    return (
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