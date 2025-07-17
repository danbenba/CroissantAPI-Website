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
Object.defineProperty(exports, "__esModule", { value: true });
const http = __importStar(require("http"));
const https = __importStar(require("https"));
const url_1 = require("url");
function createProxy(targetBase) {
    const targetBaseUrl = new url_1.URL(targetBase);
    return async function (req, res, next) {
        try {
            const targetPath = req.originalUrl.replace(req.baseUrl, '') || '/';
            const query = req.url.includes('?') ? req.url.split('?')[1] : '';
            const targetUrl = new url_1.URL(targetPath, targetBaseUrl);
            // console.log('Proxying request to:', targetUrl.href);    
            if (query)
                targetUrl.search = '?' + query;
            const client = targetUrl.protocol === 'https:' ? https : http;
            const chunks = [];
            req.on('data', (chunk) => chunks.push(chunk));
            req.on('end', () => {
                const body = Buffer.concat(chunks);
                const options = {
                    method: req.method,
                    headers: {
                        ...req.headers,
                        host: targetUrl.host,
                    },
                };
                const proxyReq = client.request(targetUrl, options, (proxyRes) => {
                    res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                    proxyRes.pipe(res);
                });
                proxyReq.on('error', (err) => {
                    console.error('Proxy error:', err);
                    res.statusCode = 502;
                    res.end('Proxy Error');
                });
                if (body.length) {
                    proxyReq.write(body);
                }
                proxyReq.end();
            });
        }
        catch (err) {
            console.error('Internal proxy error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    };
}
exports.default = createProxy;
