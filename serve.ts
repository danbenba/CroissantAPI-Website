import express, { Express } from "express";
import * as path from "path";
import { config } from "dotenv";
import createProxy from "./ProxyMiddleware";

config(); // Load environment variables from .env file

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "build" directory
app.use(express.static(path.join(__dirname, "build")));

app.use('/api', createProxy("http://localhost:3456/"));

// For SPA: serve index.html for any unknown routes
app.use((_req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});