
import Section from "../components/Section";
import ListSection from "../components/ListSection";
import Head from "next/head";
import React from "react";

const detailsStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    background: "#23272f",
    boxShadow: "0 2px 8px rgba(0,0,0,0.24)",
    padding: "0.5rem 1.2rem 1rem 1.2rem",
    color: "#f3f3f3"
};
const summaryStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: "1.15rem",
    cursor: "pointer",
    outline: "none",
    padding: "0.7rem 0",
    color: "#e2e8f0"
};
const aboutStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: "8px",
    background: "#181a20",
    padding: "1.2rem",
    marginTop: "2rem",
    color: "#f3f3f3"
};

export default function Home() {
    return (
        <div className="container">
            <Head>
                <title>Home | Croissant</title>
            </Head>
            <h1>
                <span className="method post">CROISSANT PLATFORM OVERVIEW</span>
            </h1>
            <div style={aboutStyle} className="indent">
                <details style={detailsStyle} open>
                  <summary style={summaryStyle}>For Players</summary>
                  <ul>
                    <li>Play games connected to Croissant and collect unique items.</li>
                    <li>Trade, buy, or sell your items with other users.</li>
                    <li>Join multiplayer games easily using lobbies.</li>
                    <li>Manage your inventory and credits via Discord or the launcher.</li>
                  </ul>
                </details>

                <details style={detailsStyle}>
                  <summary style={summaryStyle}>For Creators &amp; Game Developers</summary>
                  <ul>
                    <li>Connect your game to Croissant via <a href="/api-docs">SDK or API</a>.</li>
                    <li>Authenticate players and interact with their inventory (add/remove items, rewards, in-game purchases).</li>
                    <li>Create and sell your own items or bundles in the marketplace.</li>
                    <li>Use lobbies to manage private multiplayer sessions.</li>
                    <li><span style={{color: "red"}}>NEW:</span> Use OAuth2 as authentication on your website.</li>
                  </ul>
                  <p>
                    <b>Get started:</b> Generate your API key with <a href="/api-key">/api-key</a> and see the <a href="/api-docs">documentation</a>.
                  </p>
                </details>

                <details style={detailsStyle}>
                  <summary style={summaryStyle}>Marketplace &amp; Inventory</summary>
                  <ListSection
                    title="Marketplace & Inventory"
                    description="Manage your in-game assets:"
                    items={[
                        "Buy, sell, and trade items.",
                        "Browse and purchase new items or bundles.",
                        "Transfer items or credits to friends.",
                        "Track your balance and collection.",
                    ]}
                  />
                </details>

                <details style={detailsStyle}>
                  <summary style={summaryStyle}>Lobby System</summary>
                  <ListSection
                    title="Lobby System"
                    description="Play together and build communities:"
                    items={[
                        "Create or join multiplayer lobbies.",
                        "Invite friends with a lobby link.",
                        "See who's in your lobby and interact in real time.",
                        "Leave or disband lobbies easily.",
                    ]}
                  />
                </details>

                <details style={detailsStyle}>
                  <summary style={summaryStyle}>Safety &amp; Support</summary>
                  <Section title="Safety & Support">
                    <p>
                        <b>Your security is our priority.</b> Never share your account or API key. Always double-check trade details before confirming. For help, use <strong>/support</strong> or join our support server.
                    </p>
                  </Section>
                </details>
                <details style={detailsStyle}>
                    <summary style={summaryStyle}>Test OAuth2 (new!)</summary>
                    <p>
                        You can now try out Croissant's OAuth2 integration on the <a href="/oauth2/test"><b>/oauth2/test</b></a> page.<br/>
                        This system allows you to securely connect your website or application to Croissant, authenticate users, and access their inventories.
                    </p>
                    <ul>
                        <li>Simple and secure authentication via OAuth2.</li>
                        <li>Allows access to a user's Croissant inventory.</li>
                        <li>Easy to integrate for game or website developers.</li>
                    </ul>
                    <p>
                        <b>Try it now:</b> <a href="/oauth2/test">/oauth2/test</a>
                    </p>
                </details>
            </div>
            <h1 id="about-us"><span className="method put">ABOUT ME</span></h1>
            <div style={aboutStyle}>
              <details style={detailsStyle} open>
                <summary style={summaryStyle}>Who am I?</summary>
                <p><b>Hi, my name is Fox</b>, a.k.a <em>fox3000foxy</em> on socials. I'm a <b>French developer</b> passionate about coding and creating innovative solutions. I am the creator of the <b>Croissant Inventory System</b>.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>The Croissant Inventory System</summary>
                <p>The idea of <b>Croissant Inventory System</b> was to be a <em>second-hand items marketplace</em> crafted for gamers and creators. My platform not only allows players to exchange in-game items but also empowers creators to monetize their creations by selling items and cosmetics <b>without any fees</b>. This approach challenges the ultra-expensive marketplaces by providing a fair and accessible platform for all.</p>
                <p>I am committed to <b>giving items a second life</b>, enabling seamless trading, buying, and selling of pre-owned items. This promotes <em>sustainability</em> and fosters a <b>dynamic marketplace environment</b> where gamers can benefit from each other's inventories.</p>
                <p>Importantly, players do not need to be familiar with the bot or even have a Discord account to enjoy the benefits of my system. The <b>Croissant Inventory System</b> is designed to be user-friendly and accessible to all.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>API &amp; Discord Bot</summary>
                <p>I'm actively working on maintaining the <b>API</b> and the <b>Discord bot</b> to ensure they are stable and robust, minimizing the risk of bugs. The Discord bot, which facilitates inventory management and trading, is already available. You can explore it <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923"><b>here</b></a>.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>Marketplace Philosophy</summary>
                <p>Like Vinted, the <b>Croissant Inventory System</b> was thinked to be an user-to-user marketplace. I'm working on it to make it as easy as possible to use for users, but also for creators.</p>
                <p>As both a <b>gamer and developer</b>, I've always dreamed of a marketplace that truly understands the gaming community's needs. That's why I built <em>Croissant</em> to be more than just a trading platform - it's a <b>vibrant ecosystem</b> where gaming items find new life and creators can thrive.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>For Gamers</summary>
                <p>For gamers, I've witnessed firsthand how frustrating it can be to have valuable items sitting unused in your inventory. With <b>Croissant</b>, you can now turn these dormant assets into <em>opportunities</em>. Imagine finding that rare skin you've been hunting for months, or finally completing your collection by trading with someone across the globe. The possibilities are endless, and the best part? It's all happening in a <b>secure, user-friendly environment</b>.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>For Creators</summary>
                <p>To my fellow creators out there - I understand the challenge of monetizing your creative work in a market dominated by high commission rates. That's why <b>Croissant</b> stands apart with our <em>zero-fee policy</em>. You pour your heart into designing unique items, and I believe you should keep <b>every penny you earn</b>. Whether you're creating custom skins, special items, or entire collections, Croissant gives you the platform to reach players directly and build your own community.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>Simplicity &amp; Accessibility</summary>
                <p>The magic of <b>Croissant</b> lies in its <em>simplicity</em>. You don't need to be a tech expert or even have a Discord account to get started as an user. I've designed the system to be as <b>intuitive as possible</b>, while still offering powerful features for those who want to dive deeper. From casual traders to serious collectors, from indie creators to established developers - there's a place for <em>everyone</em> in our ecosystem.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>The Future</summary>
                <p>Looking ahead, I'm incredibly excited about the future of <b>Croissant</b>. We're working on features like <em>cross-game trading</em>, <em>enhanced creator tools</em>, and <em>community events</em> that will make the platform even more dynamic. Imagine being able to trade items across different games, or participating in special marketplace events where rare items become available. These aren't just plans - they're <b>promises I'm committed to delivering</b>.</p>
              </details>
              <details style={detailsStyle}>
                <summary style={summaryStyle}>Community</summary>
                <p>But what truly makes <b>Croissant</b> special is our <em>community</em>. Every day, I see players helping each other find items, creators sharing tips and resources, and new friendships forming through trades. It's more than just a marketplace - it's a <b>growing family</b> of gamers and creators who share a passion for gaming and fair trading.</p>
              </details>
            </div>
        </div>
    );
}