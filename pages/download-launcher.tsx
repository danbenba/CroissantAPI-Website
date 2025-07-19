import React, { Component } from "react";

export default class extends Component {
    render() {
        return (
            <>
                <div className="container" style={{ padding: "20px", backgroundColor: "#3c3c3c", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)" }}>
                    <h1 id="about-us"><span className="method put">Download the Launcher</span></h1>
                    <p>
                        To download the Croissant launcher:
                    </p>
                    <ol>
                        <li>Go to the <a href="https://github.com/croissant-API/croissant-launcher/releases/">releases page</a> on the Croissant API GitHub repository.</li>
                        <li>Find the latest release.</li>
                        <li>Download the appropriate executable file for your operating system (e.g., <code>.exe</code> for Windows).</li>
                        <li>Run the executable to install the launcher.</li>
                    </ol>
                    <p>
                        The Croissant launcher is important because it allows you to easily access and manage your Croissant account and items, discover and launch games, and automatically stay updated with the latest platform features.
                    </p>
                    <img src="/assets/launcher.png" alt="Croissant Launcher Screenshot" style={{maxWidth: '100%', height: 'auto'}}/>
                </div>
            </>
        );
    }
}
