
import React, { Component } from "react";
import { Link } from 'react-router-dom';

export default class extends Component {
    render(): React.ReactNode {
        return (
            <header>
                <h1>Croissant Inventory System</h1>
                <nav>
                    <div className="links-group">
                        <Link to="/">Home</Link>
                        {/* <Link to="/auth">Auth</Link> */}
                        <Link to="/contact">Contact Us</Link>
                        <Link to="/about">About Us</Link>
                        <Link to="/getting-started">Getting Started</Link>
                        <Link to="/api-docs">API Documentation</Link>
                        <Link to="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923">Discord Bot</Link>
                    </div>
                </nav>
            </header>
        );
    }
}