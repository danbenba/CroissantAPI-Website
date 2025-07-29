# Practical Examples - Croissant API

This file contains concrete examples of using the Croissant API library for different use cases.

## 🎮 Examples for Game Developers

### 1. Game Authentication System

```typescript
import { CroissantAPI } from './croissant-api';

class GameAuth {
    private api: CroissantAPI;
    private currentUser: User | null = null;
    
    constructor() {
        this.api = new CroissantAPI();
    }
    
    // Login with token
    async login(token: string): Promise<User> {
        this.api = new CroissantAPI({ token });
        
        try {
            this.currentUser = await this.api.users.getMe();
            console.log(`Logged in as ${this.currentUser.username}`);
            return this.currentUser;
        } catch (error) {
            console.error('Login failed:', error.message);
            throw error;
        }
    }
    
    // Check if player owns a game
    async playerOwnsGame(gameId: string): Promise<boolean> {
        if (!this.currentUser) return false;
        
        try {
            const ownedGames = await this.api.games.getMyOwnedGames();
            return ownedGames.some(game => game.gameId === gameId);
        } catch (error) {
            console.error('Error checking game ownership:', error);
            return false;
        }
    }
    
    // Get player's inventory for a game
    async getPlayerInventory(): Promise<InventoryItem[]> {
        if (!this.currentUser) throw new Error('User not logged in');
        
        const inventory = await this.api.inventory.getMyInventory();
        return inventory.inventory;
    }
}

// Usage
const gameAuth = new GameAuth();
const user = await gameAuth.login('player_token');
const hasGame = await gameAuth.playerOwnsGame('my-game-id');
if (hasGame) {
    const inventory = await gameAuth.getPlayerInventory();
    console.log(`Player has ${inventory.length} items`);
}
```

### 2. In-Game Rewards System

```typescript
class GameRewards {
    constructor(private api: CroissantAPI) {}
    
    // Give a reward to a player
    async giveReward(playerId: string, itemId: string, amount: number, reason: string): Promise<void> {
        try {
            const result = await this.api.items.give(itemId, amount, playerId, {
                reason,
                timestamp: Date.now(),
                source: 'game_reward'
            });
            
            console.log(`Reward given: ${result.message}`);
        } catch (error) {
            console.error('Failed to give reward:', error);
            throw error;
        }
    }
    
    // Create a unique reward item
    async createUniqueReward(name: string, description: string, iconHash?: string): Promise<string> {
        const item = await this.api.items.create({
            name,
            description,
            price: 0, // Free since it's a reward
            showInStore: false, // Not visible in the store
            iconHash
        });
        
        console.log('Reward item created:', item.message);
        return item.itemId; // Assuming the API returns the ID
    }
    
    // Consume an item (use a consumable)
    async useConsumable(playerId: string, itemId: string): Promise<boolean> {
        try {
            await this.api.items.consume(itemId, {
                userId: playerId,
                amount: 1
            });
            return true;
        } catch (error) {
            console.error('Unable to consume item:', error);
            return false;
        }
    }
}

// Usage
const rewards = new GameRewards(api);

// Give a reward for an achievement
await rewards.giveReward(
    'player-123', 
    'achievement-sword', 
    1, 
    'Completed level 10'
);

// Create a special reward
const specialItemId = await rewards.createUniqueReward(
    'Legendary Sword',
    'A sword obtained by defeating the final boss',
    'legendary-sword-icon'
);
```

### 3. In-Game Store System

