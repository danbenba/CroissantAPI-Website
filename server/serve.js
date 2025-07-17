"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path = __importStar(require("path"));
const dotenv_1 = require("dotenv");
const ProxyMiddleware_1 = __importDefault(require("./ProxyMiddleware"));
const GenKey_1 = require("./GenKey");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const crypto_1 = __importDefault(require("crypto"));
const multer_1 = __importDefault(require("multer"));
const googleapis_1 = require("googleapis");
(0, dotenv_1.config)({ path: path.join(__dirname, "..", ".env") });
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = `Bot ${process.env.BOT_TOKEN}`;
const iconsDir = path.join(__dirname, "..", "gameIcons");
const bannersDir = path.join(__dirname, "..", "bannersIcons");
const itemsIconsDir = path.join(__dirname, "..", "itemsIcons");
const avatarsDir = path.join(__dirname, "..", "avatars");
[iconsDir, bannersDir, itemsIconsDir, avatarsDir].forEach(dir => {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
});
const storage = (folder) => multer_1.default.diskStorage({
    destination: (_, __, cb) => cb(null, folder),
    filename: (_, file, cb) => {
        const hash = crypto_1.default.createHash('sha256').update(Date.now() + file.originalname).digest('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${hash}${ext}`);
    }
});
const uploadIcon = (0, multer_1.default)({ storage: storage(iconsDir) });
const uploadBanner = (0, multer_1.default)({ storage: storage(bannersDir) });
const uploadItemIcon = (0, multer_1.default)({ storage: storage(itemsIconsDir) });
const uploadAvatar = (0, multer_1.default)({ storage: storage(avatarsDir) });
app.use((0, cors_1.default)());
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path.join(__dirname, "..", "build")));
app.get("/login", (req, res) => {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    res.sendFile(path.join(__dirname, "login.html"));
});
app.get("/login/discord", (req, res) => {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/discord");
});
app.get("/login/google", (req, res) => {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/google");
});
app.get("/transmitToken", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "transmitToken.html"));
});
app.get("/join-lobby", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "join-lobby.html"));
});
app.get('/auth/discord', (req, res) => {
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_CALLBACK_URL,
        response_type: "code",
        scope: "identify email"
    });
    res.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
});
function generateGoogleAuthUrl() {
    const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
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
app.get('/auth/google', (req, res) => {
    const url = generateGoogleAuthUrl();
    res.redirect(url);
});
app.get('/auth/discord/callback', (req, res) => {
    const { code } = req.query;
    if (!code) {
        res.status(400).send("Missing code parameter");
        return;
    }
    const params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.DISCORD_CALLBACK_URL,
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
        const token = (0, GenKey_1.genKey)(user.id);
        res.cookie("token", token);
        res.redirect("/login");
    })
        .catch(error => {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the authentication process.");
    });
});
app.get('/auth/google/callback', (req, res) => {
    const { code } = req.query;
    if (!code) {
        res.status(400).send("Missing code parameter");
        return;
    }
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
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
        const token = (0, GenKey_1.genKey)(userId);
        res.cookie("token", token);
        res.redirect("/login");
    })
        .catch(error => {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the Google authentication process.");
    });
});
app.use('/api', (0, ProxyMiddleware_1.default)("http://localhost:3456/"));
// app.use('/api', createProxy("https://croissant-api.fr/api"));
app.get('/items-icons/:hash', (req, res) => {
    const hash = req.params.hash;
    const files = fs_1.default.readdirSync(itemsIconsDir);
    const file = files.find(f => path.parse(f).name === hash);
    const fallbackPath = path.join(__dirname, "..", "public", "System_Shop.webp");
    const fileToSend = file ? path.join(itemsIconsDir, file) : fallbackPath;
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache for 1 day
    res.sendFile(fileToSend);
});
app.get("/games-icons/:hash", (req, res) => {
    const hash = req.params.hash;
    // Find file with matching hash (filename without extension)
    const files = fs_1.default.readdirSync(iconsDir);
    const file = files.find(f => path.parse(f).name === hash);
    const fallbackPath = path.join(__dirname, "..", "public", "8293566.png");
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(iconsDir, file));
    }
    else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(fallbackPath);
    }
});
app.get("/banners-icons/:hash", (req, res) => {
    const hash = req.params.hash;
    const files = fs_1.default.readdirSync(bannersDir);
    const file = files.find(f => path.parse(f).name === hash);
    const fallbackPath = path.join(__dirname, "..", "public", "Generic-Banner-03-blue-Game.png");
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(bannersDir, file));
    }
    else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(fallbackPath);
    }
});
app.post("/upload/item-icon", uploadItemIcon.single("icon"), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const hash = path.parse(req.file.filename).name;
    res.json({ hash });
});
app.post("/upload/game-icon", uploadIcon.single("icon"), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const hash = path.parse(req.file.filename).name;
    res.json({ hash });
});
app.post("/upload/banner", uploadBanner.single("banner"), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    const hash = path.parse(req.file.filename).name;
    res.json({ hash });
});
app.post('/upload/avatar', uploadAvatar.single('avatar'), async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing' });
        }
        const userResponse = await fetch(`${req.protocol}://${req.get('host')}/api/users/@me`, {
            headers: { Authorization: authHeader }
        });
        if (!userResponse.ok) {
            return res.status(401).json({ error: 'Failed to fetch user information' });
        }
        const user = await userResponse.json();
        const userId = user.userId;
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const avatarPath = path.join(avatarsDir, `${userId}.png`);
        fs_1.default.renameSync(req.file.path, avatarPath);
        res.json({ message: 'Avatar uploaded successfully', userId });
    }
    catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: 'An error occurred while uploading the avatar' });
    }
});
app.get('/avatar/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Vérifier si un avatar personnalisé existe
        const customAvatarPath = path.join(avatarsDir, `${userId}.png`);
        if (fs_1.default.existsSync(customAvatarPath)) {
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.sendFile(customAvatarPath);
        }
        // Si aucun avatar personnalisé, récupérer depuis Discord
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
        let avatarUrl;
        if (user.avatar) {
            const extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
            avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${extension}?size=128`;
        }
        else {
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
            const nodeStream = stream_1.Readable.from(avatarRes.body);
            nodeStream.pipe(res);
        }
        else {
            res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
        }
    }
    catch (error) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
    }
});
// Place these routes before the catch-all route to avoid being overridden
app.use('/launcher', express_1.default.static(path.join(__dirname, "..", "launcher", "build")));
app.get('/launcher/:path', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "launcher", "build", "index.html"));
});
app.use((_req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
