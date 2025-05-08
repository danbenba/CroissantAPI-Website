
import React, { Component } from "react";
import { Link } from 'react-router-dom';

export default class extends Component {
    render(): React.ReactNode {
        return (
            <header>
                <Link to="/" style={{ color: "white", textDecoration:"none"}}><h1>Croissant API</h1></Link>
                <h4 style={{color: "gray"}}>Creative and Reusable Opensource Inventory System, Scalable, APIful, and Network Technology</h4>
                <nav>
                    <div className="links-group">
                        <Link to="/api-docs">API Documentation</Link>
                        <Link to="/download-launcher">Launcher</Link>
                        <Link to="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923">Bot</Link>
                    </div>
                </nav>
            </header>
        );
    }
}