```typescript
class GameStore {
    constructor(private api: CroissantAPI) {}
    
    // Display items available for purchase
    async getStoreItems(): Promise<Item[]> {
        const allItems = await this.api.items.list();
        return allItems.filter(item => item.showInStore && item.price > 0);
    }
    
    // Purchase an item with balance verification
    async purchaseItem(itemId: string, quantity: number): Promise<boolean> {
        try {
            // Check player's balance
            const user = await this.api.users.getMe();
            const item = await this.api.items.get(itemId);
            
            const totalCost = item.price * quantity;
            
            if (!user.balance || user.balance < totalCost) {
                console.log(`Insufficient balance: ${user.balance} < ${totalCost}`);
                return false;
            }
            
            // Proceed with the purchase
            const result = await this.api.items.buy(itemId, quantity);
            console.log('Purchase successful:', result.message);
            return true;
            
        } catch (error) {
            console.error('Purchase error:', error);
            return false;
        }
    }
    
    // Sell an item from inventory
    async sellItem(itemId: string, quantity: number): Promise<boolean> {
        try {
            // Check that the player owns the item
            const inventory = await this.api.inventory.getMyInventory();
            const inventoryItem = inventory.inventory.find(item => item.itemId === itemId);
            
            if (!inventoryItem || inventoryItem.amount < quantity) {
                console.log('Insufficient quantity in inventory');
                return false;
            }
            
            const result = await this.api.items.sell(itemId, quantity);
            console.log('Sale successful:', result.message);
            return true;
            
        } catch (error) {
            console.error('Sale error:', error);
            return false;
        }
    }
}
```

## 🌐 Examples for Web Applications

### 1. React User Profile Component

```tsx
import React, { useState, useEffect } from 'react';
import { CroissantAPI, User } from './croissant-api';

interface UserProfileProps {
    token: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ token }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const api = new CroissantAPI({ token });
    
    useEffect(() => {
        loadUserProfile();
    }, [token]);
    
    const loadUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const userData = await api.users.getMe();
            setUser(userData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };
    
    const handleTransferCredits = async (targetUserId: string, amount: number) => {
        try {
            await api.users.transferCredits(targetUserId, amount);
            await loadUserProfile(); // Reload profile to update balance
            alert('Transfer successful!');
        } catch (err) {
            alert('Transfer error: ' + err.message);
        }
    };
    
    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">Error: {error}</div>;
    if (!user) return <div>No user found</div>;
    
    return (
        <div className="user-profile">
            <div className="avatar">
                {user.steam_avatar_url && (
                    <img src={user.steam_avatar_url} alt="Avatar" />
                )}
            </div>
            
            <div className="info">
                <h2>{user.username}</h2>
                {user.verified && <span className="verified">✓ Verified</span>}
                <p>Balance: {user.balance || 0} credits</p>
                
                {user.steam_username && (
                    <p>Steam: {user.steam_username}</p>
                )}
            </div>
            
            <div className="actions">
                <button onClick={() => {
                    const target = prompt('Target user ID:');
                    const amount = parseInt(prompt('Amount:') || '0');
                    if (target && amount > 0) {
                        handleTransferCredits(target, amount);
                    }
                }}>
                    Transfer Credits
                </button>
            </div>
        </div>
    );
};
```

### 2. Game Catalog with Search

