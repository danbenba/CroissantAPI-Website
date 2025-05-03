"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.__esModule = true;
var http = __importStar(require("http"));
var https = __importStar(require("https"));
var url_1 = require("url");
function createProxy(targetBase) {
    var targetBaseUrl = new url_1.URL(targetBase);
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var targetPath, query, targetUrl_1, client_1, chunks_1;
            return __generator(this, function (_a) {
                try {
                    targetPath = req.originalUrl.replace(req.baseUrl, '') || '/';
                    query = req.url.includes('?') ? req.url.split('?')[1] : '';
                    targetUrl_1 = new url_1.URL(targetPath, targetBaseUrl);
                    // console.log('Proxying request to:', targetUrl.href);    
                    if (query)
                        targetUrl_1.search = '?' + query;
                    client_1 = targetUrl_1.protocol === 'https:' ? https : http;
                    chunks_1 = [];
                    req.on('data', function (chunk) { return chunks_1.push(chunk); });
                    req.on('end', function () {
                        var body = Buffer.concat(chunks_1);
                        var options = {
                            method: req.method,
                            headers: __assign(__assign({}, req.headers), { host: targetUrl_1.host })
                        };
                        var proxyReq = client_1.request(targetUrl_1, options, function (proxyRes) {
                            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
                            proxyRes.pipe(res);
                        });
                        proxyReq.on('error', function (err) {
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
                return [2 /*return*/];
            });
        });
    };
}
exports["default"] = createProxy;
