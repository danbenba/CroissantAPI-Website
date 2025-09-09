import React from "react";


export default function ({metaLinksTitle, from}: {metaLinksTitle?: string, from?: string}) {
    const isLauncher = from === "app";
    if(isLauncher) {
      document.cookie = "from=app; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    }
    const title = metaLinksTitle || "Croissant Inventory System";
    return (
        <>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta charSet="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content={`${title} - Manage your inventory with ease.`} />
            <meta name="keywords" content="Croissant, Inventory, System, API, Opensource, Scalable, Network Technology" />
            <meta name="author" content="Fox3000foxy" />
            <meta name="theme-color" content="#222222" />

            {/* Open Graph / Facebook */}
            <meta property="og:title" content="Croissant Inventory System" />
            <meta property="og:description" content="Croissant Inventory System - Manage your inventory with ease." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://croissant-api.fr/" />
            <meta property="og:image" content="/assets/icons/favicon.ico" />
            <meta property="og:site_name" content="Croissant Inventory System" />

            {/* Twitter */}
            {/* <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="Croissant Inventory System" />
            <meta name="twitter:description" content="Croissant Inventory System - Manage your inventory with ease." />
            <meta name="twitter:image" content="/assets/icons/favicon.ico" /> */}

            {/* Icons */}
            <link rel="icon" type="image/png" sizes="16x16" href="/assets/icons/favicon-16x16.avif" />
            <link rel="icon" type="image/png" sizes="32x32" href="/assets/icons/favicon-32x32.avif" />
            <link rel="icon" type="image/png" sizes="96x96" href="/assets/icons/favicon-96x96.avif" />
            <link rel="icon" type="image/png" sizes="192x192" href="/assets/icons/android-icon-192x192.avif" />
            <link rel="apple-touch-icon" sizes="57x57" href="/assets/icons/apple-icon-57x57.avif" />
            <link rel="apple-touch-icon" sizes="60x60" href="/assets/icons/apple-icon-60x60.avif" />
            <link rel="apple-touch-icon" sizes="72x72" href="/assets/icons/apple-icon-72x72.avif" />
            <link rel="apple-touch-icon" sizes="76x76" href="/assets/icons/apple-icon-76x76.avif" />
            <link rel="apple-touch-icon" sizes="114x114" href="/assets/icons/apple-icon-114x114.avif" />
            <link rel="apple-touch-icon" sizes="120x120" href="/assets/icons/apple-icon-120x120.avif" />
            <link rel="apple-touch-icon" sizes="144x144" href="/assets/icons/apple-icon-144x144.avif" />
            <link rel="apple-touch-icon" sizes="152x152" href="/assets/icons/apple-icon-152x152.avif" />
            <link rel="apple-touch-icon" sizes="180x180" href="/assets/icons/apple-icon-180x180.avif" />

            {/* Manifest & Misc */}
            <link rel="manifest" href="/manifest.json" />
            <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
            {/* Use correct MIME type for robots.txt for Firefox compatibility */}
            <link rel="robots" type="text/plain" href="/robots.txt" />
            <meta name="msapplication-TileColor" content="#ffffff" />
            <meta name="msapplication-TileImage" content="/icons/ms-icon-144x144.avif" />
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
            />
        </>
    );
}