```tsx
import React, { useState, useEffect } from 'react';
import { CroissantAPI, Game } from './croissant-api';

const GameCatalog: React.FC = () => {
    const [games, setGames] = useState<Game[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedGenre, setSelectedGenre] = useState<string>('');
    
    const api = new CroissantAPI();
    
    useEffect(() => {
        loadGames();
    }, []);
    
    const loadGames = async () => {
        setLoading(true);
        try {
            const gameList = await api.games.list();
            setGames(gameList);
        } catch (error) {
            console.error('Error loading games:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadGames();
            return;
        }
        
        setLoading(true);
        try {
            const results = await api.games.search(searchQuery);
            setGames(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const filteredGames = selectedGenre 
        ? games.filter(game => game.genre === selectedGenre)
        : games;
    
    const genres = [...new Set(games.map(game => game.genre).filter(Boolean))];
    
    return (
        <div className="game-catalog">
            <div className="search-controls">
                <input
                    type="text"
                    placeholder="Search games..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button onClick={handleSearch}>Search</button>
                
                <select 
                    value={selectedGenre} 
                    onChange={(e) => setSelectedGenre(e.target.value)}
                >
                    <option value="">All genres</option>
                    {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
            </div>
            
            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <div className="game-grid">
                    {filteredGames.map(game => (
                        <GameCard key={game.gameId} game={game} />
                    ))}
                </div>
            )}
        </div>
    );
};

const GameCard: React.FC<{ game: Game }> = ({ game }) => {
    const iconUrl = game.iconHash 
        ? `https://croissant-api.fr/cdn/icons/${game.iconHash}`
        : '/default-game-icon.png';
    
    return (
        <div className="game-card">
            <img src={iconUrl} alt={game.name} className="game-icon" />
            <h3>{game.name}</h3>
            <p className="description">{game.description}</p>
            <div className="game-info">
                <span className="price">{game.price} credits</span>
                <span className="rating">⭐ {game.rating}/5</span>
                {game.multiplayer && <span className="multiplayer">🎮 Multiplayer</span>}
            </div>
            {game.genre && <span className="genre">{game.genre}</span>}
        </div>
    );
};
```

### 3. Trading/Exchange System

```typescript
class TradingSystem {
    constructor(private api: CroissantAPI) {}
    
    // Start a trade with another player
    async startTrade(otherPlayerId: string): Promise<Trade> {
        try {
            const trade = await this.api.trades.startOrGetPending(otherPlayerId);
            console.log(`Trade initiated with ${otherPlayerId}:`, trade.id);
            return trade;
        } catch (error) {
            console.error('Error starting trade:', error);
            throw error;
        }
    }
    
    // Add an item to a trade
    async addItemToTrade(tradeId: string, itemId: string, amount: number): Promise<void> {
        try {
            await this.api.trades.addItem(tradeId, {
                itemId,
                amount,
                metadata: { addedAt: Date.now() }
            });
            console.log(`Item ${itemId} added to trade`);
        } catch (error) {
            console.error('Error adding item:', error);
            throw error;
        }
    }
    
    // Approve a trade
    async approveTrade(tradeId: string): Promise<void> {
        try {
            await this.api.trades.approve(tradeId);
            console.log('Trade approved');
        } catch (error) {
            console.error('Error approving trade:', error);
            throw error;
        }
    }
    
    // Get a player's ongoing trades
    async getPlayerTrades(playerId: string): Promise<Trade[]> {
        return await this.api.trades.getUserTrades(playerId);
    }
    
    // Complete trade interface
    async manageTrade(otherPlayerId: string, myItems: {itemId: string, amount: number}[]) {
        try {
            // Start the trade
            const trade = await this.startTrade(otherPlayerId);
            
            // Add all items
            for (const item of myItems) {
                await this.addItemToTrade(trade.id, item.itemId, item.amount);
            }
            
            console.log('Trade configured. Waiting for the other player...');
            return trade.id;
            
        } catch (error) {
            console.error('Error managing trade:', error);
            throw error;
        }
    }
}
```

## 🏢 Examples for Enterprise Applications

### 1. Administrator Dashboard

```typescript
class AdminDashboard {
    constructor(private api: CroissantAPI) {}
    
    // Global statistics
    async getGlobalStats(): Promise<{
        totalUsers: number;
        totalGames: number;
        totalItems: number;
        recentActivity: any[];
    }> {
        try {
            const [users, games, items] = await Promise.all([
                this.api.users.search(''), // Gets all users
                this.api.games.list(),
                this.api.items.list()
            ]);
            
            return {
                totalUsers: users.length,
                totalGames: games.length,
                totalItems: items.length,
                recentActivity: [] // Implement as needed
            };
        } catch (error) {
            console.error('Error fetching stats:', error);
            throw error;
        }
    }
    
