const croissantBaseUrl = 'https://croissant-api.fr/api';

/**
 * Represents a game in the Croissant API.
 */
export interface Game {
    gameId: string;
    name: string;
    description: string;
    owner_id: string;
    download_link?: string | null;
    price: number;
    showInStore: boolean;
    iconHash?: string | null;
    splashHash?: string | null;
    bannerHash?: string | null;
    genre?: string | null;
    release_date?: string | null;
    developer?: string | null;
    publisher?: string | null;
    platforms?: string | null;
    rating: number;
    website?: string | null;
    trailer_link?: string | null;
    multiplayer: boolean;
}

/**
 * Represents a user in the Croissant API.
 */
export interface User {
    userId: string;
    username: string;
    email: string;
    balance?: number;
    verified: boolean;
    steam_id?: string;
    steam_username?: string;
    steam_avatar_url?: string;
    isStudio: boolean;
    admin: boolean;
    disabled?: boolean;
    google_id?: string;
    discord_id?: string;
    studios?: Studio[];
    roles?: string[];
    inventory?: InventoryItem[];
    ownedItems?: Item[];
    createdGames?: Game[];
    haveAuthenticator?: boolean;
    verificationKey?: string;
}

/**
 * Represents an item in the Croissant API.
 */
export interface Item {
    itemId: string;
    name: string;
    description: string;
    price: number;
    owner: string;
    showInStore: boolean;
    iconHash: string;
    deleted: boolean;
}

/**
 * Represents an item in a user's inventory.
 */
export interface InventoryItem {
    itemId: string;
    name: string;
    description: string;
    amount: number;
    iconHash?: string;
}

/**
 * Represents a lobby.
 */
export interface Lobby {
    lobbyId: string;
    users: Array<{
        username: string;
        user_id: string;
        verified: boolean;
        steam_username?: string;
        steam_avatar_url?: string;
        steam_id?: string;
    }>;
}

/**
 * Represents a studio.
 */
export interface Studio {
    user_id: string;
    username: string;
    verified: boolean;
    admin_id: string;
    isAdmin?: boolean;
    apiKey?: string;
    users?: Array<{
        user_id: string;
        username: string;
        verified: boolean;
        admin: boolean;
    }>;
}

/**
 * Represents a trade item.
 */
export interface TradeItem {
    itemId: string;
    amount: number;
}

/**
 * Represents a trade with enriched item information.
 */
export interface Trade {
    id: string;
    fromUserId: string;
    toUserId: string;
    fromUserItems: Array<{
        itemId: string;
        name: string;
        description: string;
        iconHash: string;
        amount: number;
    }>;
    toUserItems: Array<{
        itemId: string;
        name: string;
        description: string;
        iconHash: string;
        amount: number;
    }>;
    approvedFromUser: boolean;
    approvedToUser: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Represents an OAuth2 app.
 */
export interface OAuth2App {
    client_id: string;
    client_secret: string;
    name: string;
    redirect_urls: string[];
}

/**
 * CroissantAPI provides methods to interact with the Croissant API.
 */
class CroissantAPI {
    private token: string;

    constructor(params: { token: string }) {
        if (!params.token) throw new Error('Token is required');
        this.token = params.token;
    }

    // --- USERS ---
    users = {
        /**
         * Get the current authenticated user's profile, including studios, roles, inventory, owned items, and created games.
         */
        getMe: async (): Promise<User> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/users/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch user');
            return await res.json();
        },

        /**
         * Get a user by userId. userId can be a Croissant ID, Discord ID, Google ID or Steam ID.
         */
        getUser: async (userId: string): Promise<User> => {
            const res = await fetch(`${croissantBaseUrl}/users/${userId}`);
            if (!res.ok) throw new Error('User not found');
            return await res.json();
        },

