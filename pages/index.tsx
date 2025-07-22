import Section from "../components/Section";
import ListSection from "../components/ListSection";
import Head from "next/head";
import React from "react";
import Link from "next/link";

function useResponsiveStyles() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 600);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const detailsStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: 8,
    marginBottom: isMobile ? "0.8rem" : "1.5rem",
    background: "#23272faa",
    boxShadow: isMobile ? undefined : "0 2px 8px rgba(0,0,0,0.24)",
    padding: isMobile
      ? "0.3rem 0.5rem 0.7rem 0.5rem"
      : "0.5rem 1.2rem 1rem 1.2rem",
    color: "#f3f3f3",
  };
  const summaryStyle: React.CSSProperties = {
    fontWeight: 600,
    fontSize: isMobile ? "1rem" : "1.15rem",
    cursor: "pointer",
    outline: "none",
    padding: isMobile ? "0.5rem 0" : "0.7rem 0",
    color: "#e2e8f0",
  };
  const aboutStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: 8,
    background: "#181a20aa",
    padding: isMobile ? "0.7rem" : "1.2rem",
    marginTop: isMobile ? "1rem" : "2rem",
    color: "#f3f3f3",
    marginLeft: isMobile ? "0.5rem" : "1.5rem",
    marginRight: isMobile ? "0.5rem" : "1.5rem",
  };
  return { detailsStyle, summaryStyle, aboutStyle };
}

// Style constant for the top <span>
const topSpanStyle: React.CSSProperties = {
  fontSize: 16,
  marginTop: 0,
  marginBottom: 16,
  opacity: 0.7,
  textAlign: "center",
  justifyContent: "center",
  display: "flex",
  flexWrap: "wrap", // Allow wrapping to new line if too many words
  whiteSpace: "normal", // Allow line breaks
  wordBreak: "break-word", // Break long words if needed
};