    // User management
    async moderateUser(userId: string, action: 'verify' | 'disable'): Promise<void> {
        try {
            switch (action) {
                case 'verify':
                    // Administrative verification logic
                    console.log(`User ${userId} verified by admin`);
                    break;
                case 'disable':
                    // Deactivation logic
                    console.log(`User ${userId} disabled`);
                    break;
            }
        } catch (error) {
            console.error(`Error ${action} on user:`, error);
            throw error;
        }
    }
    
    // Reports and analytics
    async generateReport(type: 'users' | 'games' | 'items'): Promise<any> {
        try {
            switch (type) {
                case 'users':
                    const users = await this.api.users.search('');
                    return {
                        total: users.length,
                        verified: users.filter(u => u.verified).length,
                        withBalance: users.filter(u => u.balance && u.balance > 0).length
                    };
                    
                case 'games':
                    const games = await this.api.games.list();
                    return {
                        total: games.length,
                        byGenre: this.groupBy(games, 'genre'),
                        averageRating: games.reduce((sum, g) => sum + g.rating, 0) / games.length
                    };
                    
                case 'items':
                    const items = await this.api.items.list();
                    return {
                        total: items.length,
                        inStore: items.filter(i => i.showInStore).length,
                        totalValue: items.reduce((sum, i) => sum + i.price, 0)
                    };
            }
        } catch (error) {
            console.error(`Error generating ${type} report:`, error);
            throw error;
        }
    }
    
    private groupBy<T>(array: T[], key: keyof T): Record<string, number> {
        return array.reduce((groups, item) => {
            const value = String(item[key] || 'Unknown');
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {} as Record<string, number>);
    }
}
```

### 2. Development Studio System

```typescript
class StudioManager {
    constructor(private api: CroissantAPI) {}
    
    // Create a new studio
    async createStudio(name: string): Promise<string> {
        try {
            const result = await this.api.studios.create(name);
            console.log('Studio created:', result.message);
            return name; // Assuming the API returns the ID
        } catch (error) {
            console.error('Error creating studio:', error);
            throw error;
        }
    }
    
    // Manage studio members
    async addDeveloper(studioId: string, userId: string): Promise<void> {
        try {
            await this.api.studios.addUser(studioId, userId);
            console.log(`Developer ${userId} added to studio ${studioId}`);
        } catch (error) {
            console.error('Error adding developer:', error);
            throw error;
        }
    }
    
    // Get studio statistics
    async getStudioStats(studioId: string): Promise<{
        members: number;
        games: Game[];
        totalRevenue: number;
    }> {
        try {
            const studio = await this.api.studios.get(studioId);
            const games = await this.api.games.getMyCreatedGames();
            
            return {
                members: studio.users?.length || 0,
                games: games,
                totalRevenue: games.reduce((sum, game) => sum + (game.price || 0), 0)
            };
        } catch (error) {
            console.error('Error getting studio stats:', error);
            throw error;
        }
    }
    
    // Publish a game on behalf of the studio
    async publishGame(gameData: {
        name: string;
        description: string;
        price: number;
        genre?: string;
    }): Promise<void> {
        try {
            // Game publishing logic
            console.log('Game published:', gameData.name);
        } catch (error) {
            console.error('Error publishing game:', error);
            throw error;
        }
    }
}
```

## 🔧 Utility Examples

### 1. Cache with Expiration

```typescript
class CroissantAPICache {
    private cache = new Map<string, { data: any; expires: number }>();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes
    
    constructor(private api: CroissantAPI) {}
    
    private getCacheKey(method: string, params: any[] = []): string {
        return `${method}:${JSON.stringify(params)}`;
    }
    
    private isExpired(expires: number): boolean {
        return Date.now() > expires;
    }
    