        /**
         * Search for users by username.
         */
        search: async (query: string): Promise<User[]> => {
            const res = await fetch(`${croissantBaseUrl}/users/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Check the verification key for the user.
         */
        verify: async (userId: string, verificationKey: string): Promise<{ success: boolean }> => {
            const res = await fetch(`${croissantBaseUrl}/users/auth-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, verificationKey })
            });
            if (!res.ok) return { success: false };
            return await res.json();
        },

        /**
         * Transfer credits from one user to another.
         */
        transferCredits: async (targetUserId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/users/transfer-credits`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ targetUserId, amount })
            });
            if (!res.ok) throw new Error('Failed to transfer credits');
            return await res.json();
        },

        /**
         * Change username (authenticated user only).
         */
        changeUsername: async (username: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/users/change-username`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ username })
            });
            if (!res.ok) throw new Error('Failed to change username');
            return await res.json();
        },

        /**
         * Change password (authenticated user only).
         */
        changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
            });
            if (!res.ok) throw new Error('Failed to change password');
            return await res.json();
        }
    };

    // --- GAMES ---
    games = {
        /**
         * List all games visible in the store.
         */
        list: async (): Promise<Game[]> => {
            const res = await fetch(`${croissantBaseUrl}/games`);
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Search for games by name, genre, or description.
         */
        search: async (query: string): Promise<Game[]> => {
            const res = await fetch(`${croissantBaseUrl}/games/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Get all games created by the authenticated user.
         */
        getMyCreatedGames: async (): Promise<Game[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games/@mine`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Get all games owned by the authenticated user.
         */
        getMyOwnedGames: async (): Promise<Game[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games/list/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Get a game by gameId.
         */
        get: async (gameId: string): Promise<Game> => {
            const res = await fetch(`${croissantBaseUrl}/games/${gameId}`);
            if (!res.ok) throw new Error('Game not found');
            return await res.json();
        },

        /**
         * Create a new game.
         */
        create: async (gameData: Partial<Game>): Promise<{ message: string; game: Game }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(gameData)
            });
            if (!res.ok) throw new Error('Failed to create game');
            return await res.json();
        },

        /**
         * Update an existing game.
         */
        update: async (gameId: string, gameData: Partial<Game>): Promise<Game> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games/${gameId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(gameData)
            });
            if (!res.ok) throw new Error('Failed to update game');
            return await res.json();
        },

        /**
         * Buy a game.
         */
        buy: async (gameId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/games/${gameId}/buy`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to buy game');
            return await res.json();
        }
    };

    // --- ITEMS ---
    items = {
        /**
         * Get all non-deleted items visible in store.
         */
        list: async (): Promise<Item[]> => {
            const res = await fetch(`${croissantBaseUrl}/items`);
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Get all items owned by the authenticated user.
         */
        getMyItems: async (): Promise<Item[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/@mine`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Search for items by name (only those visible in store).
         */
        search: async (query: string): Promise<Item[]> => {
            const res = await fetch(`${croissantBaseUrl}/items/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) return [];
            return await res.json();
        },

        /**
         * Get a single item by itemId.
         */
        get: async (itemId: string): Promise<Item> => {
            const res = await fetch(`${croissantBaseUrl}/items/${itemId}`);
            if (!res.ok) throw new Error('Item not found');
            return await res.json();
        },

        /**
         * Create a new item.
         */
        create: async (itemData: {
            name: string;
            description: string;
            price: number;
            iconHash?: string;
            showInStore?: boolean;
        }): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(itemData)
            });
            if (!res.ok) throw new Error('Failed to create item');
            return await res.json();
        },

        /**
         * Update an existing item.
         */
        update: async (itemId: string, itemData: Partial<Item>): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/update/${itemId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify(itemData)
            });
            if (!res.ok) throw new Error('Failed to update item');
            return await res.json();
        },

        /**
         * Delete an item.
         */
        delete: async (itemId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/delete/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to delete item');
            return await res.json();
        },

        /**
         * Buy an item.
         */
        buy: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/buy/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to buy item');
            return await res.json();
        },

        /**
         * Sell an item.
         */
        sell: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/sell/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to sell item');
            return await res.json();
        },

        /**
         * Give item occurrences to a user (owner only).
         */
        give: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/give/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to give item');
            return await res.json();
        },

        /**
         * Consume item occurrences from a user (owner only).
         */
        consume: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/consume/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to consume item');
            return await res.json();
        },

        /**
         * Drop item occurrences from your inventory.
         */
        drop: async (itemId: string, amount: number): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/items/drop/${itemId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ amount })
            });
            if (!res.ok) throw new Error('Failed to drop item');
            return await res.json();
        }
    };

    // --- INVENTORY ---
    inventory = {
        /**
         * Get the inventory of the authenticated user.
         */
        getMyInventory: async (): Promise<InventoryItem[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/inventory/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return await res.json();
        },

        /**
         * Get the inventory of a user.
         */
        get: async (userId: string): Promise<InventoryItem[]> => {
            const res = await fetch(`${croissantBaseUrl}/inventory/${userId}`);
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return await res.json();
        }
    };

    // --- LOBBIES ---
    lobbies = {
        /**
         * Create a new lobby.
         */
        create: async (): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to create lobby');
            return await res.json();
        },

        /**
         * Get a lobby by lobbyId.
         */
        get: async (lobbyId: string): Promise<Lobby> => {
            const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}`);
            if (!res.ok) throw new Error('Lobby not found');
            return await res.json();
        },

        /**
         * Get the lobby the authenticated user is in.
         */
        getMyLobby: async (): Promise<Lobby> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies/user/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('User not in any lobby');
            return await res.json();
        },

        /**
         * Get the lobby a user is in.
         */
        getUserLobby: async (userId: string): Promise<Lobby> => {
            const res = await fetch(`${croissantBaseUrl}/lobbies/user/${userId}`);
            if (!res.ok) throw new Error('User not in any lobby');
            return await res.json();
        },

        /**
         * Join a lobby.
         */
        join: async (lobbyId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}/join`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to join lobby');
            return await res.json();
        },

        /**
         * Leave a lobby.
         */
        leave: async (lobbyId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/lobbies/${lobbyId}/leave`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to leave lobby');
            return await res.json();
        }
    };

    // --- STUDIOS ---
    studios = {
        /**
         * Create a new studio.
         */
        create: async (studioName: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ studioName })
            });
            if (!res.ok) throw new Error('Failed to create studio');
            return await res.json();
        },

        /**
         * Get a studio by studioId.
         */
        get: async (studioId: string): Promise<Studio> => {
            const res = await fetch(`${croissantBaseUrl}/studios/${studioId}`);
            if (!res.ok) throw new Error('Studio not found');
            return await res.json();
        },

        /**
         * Get all studios the authenticated user is part of.
         */
        getMyStudios: async (): Promise<Studio[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios/user/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch studios');
            return await res.json();
        },

        /**
         * Add a user to a studio.
         */
        addUser: async (studioId: string, userId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios/${studioId}/add-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to add user to studio');
            return await res.json();
        },

        /**
         * Remove a user from a studio.
         */
        removeUser: async (studioId: string, userId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/studios/${studioId}/remove-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ userId })
            });
            if (!res.ok) throw new Error('Failed to remove user from studio');
            return await res.json();
        }
    };

    // --- TRADES ---
    trades = {
        /**
         * Start a new trade or get the latest pending trade with a user.
         */
        startOrGetPending: async (userId: string): Promise<Trade> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/start-or-latest/${userId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to start or get trade');
            return await res.json();
        },

        /**
         * Get a trade by ID with enriched item information.
         */
        get: async (tradeId: string): Promise<Trade> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Trade not found');
            return await res.json();
        },

        /**
         * Get all trades for a user with enriched item information.
         */
        getMyTrades: async (): Promise<Trade[]> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/user/@me`, {
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch trades');
            return await res.json();
        },

        /**
         * Add an item to a trade.
         */
        addItem: async (tradeId: string, tradeItem: TradeItem): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/add-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ tradeItem })
            });
            if (!res.ok) throw new Error('Failed to add item to trade');
            return await res.json();
        },

        /**
         * Remove an item from a trade.
         */
        removeItem: async (tradeId: string, tradeItem: TradeItem): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/remove-item`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ tradeItem })
            });
            if (!res.ok) throw new Error('Failed to remove item from trade');
            return await res.json();
        },

        /**
         * Approve a trade.
         */
        approve: async (tradeId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to approve trade');
            return await res.json();
        },

        /**
         * Cancel a trade.
         */
        cancel: async (tradeId: string): Promise<{ message: string }> => {
            if (!this.token) throw new Error('Token is required');
            const res = await fetch(`${croissantBaseUrl}/trades/${tradeId}/cancel`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.token}` }
            });
            if (!res.ok) throw new Error('Failed to cancel trade');
            return await res.json();
        }
    };

    // --- SEARCH ---
    search = {
        /**
         * Global search across users, items, and games.
         */
        global: async (query: string): Promise<{
            users: User[];
            items: Item[];
            games: Game[];
        }> => {
            const res = await fetch(`${croissantBaseUrl}/search?q=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Search failed');
            return await res.json();
        }
    };
}

export {
    CroissantAPI,
    CroissantAPI as default
};