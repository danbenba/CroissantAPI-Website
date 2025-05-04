"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.setCachedUser = exports.getCachedUser = void 0;
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var CACHE_FILE = path_1["default"].join(__dirname, "userCache.json");
var CACHE_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
function loadCache() {
    if (!fs_1["default"].existsSync(CACHE_FILE))
        return {};
    try {
        return JSON.parse(fs_1["default"].readFileSync(CACHE_FILE, "utf-8"));
    }
    catch (_a) {
        return {};
    }
}
function saveCache(cache) {
    fs_1["default"].writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}
function getCachedUser(userId) {
    var cache = loadCache();
    var entry = cache[userId];
    if (!entry)
        return null;
    if (Date.now() - entry.timestamp > CACHE_EXPIRY_MS) {
        delete cache[userId];
        saveCache(cache);
        return null;
    }
    return entry.data;
}
exports.getCachedUser = getCachedUser;
function setCachedUser(userId, data) {
    var cache = loadCache();
    cache[userId] = { data: data, timestamp: Date.now() };
    saveCache(cache);
}
exports.setCachedUser = setCachedUser;
