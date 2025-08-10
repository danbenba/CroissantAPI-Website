import React from "react";
import Link from "next/link";
import useIsMobile from "../hooks/useIsMobile";

function NotFoundDesktop() {
  return (
    <main>
      <div className="container" style={{ maxWidth: 600, margin: "48px auto", padding: 32 }}>
        <h2 style={{ fontSize: "2.2em", marginBottom: 12 }}>Oops! The page you are looking for does not exist.</h2>
        <div className="indent" style={{ marginBottom: 18 }}>
          <p>
            It seems that the page you were trying to reach is either
            unavailable or does not exist.
          </p>
          <p>
            Please check the URL for any mistakes or return to the homepage to
            continue exploring our services.
          </p>
        </div>
        <h3 style={{ marginBottom: 8 }}>What can you do?</h3>
        <div className="indent">
          <p>Try the following options:</p>
          <ul>
            <li>
              <Link href="/" legacyBehavior>
                <a>Return to Home</a>
              </Link>
            </li>
            <li>
              <Link href="/contact" legacyBehavior>
                <a>Contact Support</a>
              </Link>
            </li>
            <li>
              <Link href="/api-docs" legacyBehavior>
                <a>View API Documentation</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function NotFoundMobile() {
  return (
    <main>
      <div
        className="container"
        style={{
          maxWidth: 340,
          margin: "32px auto",
          padding: "18px 8px",
          borderRadius: 12,
          background: "#23272e",
          color: "#fff",
          boxShadow: "0 2px 12px #0002",
          fontSize: "1em",
        }}
      >
        <h2 style={{ fontSize: "1.2em", marginBottom: 10, textAlign: "center" }}>
          Oops! Page not found.
        </h2>
        <div className="indent" style={{ marginBottom: 12 }}>
          <p style={{ marginBottom: 6 }}>
            The page you tried to reach does not exist or is unavailable.
          </p>
          <p style={{ marginBottom: 0 }}>
            Please check the URL or use one of the options below.
          </p>
        </div>
        <div className="indent" style={{ marginTop: 10 }}>
          <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
            <li style={{ marginBottom: 6 }}>
              <Link href="/" legacyBehavior>
                <a style={{ color: "#fff", textDecoration: "underline" }}>Return to Home</a>
              </Link>
            </li>
            <li style={{ marginBottom: 6 }}>
              <Link href="/contact" legacyBehavior>
                <a style={{ color: "#fff", textDecoration: "underline" }}>Contact Support</a>
              </Link>
            </li>
            <li>
              <Link href="/api-docs" legacyBehavior>
                <a style={{ color: "#fff", textDecoration: "underline" }}>API Documentation</a>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

export default function NotFoundPage() {
  const isMobile = useIsMobile();
  return isMobile ? <NotFoundMobile /> : <NotFoundDesktop />;
}
