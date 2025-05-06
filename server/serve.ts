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
    if(req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/discord");
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

app.get("/games-icons/:hash", (req: Request, res: Response) => {
    const hash = req.params.hash;
    // Find file with matching hash (filename without extension)
    const files = fs.readdirSync(iconsDir);
    const file = files.find(f => path.parse(f).name === hash);
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(iconsDir, file));
    } else {
        res.status(404).send("Icon not found");
    }
});

app.get("/banners-icons/:hash", (req: Request, res: Response) => {
    const hash = req.params.hash;
    const files = fs.readdirSync(bannersDir);
    const file = files.find(f => path.parse(f).name === hash);
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(bannersDir, file));
    } else {
        res.status(404).send("Banner not found");
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
