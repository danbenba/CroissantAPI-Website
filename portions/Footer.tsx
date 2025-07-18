import React, { useEffect, useState } from "react";

export default function Footer() {
    const [show, setShow] = useState("");

    useEffect(() => {
        if (window.location.href.startsWith(window.location.origin + "/oauth2/auth")) {
            setShow("none");
        } else {
            setShow("");
        }
    }, []);

    return (
        <footer style={{ display: show }}>
            <p>Copyright © 2025 Croissant Inventory System</p>
            <div style={{ display: 'flex', gap: '1rem', textAlign: 'center', verticalAlign: 'middle', justifyContent: 'center' }}>
                <a href="/tos">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>
            </div>
        </footer>
    );
}