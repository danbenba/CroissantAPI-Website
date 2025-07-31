import React from "react";
import CachedImage from "../components/utils/CachedImage";
import useIsMobile from "../hooks/useIsMobile";

function DownloadLauncherDesktop() {
  return (
    <div
      className="container"
      style={{
        padding: "20px",
        backgroundColor: "#3c3c3cee",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        maxWidth: 700,
        margin: "0 auto",
      }}
    >
      <h1 id="about-us">
        <span className="method put">Download the Launcher</span>
      </h1>
      <p>To download the Croissant launcher:</p>
      <ol>
        <li>
          Go to the{" "}
          <a
            href="https://github.com/croissant-API/Launcher/releases/"
            target="_blank"
            rel="noopener noreferrer"
          >
            releases page
          </a>{" "}
          on the Croissant API GitHub repository.
        </li>
        <li>Find the latest release.</li>
        <li>
          Download the appropriate executable file for your operating system
          (e.g., <code>.exe</code> for Windows).
        </li>
        <li>Run the executable to install the launcher.</li>
      </ol>
      <p>
        The Croissant launcher is important because it allows you to easily
        access and manage your Croissant account and items, discover and
        launch games, and automatically stay updated with the latest
        platform features.
      </p>
      <CachedImage
        src="/assets/launcher.png"
        alt="Croissant Launcher Screenshot"
        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
      />
    </div>
  );
}

function DownloadLauncherMobile() {
  return (
    <div
      className="container"
      style={{
        padding: "10px",
        backgroundColor: "#3c3c3cee",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
        maxWidth: 420,
        margin: "0 auto",
        fontSize: "0.98em",
      }}
    >
      <h2 id="about-us" style={{ fontSize: "1.1em" }}>
        <span className="method put">Download the Launcher</span>
      </h2>
      <p>
        <b>Note:</b> The Croissant launcher is only available for PC (Windows).
      </p>
      <p>To download the Croissant launcher:</p>
      <ol>
        <li>
          Go to the{" "}
          <a
            href="https://github.com/croissant-API/Launcher/releases/"
            target="_blank"
            rel="noopener noreferrer"
          >
            releases page
          </a>{" "}
          on the Croissant API GitHub repository.
        </li>
        <li>Find the latest release.</li>
        <li>
          Download the <code>.exe</code> file for Windows.
        </li>
        <li>Run the executable to install the launcher.</li>
      </ol>
      <p>
        The Croissant launcher lets you manage your Croissant account and items,
        discover and launch games, and always stay updated with the latest
        features.
      </p>
      <CachedImage
        src="/assets/launcher.png"
        alt="Croissant Launcher Screenshot"
        style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
      />
    </div>
  );
}

export default function DownloadLauncher() {
  const isMobile = useIsMobile();
  return isMobile ? <DownloadLauncherMobile /> : <DownloadLauncherDesktop />;
}
