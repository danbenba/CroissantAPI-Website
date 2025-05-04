import express, { Express, Request, Response } from "express";
import * as path from "path";
import { config } from "dotenv";
import createProxy from "./ProxyMiddleware";
import { genKey } from "./GenKey";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Readable } from "stream";

config({ path: path.join(__dirname, "..", ".env") });

const app: Express = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = `Bot ${process.env.BOT_TOKEN}`;

app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "build")));

app.get("/login", (req: Request, res: Response) => {
    if(req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/discord");
});

app.get("/transmitToken", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "build", "transmitToken.html"));
});

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
                    return fetch(`${req.protocol}://${req.get("host")}/api/users/create`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: user.id,
                            username: user.username,
                            balance: 1000
                        })
                    });
                }
                return apiRes;
            })
            .catch(err => {
                console.error("Error ensuring user exists:", err);
            });

        const token = genKey(user.id);
        res.cookie("token", token);
        res.redirect("/login");
    })
    .catch(error => {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the authentication process.");
    });
});

app.use('/api', createProxy("http://localhost:3456/"));
app.get('/items-icons/:imageName', (req: Request, res: Response) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, "..", "itemsIcons", imageName);
    const fallbackPath = path.join(__dirname, "..", "public", "System_Shop.webp");
    import('fs').then(fs => {
        const fileToSend = fs.existsSync(imagePath) ? imagePath : fallbackPath;
        res.setHeader('Cache-Control', 'public, max-age=86400'); // cache for 1 day
        res.sendFile(fileToSend);
    });
});

app.get('/avatar/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: {
                Authorization: BOT_TOKEN
            }
        });
        if (!response.ok) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
        }
        const user = await response.json();
        let avatarUrl: string;
        if (user.avatar) {
            const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
            avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=1024`;
        } else {
            const defaultAvatarIndex = Number(user.discriminator) % 5;
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarIndex}.png`;
        }

        // Fetch the avatar image and pipe it with cache control
        const avatarRes = await fetch(avatarUrl);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        if (!avatarRes.ok) {
            return res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
        }
        res.setHeader('Content-Type', avatarRes.headers.get('content-type') || 'image/png');
        if (avatarRes.body) {
            // Convert web ReadableStream to Node.js Readable
            const nodeStream = Readable.from(avatarRes.body as any);
            nodeStream.pipe(res);
        } else {
            res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
        }
    } catch (error) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
    }
});

app.use((_req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
