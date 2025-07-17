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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var path = __importStar(require("path"));
var dotenv_1 = require("dotenv");
var ProxyMiddleware_1 = __importDefault(require("./ProxyMiddleware"));
var GenKey_1 = require("./GenKey");
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var cors_1 = __importDefault(require("cors"));
var stream_1 = require("stream");
var fs_1 = __importDefault(require("fs"));
var crypto_1 = __importDefault(require("crypto"));
var multer_1 = __importDefault(require("multer"));
var googleapis_1 = require("googleapis");
(0, dotenv_1.config)({ path: path.join(__dirname, "..", ".env") });
var app = (0, express_1["default"])();
var PORT = process.env.PORT || 3000;
var BOT_TOKEN = "Bot ".concat(process.env.BOT_TOKEN);
var iconsDir = path.join(__dirname, "..", "gameIcons");
var bannersDir = path.join(__dirname, "..", "bannersIcons");
var itemsIconsDir = path.join(__dirname, "..", "itemsIcons");
[iconsDir, bannersDir, itemsIconsDir].forEach(function (dir) {
    if (!fs_1["default"].existsSync(dir))
        fs_1["default"].mkdirSync(dir, { recursive: true });
});
var storage = function (folder) { return multer_1["default"].diskStorage({
    destination: function (_, __, cb) { return cb(null, folder); },
    filename: function (_, file, cb) {
        var hash = crypto_1["default"].createHash('sha256').update(Date.now() + file.originalname).digest('hex');
        var ext = path.extname(file.originalname);
        cb(null, "".concat(hash).concat(ext));
    }
}); };
var uploadIcon = (0, multer_1["default"])({ storage: storage(iconsDir) });
var uploadBanner = (0, multer_1["default"])({ storage: storage(bannersDir) });
var uploadItemIcon = (0, multer_1["default"])({ storage: storage(itemsIconsDir) });
app.use((0, cors_1["default"])());
app.use((0, cookie_parser_1["default"])());
app.use(express_1["default"].static(path.join(__dirname, "..", "build")));
app.get("/login", function (req, res) {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    res.sendFile(path.join(__dirname, "login.html"));
});
app.get("/login/discord", function (req, res) {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/discord");
});
app.get("/login/google", function (req, res) {
    if (req.cookies.token) {
        return res.redirect("/transmitToken");
    }
    return res.redirect("/auth/google");
});
app.get("/transmitToken", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "build", "transmitToken.html"));
});
app.get("/join-lobby", function (req, res) {
    res.sendFile(path.join(__dirname, "..", "build", "join-lobby.html"));
});
app.get('/auth/discord', function (req, res) {
    var params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_CALLBACK_URL,
        response_type: "code",
        scope: "identify email"
    });
    res.redirect("https://discord.com/api/oauth2/authorize?".concat(params.toString()));
});
function generateGoogleAuthUrl() {
    var oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_CALLBACK_URL);
    var scopes = [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email"
    ];
    return oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent"
    });
}
app.get('/auth/google', function (req, res) {
    var url = generateGoogleAuthUrl();
    res.redirect(url);
});
app.get('/auth/discord/callback', function (req, res) {
    var code = req.query.code;
    if (!code) {
        res.status(400).send("Missing code parameter");
        return;
    }
    var params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.DISCORD_CALLBACK_URL
    });
    fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to fetch access token");
        }
        return response.json();
    })
        .then(function (data) {
        var access_token = data.access_token;
        return fetch("https://discord.com/api/v10/users/@me", {
            headers: {
                Authorization: "Bearer ".concat(access_token)
            }
        });
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }
        return response.json();
    })
        .then(function (user) {
        fetch("".concat(req.protocol, "://").concat(req.get("host"), "/api/users/").concat(user.id))
            .then(function (apiRes) {
            if (apiRes.status === 404) {
                return fetch("".concat(req.protocol, "://").concat(req.get("host"), "/api/users/create"), {
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
        })["catch"](function (err) {
            console.error("Error ensuring user exists:", err);
        });
        var token = (0, GenKey_1.genKey)(user.id);
        res.cookie("token", token);
        res.redirect("/login");
    })["catch"](function (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the authentication process.");
    });
});
app.get('/auth/google/callback', function (req, res) {
    var code = req.query.code;
    if (!code) {
        res.status(400).send("Missing code parameter");
        return;
    }
    var params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL
    });
    fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: params.toString()
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to fetch access token");
        }
        return response.json();
    })
        .then(function (data) {
        var access_token = data.access_token;
        return fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: "Bearer ".concat(access_token)
            }
        });
    })
        .then(function (response) {
        if (!response.ok) {
            throw new Error("Failed to fetch user info");
        }
        return response.json();
    })
        .then(function (user) {
        // Use Google user ID as the primary identifier
        var userId = "google_".concat(user.id);
        fetch("".concat(req.protocol, "://").concat(req.get("host"), "/api/users/").concat(userId))
            .then(function (apiRes) {
            if (apiRes.status === 404) {
                return fetch("".concat(req.protocol, "://").concat(req.get("host"), "/api/users/create"), {
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
        })["catch"](function (err) {
            console.error("Error ensuring user exists:", err);
        });
        var token = (0, GenKey_1.genKey)(userId);
        res.cookie("token", token);
        res.redirect("/login");
    })["catch"](function (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the Google authentication process.");
    });
});
app.use('/api', (0, ProxyMiddleware_1["default"])("http://localhost:3456/"));
// app.use('/api', createProxy("https://croissant-api.fr/api"));
app.get('/items-icons/:hash', function (req, res) {
    var hash = req.params.hash;
    var files = fs_1["default"].readdirSync(itemsIconsDir);
    var file = files.find(function (f) { return path.parse(f).name === hash; });
    var fallbackPath = path.join(__dirname, "..", "public", "System_Shop.webp");
    var fileToSend = file ? path.join(itemsIconsDir, file) : fallbackPath;
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache for 1 day
    res.sendFile(fileToSend);
});
app.get("/games-icons/:hash", function (req, res) {
    var hash = req.params.hash;
    // Find file with matching hash (filename without extension)
    var files = fs_1["default"].readdirSync(iconsDir);
    var file = files.find(function (f) { return path.parse(f).name === hash; });
    var fallbackPath = path.join(__dirname, "..", "public", "8293566.png");
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(iconsDir, file));
    }
    else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(fallbackPath);
    }
});
app.get("/banners-icons/:hash", function (req, res) {
    var hash = req.params.hash;
    var files = fs_1["default"].readdirSync(bannersDir);
    var file = files.find(function (f) { return path.parse(f).name === hash; });
    var fallbackPath = path.join(__dirname, "..", "public", "Generic-Banner-03-blue-Game.png");
    if (file) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(path.join(bannersDir, file));
    }
    else {
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.sendFile(fallbackPath);
    }
});
app.post("/upload/item-icon", uploadItemIcon.single("icon"), function (req, res) {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    var hash = path.parse(req.file.filename).name;
    res.json({ hash: hash });
});
app.post("/upload/game-icon", uploadIcon.single("icon"), function (req, res) {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    var hash = path.parse(req.file.filename).name;
    res.json({ hash: hash });
});
app.post("/upload/banner", uploadBanner.single("banner"), function (req, res) {
    if (!req.file)
        return res.status(400).json({ error: "No file uploaded" });
    var hash = path.parse(req.file.filename).name;
    res.json({ hash: hash });
});
app.get('/avatar/:userId', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, response, user, avatarUrl, extension, defaultAvatarIndex, avatarRes, nodeStream, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                userId = req.params.userId;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, fetch("https://discord.com/api/v10/users/".concat(userId), {
                        headers: {
                            Authorization: BOT_TOKEN
                        }
                    })];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    res.setHeader('Cache-Control', 'public, max-age=86400');
                    return [2 /*return*/, res.redirect('https://cdn.discordapp.com/embed/avatars/0.png')];
                }
                return [4 /*yield*/, response.json()];
            case 3:
                user = _a.sent();
                avatarUrl = void 0;
                if (user.avatar) {
                    extension = user.avatar.startsWith('a_') ? 'gif' : 'png';
                    avatarUrl = "https://cdn.discordapp.com/avatars/".concat(user.id, "/").concat(user.avatar, ".").concat(extension, "?size=128");
                }
                else {
                    defaultAvatarIndex = Number(user.discriminator) % 5;
                    avatarUrl = "https://cdn.discordapp.com/embed/avatars/".concat(defaultAvatarIndex, ".png");
                }
                return [4 /*yield*/, fetch(avatarUrl)];
            case 4:
                avatarRes = _a.sent();
                res.setHeader('Cache-Control', 'public, max-age=86400');
                if (!avatarRes.ok) {
                    return [2 /*return*/, res.redirect('https://cdn.discordapp.com/embed/avatars/0.png')];
                }
                res.setHeader('Content-Type', avatarRes.headers.get('content-type') || 'image/png');
                if (avatarRes.body) {
                    nodeStream = stream_1.Readable.from(avatarRes.body);
                    nodeStream.pipe(res);
                }
                else {
                    res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
                }
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                res.setHeader('Cache-Control', 'public, max-age=86400');
                res.redirect('https://cdn.discordapp.com/embed/avatars/0.png');
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
// Place these routes before the catch-all route to avoid being overridden
app.use('/launcher', express_1["default"].static(path.join(__dirname, "..", "launcher", "build")));
app.get('/launcher/:path', function (req, res) {
    res.sendFile(path.join(__dirname, "..", "launcher", "build", "index.html"));
});
app.use(function (_req, res) {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
});
