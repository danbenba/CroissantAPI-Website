import express, { Express, Request, Response } from "express";
import * as path from "path";
import { config } from "dotenv";
import createProxy from "./ProxyMiddleware";
import { genKey } from "./GenKey";
import cookieParser from "cookie-parser";
import cors from "cors";
import { Readable } from "stream";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

import { Request as ExpressRequest } from "express";
import { google } from "googleapis";
interface MulterRequest extends ExpressRequest {
    file?: Express.Multer.File;
}

config({ path: path.join(__dirname, "..", ".env") });

const app: Express = express();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = `Bot ${process.env.BOT_TOKEN}`;

const iconsDir = path.join(__dirname, "..", "gameIcons");
const bannersDir = path.join(__dirname, "..", "bannersIcons");
const itemsIconsDir = path.join(__dirname, "..", "itemsIcons");

[iconsDir, bannersDir, itemsIconsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = (folder: string) => multer.diskStorage({
    destination: (_, __, cb) => cb(null, folder),
    filename: (_, file, cb) => {
        const hash = crypto.createHash('sha256').update(Date.now() + file.originalname).digest('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${hash}${ext}`);
    }
});

const uploadIcon = multer({ storage: storage(iconsDir) });
const uploadBanner = multer({ storage: storage(bannersDir) });
const uploadItemIcon = multer({ storage: storage(itemsIconsDir) });

app.use(cors());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "build")));

app.get("/login", (req: Request, res: Response) => {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    res.sendFile(path.join(__dirname, "login.html"));
});

app.get("/login/discord", (req: Request, res: Response) => {
    if(req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/discord");
});

app.get("/login/google", (req: Request, res: Response) => {
    if(req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/google");
});

app.get("/transmitToken", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "build", "transmitToken.html"));
});

app.get("/join-lobby", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "..", "build", "join-lobby.html"));
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

function generateGoogleAuthUrl() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_CALLBACK_URL
    );
    const scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ];
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent"
    });
}

app.get('/auth/google', (req: Request, res: Response) => {
    const url = generateGoogleAuthUrl();
    res.redirect(url);
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

app.get('/auth/google/callback', (req: Request, res: Response) => {
    const { code } = req.query;
    if (!code) {
        res.status(400).send("Missing code parameter");
        return;
    }
    
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
    });

    fetch("https://oauth2.googleapis.com/token", {
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
        return fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
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
        // Use Google user ID as the primary identifier
        const userId = `google_${user.id}`;
        
        fetch(`${req.protocol}://${req.get("host")}/api/users/${userId}`)
            .then(apiRes => {
                if (apiRes.status === 404) {
                    return fetch(`${req.protocol}://${req.get("host")}/api/users/create`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userId: userId,
                            username: user.name || user.email.split('@')[0],
                            balance: 1000
                        })
                    });
                }
                return apiRes;
            })
            .catch(err => {
                console.error("Error ensuring user exists:", err);
            });

        const token = genKey(userId);
        res.cookie("token", token);
        res.redirect("/login");
    })
    .catch(error => {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the Google authentication process.");
    });
});

app.use('/api', createProxy("http://localhost:3456/"));
// app.use('/api', createProxy("https://croissant-api.fr/api"));
app.get('/items-icons/:hash', (req: Request, res: Response) => {
    const hash = req.params.hash;
    const files = fs.readdirSync(itemsIconsDir);
    const file = files.find(f => path.parse(f).name === hash);
    const fallbackPath = path.join(__dirname, "..", "public", "System_Shop.webp");
    const fileToSend = file ? path.join(itemsIconsDir, file) : fallbackPath;
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache for 1 day
    res.sendFile(fileToSend);
});
app.get("/games-icons/:hash", (req: Request, res: Response) => {
    const hash = req.params.hash;
    // Find file with matching hash (filename without extension)
    const files = fs.readdirSync(iconsDir);
    const file = files.find(f => path.parse(f).name === hash);
    const fallbackPath = path.join(__dirname, "..", "public", "8293566.png");
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(iconsDir, file));
    } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(fallbackPath);
    }
});

app.get("/banners-icons/:hash", (req: Request, res: Response) => {
    const hash = req.params.hash;
    const files = fs.readdirSync(bannersDir);
    const file = files.find(f => path.parse(f).name === hash);
    const fallbackPath = path.join(__dirname, "..", "public", "Generic-Banner-03-blue-Game.png");
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(bannersDir, file));
    } else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(fallbackPath);
    }
});

app.post("/upload/item-icon", uploadItemIcon.single("icon"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const hash = path.parse(req.file.filename).name;
    res.json({ hash });
});

app.post("/upload/game-icon", uploadIcon.single("icon"), (req: MulterRequest, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const hash = path.parse(req.file.filename).name;
    res.json({ hash });
});

app.post("/upload/banner", uploadBanner.single("banner"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const hash = path.parse(req.file.filename).name;
    res.json({ hash });
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
            avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
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

// Place these routes before the catch-all route to avoid being overridden
app.use('/launcher', express.static(path.join(__dirname, "..", "launcher", "build")));
app.get('/launcher/:path', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "launcher", "build", "index.html"));
});

app.use((_req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
