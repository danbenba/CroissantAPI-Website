# Croissant API Client Library

A JavaScript/TypeScript client library for interacting with the Croissant API. This library provides a simple and typed interface for all Croissant platform features.

## 🚀 Installation

### Option 1: Direct Download

Download files from the Croissant website:
- [croissant-api.ts](https://croissant-api.fr/downloadables/croissant-api.ts) (TypeScript version)
- [croissant-api.js](https://croissant-api.fr/downloadables/croissant-api.js) (JavaScript version)

### Option 2: Direct Import

```typescript
import { CroissantAPI } from 'https://croissant-api.fr/downloadables/croissant-api.ts';
```

## 📋 Requirements

- **JavaScript/TypeScript**: ES2020+ or Node.js 14+
- **Environment**: Modern browser or Node.js with fetch API

## 🔧 Quick Start

### Initialization

```typescript
import { CroissantAPI } from './croissant-api';

// Without authentication (limited access)
const api = new CroissantAPI();

// With authentication token
const api = new CroissantAPI({ token: 'your_auth_token_here' });
```

### Basic Examples

```typescript
// Get games list
const games = await api.games.list();

// Search users
const users = await api.users.search('username');

// Get your profile (requires token)
const me = await api.users.getMe();

// Buy an item (requires token)
const result = await api.items.buy('item_id', 1);
```

## 📚 Module Documentation

### 👤 Users

```typescript
// Get your profile
const user = await api.users.getMe();

// Search users
const users = await api.users.search('John');

// Get user by ID
const user = await api.users.getUser('user_id');

// Transfer credits
const result = await api.users.transferCredits('target_user_id', 100);

// Verify a user
const result = await api.users.verify('user_id', 'verification_key');
```

### 🎮 Games

```typescript
// List all games
const games = await api.games.list();

// Search games
const games = await api.games.search('platformer');

// Get game by ID
const game = await api.games.get('game_id');

// Get my created games (requires token)
const myGames = await api.games.getMyCreatedGames();

// Get my owned games (requires token)
const ownedGames = await api.games.getMyOwnedGames();
```

### 🎒 Inventory

```typescript
// Get my inventory (requires token)
const inventory = await api.inventory.getMyInventory();

// Get user's inventory
const userInventory = await api.inventory.get('user_id');
```

### 🛍️ Items

```typescript
// List all items
const items = await api.items.list();

// Search items
const items = await api.items.search('sword');

// Get item by ID
const item = await api.items.get('item_id');

// Create an item (requires token)
const result = await api.items.create({
    name: 'Magic Sword',
    description: 'An enchanted sword',
    price: 100,
    iconHash: 'optional_icon_hash'
});

// Buy an item (requires token)
const result = await api.items.buy('item_id', 2);

// Sell an item (requires token)
const result = await api.items.sell('item_id', 1);

// Give an item to a user (requires token)
const result = await api.items.give('item_id', 1, 'target_user_id');

// Drop an item from inventory (requires token)
const result = await api.items.drop('item_id', { amount: 1 });
```

### 🏢 Studios

```typescript
// Create a studio (requires token)
const result = await api.studios.create('My Studio');

// Get studio by ID
const studio = await api.studios.get('studio_id');

// Get my studios (requires token)
const myStudios = await api.studios.getMyStudios();

// Add user to studio (requires token)
const result = await api.studios.addUser('studio_id', 'user_id');
```

### 🏛️ Lobbies

```typescript
// Create a lobby (requires token)
const result = await api.lobbies.create();

// Get lobby by ID
const lobby = await api.lobbies.get('lobby_id');

// Get my current lobby (requires token)
const myLobby = await api.lobbies.getMyLobby();

// Join a lobby (requires token)
const result = await api.lobbies.join('lobby_id');

// Leave a lobby (requires token)
const result = await api.lobbies.leave('lobby_id');
```

### 🔄 Trades

```typescript
// Start or get pending trade
const trade = await api.trades.startOrGetPending('user_id');

// Get trade by ID
const trade = await api.trades.get('trade_id');

// Add item to trade
const result = await api.trades.addItem('trade_id', {
    itemId: 'item_id',
    amount: 1,
    metadata: { custom: 'data' }
});

// Approve a trade
const result = await api.trades.approve('trade_id');

// Cancel a trade
const result = await api.trades.cancel('trade_id');
```

### 🔐 OAuth2

```typescript
// Create OAuth2 application (requires token)
const app = await api.oauth2.createApp('My App', ['https://example.com/callback']);

// Get my applications (requires token)
const apps = await api.oauth2.getMyApps();

// Authorize an application
const result = await api.oauth2.authorize('client_id', 'redirect_uri');
```

## 🎯 TypeScript Types

The library includes complete TypeScript types for all objects:

```typescript
interface User {
    userId: string;
    username: string;
    email?: string;
    verified: boolean;
    balance?: number;
    // ... other properties
}

interface Game {
    gameId: string;
    name: string;
    description: string;
    price: number;
    rating: number;
    // ... other properties
}

interface Item {
    itemId: string;
    name: string;
    description: string;
    price: number;
    iconHash: string;
    // ... other properties
}
```

## ⚠️ Error Handling

All methods can throw errors. It's recommended to use try/catch:

```typescript
try {
    const user = await api.users.getMe();
    console.log('Logged in user:', user.username);
} catch (error) {
    console.error('Error getting profile:', error.message);
}
```

Common errors:
- `Token is required` : Missing authentication token
- `User not found` : User not found
- `Item not found` : Item not found
- `Failed to [operation]` : Operation failed

## 🔑 Authentication

To get an authentication token:

1. **Via website**: Log in to [croissant-api.fr](https://croissant-api.fr) and get your token from settings
2. **Via OAuth2**: Use OAuth2 system for third-party applications
3. **Via API**: Use authentication endpoints (not covered by this library)

## 🌐 API Endpoints

Base URL: `https://croissant-api.fr/api`

The library wraps all the following endpoints:
- `/users/*` - User management
- `/games/*` - Game management
- `/items/*` - Item management
- `/inventory/*` - Inventory management
- `/lobbies/*` - Lobby management
- `/studios/*` - Studio management
- `/trades/*` - Trade management
- `/oauth2/*` - OAuth2 authentication

## 📖 Complete Examples

### Simple browsing application

```typescript
import { CroissantAPI } from './croissant-api';

const api = new CroissantAPI();

async function displayGames() {
    try {
        const games = await api.games.list();
        console.log(`${games.length} games found:`);
        
        games.forEach(game => {
            console.log(`- ${game.name} (${game.price} credits)`);
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

displayGames();
```

### Authenticated application

```typescript
import { CroissantAPI } from './croissant-api';

const api = new CroissantAPI({ token: 'your_token_here' });

async function buyItem(itemId: string, amount: number) {
    try {
        // Check balance
        const user = await api.users.getMe();
        const item = await api.items.get(itemId);
        
        const totalCost = item.price * amount;
        
        if (user.balance && user.balance >= totalCost) {
            const result = await api.items.buy(itemId, amount);
            console.log('Purchase successful:', result.message);
        } else {
            console.log('Insufficient balance');
        }
    } catch (error) {
        console.error('Purchase error:', error.message);
    }
}
```

## 📱 Usage in Different Environments

### Node.js

```typescript
// Make sure fetch is available
import fetch from 'node-fetch';
global.fetch = fetch;

import { CroissantAPI } from './croissant-api';
const api = new CroissantAPI({ token: process.env.CROISSANT_TOKEN });
```

### Browser (ES Modules)

```html
<script type="module">
    import { CroissantAPI } from './croissant-api.js';
    const api = new CroissantAPI({ token: localStorage.getItem('croissant_token') });
</script>
```

### React/Vue/Angular

```typescript
import { CroissantAPI } from './croissant-api';

// In your component
const api = new CroissantAPI({ token: userToken });

// Usage with async/await or hooks
useEffect(() => {
    api.games.list().then(setGames);
}, []);
```

## 🤝 Contributing

This library is maintained by the Croissant team. To report bugs or suggest improvements:

1. Visit [croissant-api.fr](https://croissant-api.fr)
2. Contact support via Discord
3. Create a ticket in the support system

## 📄 License

This library is provided under Croissant proprietary license. See terms of use on the official website.

## 🔗 Useful Links

- [Official Croissant Website](https://croissant-api.fr)
- [Complete API Documentation](https://croissant-api.fr/api-docs)
- [Community Discord](https://discord.gg/croissant)
- [API Status](https://status.croissant-api.fr)

---

*Last updated: July 2025*
*API Version: v1.0*
