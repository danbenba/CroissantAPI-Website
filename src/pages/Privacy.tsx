import React, { Component } from "react";

export default class extends Component {
    componentDidMount() {
        document.title = "Privacy | Croissant";
    }
    render(): React.ReactNode {
        return (
            <div className="container">
                <h2>Croissant - Privacy Policy</h2>
                <div className="content">
                    <p>Welcome to Croissant! This Privacy Policy outlines how we handle your information when you use our inventory system services, including our Discord bot, API, and web interface.</p>
                    
                    <b>1. Information We Collect</b>
                    <p className="indent">1.1. Discord Information: When you use our Discord bot, we collect your Discord user ID and username for account identification and service functionality.</p>
                    <p className="indent">1.2. API Usage: For developers using our API, we collect API key usage data and related transaction information.</p>
                    <p className="indent">1.3. Inventory Data: We store information about your virtual items, credits, and trading history.</p>
    
                    <b>2. How We Use Your Information</b>
                    <p className="indent">2.1. Service Operation: We use collected data to manage your inventory, process trades, and maintain item ownership records.</p>
                    <p className="indent">2.2. API Access: Developer API keys are used to authenticate requests and ensure secure access to our services.</p>
                    <p className="indent">2.3. Analytics: We analyze usage patterns to improve our services and prevent abuse.</p>
    
                    <b>3. Data Sharing</b>
                    <p className="indent">3.1. Public Information: Item ownership and trading history may be visible to other users through our leaderboard system.</p>
                    <p className="indent">3.2. API Integration: When you use games integrated with our API, necessary inventory data is shared with those games.</p>
    
                    <b>4. Data Security</b>
                    <p className="indent">4.1. We implement security measures to protect your information, including secure API key generation and storage.</p>
                    <p className="indent">4.2. API keys are not stored in our database to ensure maximum security.</p>
    
                    <b>5. User Rights</b>
                    <p className="indent">5.1. You can view your data using the /inventory command.</p>
                    <p className="indent">5.2. You can delete items you own using the /delete-item command.</p>
    
                    <b>6. Changes to This Policy</b>
                    <p className="indent">6.1. We may update this policy as our services evolve. Significant changes will be announced through our Discord bot.</p>
                </div>
            </div>
        );   
    }
}
