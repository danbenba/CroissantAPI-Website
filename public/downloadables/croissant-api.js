"use strict";
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
exports["default"] = exports.CroissantAPI = void 0;
var croissantBaseUrl = 'https://croissant-api.fr/api';
/**
 * CroissantAPI provides methods to interact with the Croissant API.
 */
var CroissantAPI = /** @class */ (function () {
    function CroissantAPI(params) {
        var _this = this;
        // --- USERS ---
        this.users = {
            /**
             * Get the current authenticated user's profile, including studios, roles, inventory, owned items, and created games.
             */
            getMe: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/@me"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to fetch user');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get a user by userId. userId can be a Croissant ID, Discord ID, Google ID or Steam ID.
             */
            getUser: function (userId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/").concat(userId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('User not found');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Search for users by username.
             */
            search: function (query) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/search?q=").concat(encodeURIComponent(query)))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Check the verification key for the user.
             */
            verify: function (userId, verificationKey) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/auth-verification"), {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: userId, verificationKey: verificationKey })
                            })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, { success: false }];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Transfer credits from one user to another.
             */
            transferCredits: function (targetUserId, amount) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/transfer-credits"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ targetUserId: targetUserId, amount: amount })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to transfer credits');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Change username (authenticated user only).
             */
            changeUsername: function (username) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/change-username"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ username: username })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to change username');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Change password (authenticated user only).
             */
            changePassword: function (oldPassword, newPassword, confirmPassword) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/users/change-password"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ oldPassword: oldPassword, newPassword: newPassword, confirmPassword: confirmPassword })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to change password');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- GAMES ---
        this.games = {
            /**
             * List all games visible in the store.
             */
            list: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games"))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Search for games by name, genre, or description.
             */
            search: function (query) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games/search?q=").concat(encodeURIComponent(query)))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get all games created by the authenticated user.
             */
            getMyCreatedGames: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games/@mine"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get all games owned by the authenticated user.
             */
            getMyOwnedGames: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games/list/@me"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get a game by gameId.
             */
            get: function (gameId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games/").concat(gameId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Game not found');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Create a new game.
             */
            create: function (gameData) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify(gameData)
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to create game');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Update an existing game.
             */
            update: function (gameId, gameData) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games/").concat(gameId), {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify(gameData)
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to update game');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Buy a game.
             */
            buy: function (gameId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/games/").concat(gameId, "/buy"), {
                                    method: 'POST',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to buy game');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- ITEMS ---
        this.items = {
            /**
             * Get all non-deleted items visible in store.
             */
            list: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items"))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get all items owned by the authenticated user.
             */
            getMyItems: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/@mine"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Search for items by name (only those visible in store).
             */
            search: function (query) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/search?q=").concat(encodeURIComponent(query)))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                return [2 /*return*/, []];
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get a single item by itemId.
             */
            get: function (itemId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/").concat(itemId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Item not found');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Create a new item.
             */
            create: function (itemData) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/create"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify(itemData)
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to create item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Update an existing item.
             */
            update: function (itemId, itemData) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/update/").concat(itemId), {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify(itemData)
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to update item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Delete an item.
             */
            "delete": function (itemId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/delete/").concat(itemId), {
                                    method: 'DELETE',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to delete item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Buy an item.
             */
            buy: function (itemId, amount) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/buy/").concat(itemId), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ amount: amount })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to buy item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Sell an item.
             */
            sell: function (itemId, amount) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/sell/").concat(itemId), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ amount: amount })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to sell item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Give item occurrences to a user (owner only).
             */
            give: function (itemId, amount) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/give/").concat(itemId), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ amount: amount })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to give item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Consume item occurrences from a user (owner only).
             */
            consume: function (itemId, amount) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/consume/").concat(itemId), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ amount: amount })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to consume item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Drop item occurrences from your inventory.
             */
            drop: function (itemId, amount) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/items/drop/").concat(itemId), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ amount: amount })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to drop item');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- INVENTORY ---
        this.inventory = {
            /**
             * Get the inventory of the authenticated user.
             */
            getMyInventory: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/inventory/@me"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to fetch inventory');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get the inventory of a user.
             */
            get: function (userId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/inventory/").concat(userId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to fetch inventory');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- LOBBIES ---
        this.lobbies = {
            /**
             * Create a new lobby.
             */
            create: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/lobbies"), {
                                    method: 'POST',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to create lobby');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get a lobby by lobbyId.
             */
            get: function (lobbyId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/lobbies/").concat(lobbyId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Lobby not found');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get the lobby the authenticated user is in.
             */
            getMyLobby: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/lobbies/user/@me"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('User not in any lobby');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get the lobby a user is in.
             */
            getUserLobby: function (userId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/lobbies/user/").concat(userId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('User not in any lobby');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Join a lobby.
             */
            join: function (lobbyId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/lobbies/").concat(lobbyId, "/join"), {
                                    method: 'POST',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to join lobby');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Leave a lobby.
             */
            leave: function (lobbyId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/lobbies/").concat(lobbyId, "/leave"), {
                                    method: 'POST',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to leave lobby');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- STUDIOS ---
        this.studios = {
            /**
             * Create a new studio.
             */
            create: function (studioName) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/studios"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ studioName: studioName })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to create studio');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get a studio by studioId.
             */
            get: function (studioId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/studios/").concat(studioId))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Studio not found');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get all studios the authenticated user is part of.
             */
            getMyStudios: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/studios/user/@me"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to fetch studios');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Add a user to a studio.
             */
            addUser: function (studioId, userId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/studios/").concat(studioId, "/add-user"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ userId: userId })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to add user to studio');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Remove a user from a studio.
             */
            removeUser: function (studioId, userId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/studios/").concat(studioId, "/remove-user"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ userId: userId })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to remove user from studio');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- TRADES ---
        this.trades = {
            /**
             * Start a new trade or get the latest pending trade with a user.
             */
            startOrGetPending: function (userId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/start-or-latest/").concat(userId), {
                                    method: 'POST',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to start or get trade');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get a trade by ID with enriched item information.
             */
            get: function (tradeId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/").concat(tradeId), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Trade not found');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Get all trades for a user with enriched item information.
             */
            getMyTrades: function () { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/user/@me"), {
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to fetch trades');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Add an item to a trade.
             */
            addItem: function (tradeId, tradeItem) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/").concat(tradeId, "/add-item"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ tradeItem: tradeItem })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to add item to trade');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Remove an item from a trade.
             */
            removeItem: function (tradeId, tradeItem) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/").concat(tradeId, "/remove-item"), {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                        'Authorization': "Bearer ".concat(this.token)
                                    },
                                    body: JSON.stringify({ tradeItem: tradeItem })
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to remove item from trade');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Approve a trade.
             */
            approve: function (tradeId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/").concat(tradeId, "/approve"), {
                                    method: 'PUT',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to approve trade');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); },
            /**
             * Cancel a trade.
             */
            cancel: function (tradeId) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!this.token)
                                throw new Error('Token is required');
                            return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/trades/").concat(tradeId, "/cancel"), {
                                    method: 'PUT',
                                    headers: { 'Authorization': "Bearer ".concat(this.token) }
                                })];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Failed to cancel trade');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        // --- SEARCH ---
        this.search = {
            /**
             * Global search across users, items, and games.
             */
            global: function (query) { return __awaiter(_this, void 0, void 0, function () {
                var res;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, fetch("".concat(croissantBaseUrl, "/search?q=").concat(encodeURIComponent(query)))];
                        case 1:
                            res = _a.sent();
                            if (!res.ok)
                                throw new Error('Search failed');
                            return [4 /*yield*/, res.json()];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            }); }
        };
        if (!params.token)
            throw new Error('Token is required');
        this.token = params.token;
    }
    return CroissantAPI;
}());
exports.CroissantAPI = CroissantAPI;
exports["default"] = CroissantAPI;
