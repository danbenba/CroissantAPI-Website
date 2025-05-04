import express, { Express, Request, Response } from "express";
import * as path from "path";
import { config } from "dotenv";
import createProxy from "./ProxyMiddleware";
import { genKey } from "./GenKey";
import cookieParser from "cookie-parser"; // <-- Add this line

config(); // Load environment variables from .env file

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cookieParser()); // <-- Add this line

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, "build")));

app.get("/login", (req: Request, res: Response) => {
    if(req.cookies.token) {
        return res.redirect("/transmitToken"); // Redirect to homepage if already logged in
    }
    return res.redirect("/auth/discord");
});

app.get("/transmitToken", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "build", "transmitToken.html"));
});

// Simple Discord OAuth2 endpoints (no session, no passport)
app.get('/auth/discord', (req: Request, res: Response) => {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        redirect_uri: process.env.DISCORD_CALLBACK_URL!,
        response_type: "code",
        scope: "identify email"
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});

app.get('/auth/discord/callback', (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
        res.status(400).send("Missing code parameter");
        return
    }
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID!,
        client_secret: process.env.DISCORD_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: process.env.DISCORD_CALLBACK_URL!,
    });
    fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch access token");
        }
        return response.json();
    })
    .then(data => {
        const { access_token } = data;
        // Use the access token to fetch user info or perform other actions
        return fetch("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }
        return response.json();
    })
    .then(user => {

        fetch(`${req.protocol}://${req.get("host")}/api/users/${user.id}`)
            .then(apiRes => {
                if (apiRes.status === 404) {
                    // User does not exist, create it
                    return fetch(`${req.protocol}://${req.get("host")}/api/users/create`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            username: user.username,
                            balance: 1000 // or any default starting balance
                        })
                    });
                }
                return apiRes;
            })
            .catch(err => {
                console.error("Error ensuring user exists:", err);
            });

        const token = genKey(user.id); // Generate a key for the user
        res.cookie("token", token); // Set the cookie with the token
        res.redirect("/login"); // Redirect to the homepage or any other page
    })
    .catch(error => {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the authentication process.");
    });
});

app.use('/api', createProxy("http://localhost:3456/"));
app.use('/items-icons', express.static(path.join(__dirname, "itemsIcons")));

// For SPA: serve index.html for any unknown routes
app.use((_req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});