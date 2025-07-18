import React, { Component } from "react";

export default class extends Component {
    componentDidMount() {
        // document.title = "Terms of Service | Croissant";
    }
    render(): React.ReactNode {
        return (
            <div className="container">
                <h2>Croissant - Terms of Service</h2>
                <div className="content">
                    <p>Welcome to Croissant! These Terms of Service govern your use of our inventory system, including our Discord bot, API, and web interface.</p>
    
                    <b>1. Service Usage</b>
                    <p className="indent">1.1. Our services are provided free of charge and are intended for managing virtual items in games.</p>
                    <p className="indent">1.2. You must use our services in accordance with Discord's Terms of Service when using our bot.</p>
    
                    <b>2. Item Creation and Ownership</b>
                    <p className="indent">2.1. Users can create and customize their own items using launcher.</p>
                    <p className="indent">2.2. Item creators receive 75% of the sale price when their items are sold.</p>
                    <p className="indent">2.3. We reserve the right to remove inappropriate or offensive items.</p>
    
                    <b>3. Trading and Transactions</b>
                    <p className="indent">3.1. All trades must be confirmed by both parties to be completed.</p>
                    <p className="indent">3.2. Users are responsible for verifying trade details before confirmation.</p>
                    <p className="indent">3.3. Virtual items and credits have no real-world monetary value. Credits can be converted into real life money by contacting us to make a cooperation operation.</p>
    
                    <b>4. API Usage</b>
                    <p className="indent">4.1. API keys must be obtained through the /api-key command.</p>
                    <p className="indent">4.2. Developers must ensure secure handling of API keys.</p>
                    <p className="indent">4.3. We reserve the right to revoke API access for misuse.</p>
    
                    <b>5. Prohibited Activities</b>
                    <p className="indent">5.1. Exploiting bugs or vulnerabilities in our systems.</p>
                    <p className="indent">5.2. Creating automated bots to interact with our services.</p>
                    <p className="indent">5.3. Selling or trading items for real-world currency.</p>
    
                    <b>6. Service Modifications</b>
                    <p className="indent">6.1. We may modify or discontinue services at any time.</p>
                    <p className="indent">6.2. Major changes will be announced through our Discord bot.</p>
                </div>
            </div>
        );   
    }
}