    async getCachedOrFetch<T>(
        method: string,
        fetcher: () => Promise<T>,
        ttl: number = this.defaultTTL,
        ...params: any[]
    ): Promise<T> {
        const cacheKey = this.getCacheKey(method, params);
        const cached = this.cache.get(cacheKey);
        
        if (cached && !this.isExpired(cached.expires)) {
            return cached.data;
        }
        
        const data = await fetcher();
        this.cache.set(cacheKey, {
            data,
            expires: Date.now() + ttl
        });
        
        return data;
    }
    
    // Methods with automatic caching
    async getGamesCached(): Promise<Game[]> {
        return this.getCachedOrFetch('games.list', () => this.api.games.list());
    }
    
    async getUserCached(userId: string): Promise<User> {
        return this.getCachedOrFetch(
            'users.getUser',
            () => this.api.users.getUser(userId),
            this.defaultTTL,
            userId
        );
    }
    
    clearCache(): void {
        this.cache.clear();
    }
}
```

### 2. Rate limiter

```typescript
class RateLimitedAPI {
    private requestQueue: Array<{
        request: () => Promise<any>;
        resolve: (value: any) => void;
        reject: (error: any) => void;
    }> = [];
    
    private isProcessing = false;
    private lastRequestTime = 0;
    private minInterval = 100; // 100ms between requests
    
    constructor(private api: CroissantAPI) {}
    
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.requestQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.requestQueue.length > 0) {
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequestTime;
            
            if (timeSinceLastRequest < this.minInterval) {
                await new Promise(resolve => 
                    setTimeout(resolve, this.minInterval - timeSinceLastRequest)
                );
            }
            
            const { request, resolve, reject } = this.requestQueue.shift()!;
            
            try {
                const result = await request();
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            this.lastRequestTime = Date.now();
        }
        
        this.isProcessing = false;
    }
    
    private enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ request, resolve, reject });
            this.processQueue();
        });
    }
    
    // Methods with rate limiting
    async getGames(): Promise<Game[]> {
        return this.enqueueRequest(() => this.api.games.list());
    }
    
    async getUser(userId: string): Promise<User> {
        return this.enqueueRequest(() => this.api.users.getUser(userId));
    }
}
```

### 3. Data Validation and Transformation

```typescript
class SafeCroissantAPI {
    constructor(private api: CroissantAPI) {}
    
    // ID validation
    private validateId(id: string, type: string): void {
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
            throw new Error(`Invalid ${type} ID: ${id}`);
        }
    }
    
    // Amount validation
    private validateAmount(amount: number): void {
        if (!Number.isInteger(amount) || amount <= 0) {
            throw new Error(`Invalid amount: ${amount}`);
        }
    }
    
    // Safe methods
    async buyItemSafely(itemId: string, amount: number): Promise<{ success: boolean; message: string }> {
        try {
            this.validateId(itemId, 'item');
            this.validateAmount(amount);
            
            // Pre-verification
            const item = await this.api.items.get(itemId);
            const user = await this.api.users.getMe();
            
            const totalCost = item.price * amount;
            
            if (!user.balance || user.balance < totalCost) {
                return {
                    success: false,
                    message: `Insufficient balance. Cost: ${totalCost}, Balance: ${user.balance || 0}`
                };
            }
            
            const result = await this.api.items.buy(itemId, amount);
            return { success: true, message: result.message };
            
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    
    async transferCreditsSafely(targetUserId: string, amount: number): Promise<{ success: boolean; message: string }> {
        try {
            this.validateId(targetUserId, 'user');
            this.validateAmount(amount);
            
            // Check that target user exists
            await this.api.users.getUser(targetUserId);
            
            // Check balance
            const user = await this.api.users.getMe();
            if (!user.balance || user.balance < amount) {
                return {
                    success: false,
                    message: `Insufficient balance for transfer`
                };
            }
            
            const result = await this.api.users.transferCredits(targetUserId, amount);
            return { success: true, message: result.message };
            
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
}
```

---

These examples cover the most common use cases of the Croissant API library. They can be adapted according to your application's specific needs.
