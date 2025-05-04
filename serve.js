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
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var path = __importStar(require("path"));
var dotenv_1 = require("dotenv");
var ProxyMiddleware_1 = __importDefault(require("./ProxyMiddleware"));
var GenKey_1 = require("./GenKey");
var cookie_parser_1 = __importDefault(require("cookie-parser")); // <-- Add this line
(0, dotenv_1.config)(); // Load environment variables from .env file
var app = (0, express_1["default"])();
var PORT = process.env.PORT || 3000;
app.use((0, cookie_parser_1["default"])()); // <-- Add this line
// Serve static files from the "build" directory
app.use(express_1["default"].static(path.join(__dirname, "build")));
app.get("/login", function (req, res) {
    if (req.cookies.token) {
        return res.redirect("/transmitToken"); // Redirect to homepage if already logged in
    }
    return res.redirect("/auth/discord");
});
app.get("/transmitToken", function (req, res) {
    res.sendFile(path.join(__dirname, "build", "transmitToken.html"));
});
// Simple Discord OAuth2 endpoints (no session, no passport)
app.get('/auth/discord', function (req, res) {
    var params = new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        redirect_uri: process.env.DISCORD_CALLBACK_URL,
        response_type: "code",
        scope: "identify email"
    });
    res.redirect("https://discord.com/api/oauth2/authorize?".concat(params.toString()));
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
        // Use the access token to fetch user info or perform other actions
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
                // User does not exist, create it
                return fetch("".concat(req.protocol, "://").concat(req.get("host"), "/api/users/create"), {
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
        })["catch"](function (err) {
            console.error("Error ensuring user exists:", err);
        });
        var token = (0, GenKey_1.genKey)(user.id); // Generate a key for the user
        res.cookie("token", token); // Set the cookie with the token
        res.redirect("/login"); // Redirect to the homepage or any other page
    })["catch"](function (error) {
        console.error("Error:", error);
        res.status(500).send("An error occurred during the authentication process.");
    });
});
app.use('/api', (0, ProxyMiddleware_1["default"])("http://localhost:3456/"));
app.use('/items-icons', express_1["default"].static(path.join(__dirname, "itemsIcons")));
// For SPA: serve index.html for any unknown routes
app.use(function (_req, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});
app.listen(PORT, function () {
    console.log("Server running on http://localhost:".concat(PORT));
});