// Overview details content as an array for easier maintenance
const overviewDetails = [
  {
    summary: "For Players",
    content: (
      <ul>
        <li>Play games connected to Croissant and collect unique items.</li>
        <li>Trade, buy, or sell your items with other users.</li>
        <li>Join multiplayer games easily using lobbies.</li>
        <li>Manage your inventory and credits via Discord or the launcher.</li>
        <li>
          <span style={{ color: "red" }}>NEW:</span> Link your Steam account to
          access your Steam inventory.
        </li>
      </ul>
    ),
  },
  {
    summary: "For Creators & Game Developers",
    content: (
      <>
        <ul>
          <li>
            Connect your game to Croissant via{" "}
            <Link href="/api-docs" legacyBehavior>
              <a>SDK or API</a>
            </Link>
            .
          </li>
          <li>
            Authenticate players and interact with their inventory (add/remove
            items, rewards, in-game purchases).
          </li>
          <li>Create and sell your own items or bundles in the marketplace.</li>
          <li>Use lobbies to manage private multiplayer sessions.</li>
          <li>
            <span style={{ color: "red" }}>NEW:</span> Use OAuth2 as
            authentication on your website.
          </li>
          <li>
            <span style={{ color: "red" }}>NEW:</span> Users can now link their
            Steam accounts. If you decide to make your game on Steam, you can
            find a user by their Steam ID and recover their inventory.
          </li>
        </ul>
        <p>
          <b>Get started:</b> Generate your API key with{" "}
          <Link href="/api-key" legacyBehavior>
            <a>/api-key</a>
          </Link>{" "}
          and see the{" "}
          <Link href="/api-docs" legacyBehavior>
            <a>documentation</a>
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    summary: "Marketplace & Inventory",
    content: (
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
    ),
  },
  {
    summary: "Lobby System",
    content: (
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
    ),
  },
  {
    summary: "Safety & Support",
    content: (
      <Section title="Safety & Support">
        <p>
          <b>Your security is our priority.</b> Never share your account or API
          key. Always double-check trade details before confirming. For help,
          use <strong>/support</strong> or join our support server.
        </p>
      </Section>
    ),
  },
  {
    summary: "Test OAuth2 (new!)",
    content: (
      <>
        <p>
          You can now try out Croissant's OAuth2 integration on the{" "}
          <Link href="/oauth2/test" legacyBehavior>
            <a>
              <b>/oauth2/test</b>
            </a>
          </Link>{" "}
          page.
          <br />
          This system allows you to securely connect your website or application
          to Croissant, authenticate users, and access their inventories.
        </p>
        <ul>
          <li>Simple and secure authentication via OAuth2.</li>
          <li>Allows access to a user's Croissant inventory.</li>
          <li>Easy to integrate for game or website developers.</li>
        </ul>
        <p>
          <b>Try it now:</b>{" "}
          <Link href="/oauth2/test" legacyBehavior>
            <a>/oauth2/test</a>
          </Link>
        </p>
      </>
    ),
  },
];

// About details content as an array for easier maintenance
const aboutDetails = [
  {
    summary: "Who am I?",
    content: (
      <p>
        <b>Hi, my name is Fox</b>, a.k.a <em>fox3000foxy</em> on socials. I'm a{" "}
        <b>French developer</b> passionate about coding and creating innovative
        solutions. I am the creator of the <b>Croissant Inventory System</b>.
      </p>
    ),
  },
  {
    summary: "The Croissant Inventory System",
    content: (
      <>
        <p>
          The idea of <b>Croissant Inventory System</b> was to be a{" "}
          <em>second-hand items marketplace</em> crafted for gamers and
          creators. My platform not only allows players to exchange in-game
          items but also empowers creators to monetize their creations by
          selling items and cosmetics <b>without any fees</b>. This approach
          challenges the ultra-expensive marketplaces by providing a fair and
          accessible platform for all.
        </p>
        <p>
          I am committed to <b>giving items a second life</b>, enabling seamless
          trading, buying, and selling of pre-owned items. This promotes{" "}
          <em>sustainability</em> and fosters a{" "}
          <b>dynamic marketplace environment</b> where gamers can benefit from
          each other's inventories.
        </p>
        <p>
          Importantly, players do not need to be familiar with the bot or even
          have a Discord account to enjoy the benefits of my system. The{" "}
          <b>Croissant Inventory System</b> is designed to be user-friendly and
          accessible to all.
        </p>
      </>
    ),
  },
  {
    summary: "API & Discord Bot",
    content: (
      <p>
        I'm actively working on maintaining the <b>API</b> and the{" "}
        <b>Discord bot</b> to ensure they are stable and robust, minimizing the
        risk of bugs. The Discord bot, which facilitates inventory management
        and trading, is already available. You can explore it{" "}
        <a href="https://ptb.discord.com/oauth2/authorize?client_id=1324530344900431923">
          <b>here</b>
        </a>
        .
      </p>
    ),
  },
  {
    summary: "Marketplace Philosophy",
    content: (
      <>
        <p>
          Like Vinted, the <b>Croissant Inventory System</b> was thinked to be
          an user-to-user marketplace. I'm working on it to make it as easy as
          possible to use for users, but also for creators.
        </p>
        <p>
          As both a <b>gamer and developer</b>, I've always dreamed of a
          marketplace that truly understands the gaming community's needs.
          That's why I built <em>Croissant</em> to be more than just a trading
          platform - it's a <b>vibrant ecosystem</b> where gaming items find new
          life and creators can thrive.
        </p>
      </>
    ),
  },
  {
    summary: "For Gamers",
    content: (
      <p>
        For gamers, I've witnessed firsthand how frustrating it can be to have
        valuable items sitting unused in your inventory. With <b>Croissant</b>,
        you can now turn these dormant assets into <em>opportunities</em>.
        Imagine finding that rare skin you've been hunting for months, or
        finally completing your collection by trading with someone across the
        globe. The possibilities are endless, and the best part? It's all
        happening in a <b>secure, user-friendly environment</b>.
      </p>
    ),
  },
  {
    summary: "For Creators",
    content: (
      <p>
        To my fellow creators out there - I understand the challenge of
        monetizing your creative work in a market dominated by high commission
        rates. That's why <b>Croissant</b> stands apart with our{" "}
        <em>zero-fee policy</em>. You pour your heart into designing unique
        items, and I believe you should keep <b>every penny you earn</b>.
        Whether you're creating custom skins, special items, or entire
        collections, Croissant gives you the platform to reach players directly
        and build your own community.
      </p>
    ),
  },
  {
    summary: "Simplicity & Accessibility",
    content: (
      <p>
        The magic of <b>Croissant</b> lies in its <em>simplicity</em>. You don't
        need to be a tech expert or even have a Discord account to get started
        as an user. I've designed the system to be as{" "}
        <b>intuitive as possible</b>, while still offering powerful features for
        those who want to dive deeper. From casual traders to serious
        collectors, from indie creators to established developers - there's a
        place for <em>everyone</em> in our ecosystem.
      </p>
    ),
  },
  {
    summary: "The Future",
    content: (
      <p>
        Looking ahead, I'm incredibly excited about the future of{" "}
        <b>Croissant</b>. We're working on features like{" "}
        <em>cross-game trading</em>, <em>enhanced creator tools</em>, and{" "}
        <em>community events</em> that will make the platform even more dynamic.
        Imagine being able to trade items across different games, or
        participating in special marketplace events where rare items become
        available. These aren't just plans - they're{" "}
        <b>promises I'm committed to delivering</b>.
      </p>
    ),
  },
  {
    summary: "Community",
    content: (
      <p>
        But what truly makes <b>Croissant</b> special is our <em>community</em>.
        Every day, I see players helping each other find items, creators sharing
        tips and resources, and new friendships forming through trades. It's
        more than just a marketplace - it's a <b>growing family</b> of gamers
        and creators who share a passion for gaming and fair trading.
      </p>
    ),
  },
];

export default function Home() {
  const { detailsStyle, summaryStyle, aboutStyle } = useResponsiveStyles();
  return (
    <>
      <span style={topSpanStyle}>
        Creative and Reusable Opensource Inventory System, Scalable, APIful, and
        Network Technology
      </span>
      <div
        className="container"
        style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem" }}
      >
        <h1>
          <span className="method post">CROISSANT PLATFORM OVERVIEW</span>
        </h1>
        <div style={aboutStyle} className="indent">
          {overviewDetails.map(({ summary, content }) => (
            <details style={detailsStyle} open key={summary}>
              <summary style={summaryStyle}>{summary}</summary>
              {content}
            </details>
          ))}
        </div>
        <h1 id="about-us">
          <span className="method put">ABOUT ME</span>
        </h1>
        <div style={aboutStyle}>
          {aboutDetails.map(({ summary, content }) => (
            <details style={detailsStyle} open key={summary}>
              <summary style={summaryStyle}>{summary}</summary>
              {content}
            </details>
          ))}
        </div>
      </div>
    </>
  );
}
