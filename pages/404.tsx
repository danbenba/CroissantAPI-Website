import React, { Component } from "react";
import Link from "next/link";

export default class extends Component {
    render(): React.ReactNode {
        return (
            <main>
            <div className="container">
                <h2>Oops! The page you are looking for does not exist.</h2>
                <div className="indent">
                    <p>It seems that the page you were trying to reach is either unavailable or does not exist.</p>
                    <p>Please check the URL for any mistakes or return to the homepage to continue exploring our services.</p>
                </div>
                <h3>What can you do?</h3>
                <div className="indent">
                    <p>Try the following options:</p>
                    <ul>
                        <li><Link href="/" legacyBehavior><a>Return to Home</a></Link></li>
                        <li><Link href="/contact" legacyBehavior><a>Contact Support</a></Link></li>
                        <li><Link href="/api-docs" legacyBehavior><a>View API Documentation</a></Link></li>
                    </ul>
                </div>
            </div>
        </main>
        );
    }
}