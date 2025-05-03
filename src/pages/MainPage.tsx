import ListSection from "../components/ListSection";
import Section from "../components/Section";
import React, { Component } from "react";

export default class extends Component {
    componentDidMount() {
        document.title = "Home | Croissant";
    }
    render(): React.ReactNode {
        return (
            <div className="container">
                <h1 id="users-guide">
                    <span className="method post">USERS GUIDE</span>
                </h1>
                <div className="indent">
                    <h2>Welcome to the Croissant Inventory System!</h2>
                    <div className="indent">
                        <p>Welcome to the ultimate platform for managing your in-game items with precision and ease!</p>
                        <p>Whether you're a casual gamer or a developer, our platform is designed to cater to your needs—completely free!</p>
                        <p>Powered by the robust Croissant API, our intuitive interface enhances your gaming experience by simplifying item management.</p>
                        <p>Experience a dynamic marketplace environment where you can trade, buy, and sell items seamlessly with other users.</p>
                        <p>Our platform is designed to be easy to use, and we have a comprehensive guide to help you get started: it's a Discord bot!</p>
                        <p>The main advantage of using this market place is that you can trade items with other users, and you can make money from your creations (see <a href="#creators-guide">CREATORS GUIDE</a>).</p>
                    </div>
                    <Section title="Getting Started:">
                        <p>
                            You can start using the bot by clicking on the{" "}
                            <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923">Discord Bot</a> link
                        </p>
                        <p>
                            The API isn't made for users, it's made for developers, so if you want to use the API, you can find more information{" "}
                            <a href="/api-docs">here</a>, and for creators, you can find more information <a href="#creators-guide">here</a>.
                        </p>
                        <div className="indent">
                            <p>Begin your journey with essential commands:</p>
                            <ul>
                                <li><strong>/help</strong> - View all available commands</li>
                                <li><strong>/tutorial</strong> - Access this comprehensive guide with the Discord bot</li>
                                <li><strong>/support</strong> - Get help and join our support server</li>
                            </ul>
                        </div>
                    </Section>
                    <ListSection
                        title="Account & Balance:"
                        description="Manage your account and credits effortlessly:"
                        items={[
                            "Your account is automatically created with 5000 credits upon first use.",
                            <>Use <strong>/inventory</strong> to view your balance and items.</>,
                            <>Transfer credits to others with <strong>/give-credits</strong>.</>,
                        ]}
                    />
                    <ListSection
                        title="Shop & Items:"
                        description="Explore and purchase items with ease:"
                        items={[
                            <><strong>/shop</strong> - Browse available items and bundles.</>,
                            <><strong>/info item:&lt;name&gt;</strong> - Get detailed information about an item.</>,
                            <><strong>/buy item:&lt;name&gt; amount:&lt;number&gt;</strong> - Purchase items from the shop.</>,
                        ]}
                    />
                    <ListSection
                        title="Inventory Management:"
                        description="Keep your inventory organized:"
                        items={[
                            <><strong>/inventory</strong> - View your items and balance.</>,
                            <><strong>/drop item:&lt;name&gt; amount:&lt;number&gt;</strong> - Remove items from your inventory.</>,
                        ]}
                    />
                    <ListSection
                        title="Item Creation & Customization:"
                        description="Create and personalize your items:"
                        items={[
                            <><strong>/create-item name:&lt;name&gt;</strong> - Create a new item.</>,
                            <><strong>/modify-item item:&lt;name&gt;</strong> - Edit your owned items.</>,
                            <><strong>/delete-item item:&lt;name&gt;</strong> - Delete an item you own.</>,
                            <><strong>/change-image item:&lt;name&gt;</strong> - Customize your item's image.</>,
                        ]}
                    />
                    <ListSection
                        title="Trading and Giving Items:"
                        description="Trade and share items with others:"
                        items={[
                            <><strong>/exchange user:&lt;@user&gt;</strong> - Initiate a trade with another user.</>,
                            <><strong>/give-item user:&lt;@user&gt; item:&lt;name&gt;</strong> - Give items to other users.</>,
                        ]}
                    />
                    <ListSection
                        title="Leaderboard:"
                        description="See how you rank among other users:"
                        items={[
                            <><strong>/leaderboard</strong> - View top users by wealth.</>,
                        ]}
                    />
                    <Section title="Safety & Support:">
                        <p>Stay safe and get help when needed</p>
                        <p><b>Keep in mind to:</b></p>
                        <ul>
                            <li>Never share your account information.</li>
                            <li>Never share your API key.</li>
                            <li>Double-check all trade details before confirming.</li>
                            <li>Join our support server with <strong>/support</strong> if you need help.</li>
                        </ul>
                    </Section>
                </div>
                <h1 id="creators-guide">
                    <span className="method delete">CREATORS GUIDE</span>
                </h1>
                <div className="indent">
                    <h2>Welcome to the Croissant Marketplace SDK Creator Guide!</h2>
                    <p>As a creator, you can make your game compatible with the Croissant Marketplace SDK using the following API features or libraries.</p>
                    <p>The Croissant Marketplace SDK is a set of API features and libraries that allow you to make your game compatible with the Croissant Marketplace. It's completely free, and it offers you the potential to monetize your creations effectively.</p>
                    <p>Here is a list of the features you can use:</p>
                    <ul>
                        <li><b>Retrieve all items available in the marketplace</b>: you can list all available items in the marketplace.</li>
                        <li><b>Check if a user possesses a specific item</b>: you can check if a user possesses a specific item of yours for example.</li>
                        <li><b>Get the inventory details of a user</b>: you can get the inventory details of a user, and make your own inventory viewer, or check if a user possesses a specific item of yours.</li>
                        <li><b>Allow users to purchase items from the marketplace</b>: you can allow users to purchase items from the marketplace, potentially making money from your creations.</li>
                        <li><b>Give items to users as a seller</b>: you can give items to users as a seller without the user having to use the /buy command. This is useful for giveaways, or for selling items to users with your own pricing and payment system, opening up new revenue streams.</li>
                        <li><b>Consume an item from a user's inventory</b>: you can consume an item from a user's inventory. This is useful for games where users can consume items to gain a buff or effect, and remove them from their inventory.</li>
                        <li><b>Open a bundle for a user and retrieve the items inside</b>: you can open a bundle your created with <strong>/create-bundle</strong><i>(SOON!)</i> with your items for a user and retrieve the items inside. This is useful for games where users can open bundles to gain items.</li>
                    </ul>
                    <p>An API key is required to use the API. You can get one via the <strong>/api-key</strong> command. This ensures that only your game can use the API for your items and not the others creators.</p>
                    <p>The API key system is not stocked in database, so it's ensure security. You can find more information about the API <a href="/api-docs">here</a>.</p>
                    <p>Utilize these endpoints to enhance your game's interaction with the Croissant Marketplace and provide a seamless experience for your users. Remember, all these features are completely free, and they offer you the potential to monetize your creations effectively.</p>
                </div>
            </div>
        );
    }
}
