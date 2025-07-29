# Croissant API Python Client Library

A Python client library for interacting with the Croissant API. This library provides a simple and typed interface for all Croissant platform features with full dataclass support.

## 🚀 Installation

### Option 1: Direct Download

Download the file from the Croissant website:
- [croissant_api.py](https://croissant-api.fr/downloadables/sdk-python/croissant_api.py) (Python version)

### Option 2: Direct Import

```python
import urllib.request
urllib.request.urlretrieve('https://croissant-api.fr/downloadables/sdk-python/croissant_api.py', 'croissant_api.py')
from croissant_api import CroissantAPI
```

## 📋 Requirements

- **Python**: 3.7+
- **Dependencies**: `requests` (automatically installed with pip)
- **Environment**: Any Python environment

## 🔧 Quick Start

### Installation of Dependencies

```bash
pip install requests
```

### Initialization

```python
from croissant_api import CroissantAPI

# Without authentication (limited access)
api = CroissantAPI()

# With authentication token
api = CroissantAPI(token='your_auth_token_here')
```

### Basic Examples

```python
# Get games list
games = api.list_games()

# Search users
users = api.search_users('username')

# Get your profile (requires token)
me = api.get_me()

# Buy an item (requires token)
result = api.buy_item('item_id', 1)
```

## 📚 Method Documentation

### 👤 Users

```python
# Get your profile
user = api.get_me()

# Search users
users = api.search_users('John')

# Get user by ID
user = api.get_user('user_id')

# Transfer credits
result = api.transfer_credits('target_user_id', 100)

# Verify a user
result = api.verify_user('user_id', 'verification_key')
```

### 🎮 Games

```python
# List all games
games = api.list_games()

# Search games
games = api.search_games('platformer')

# Get game by ID
game = api.get_game('game_id')

# Get my created games (requires token)
my_games = api.get_my_created_games()

# Get my owned games (requires token)
owned_games = api.get_my_owned_games()
```

### 🎒 Inventory

```python
# Get my inventory (requires token)
inventory = api.get_my_inventory()

# Get user's inventory
user_inventory = api.get_inventory('user_id')
```

### 🛍️ Items

```python
# List all items
items = api.list_items()

# Search items
items = api.search_items('sword')

# Get item by ID
item = api.get_item('item_id')

# Get my items (requires token)
my_items = api.get_my_items()

# Create an item (requires token)
result = api.create_item({
    'name': 'Magic Sword',
    'description': 'An enchanted sword',
    'price': 100,
    'iconHash': 'optional_icon_hash'
})

# Update an item (requires token)
result = api.update_item('item_id', {
    'name': 'Updated Magic Sword',
    'price': 150
})

# Buy an item (requires token)
result = api.buy_item('item_id', 2)

# Sell an item (requires token)
result = api.sell_item('item_id', 1)

# Give an item to a user (requires token)
result = api.give_item('item_id', 1, 'target_user_id', metadata={'custom': 'data'})

# Consume an item (requires token)
result = api.consume_item('item_id', {'amount': 1})

# Update item metadata (requires token)
result = api.update_item_metadata('item_id', 'unique_id', {'level': 5})

# Drop an item from inventory (requires token)
result = api.drop_item('item_id', {'amount': 1})

# Delete an item (requires token)
result = api.delete_item('item_id')
```

### 🏢 Studios

```python
# Create a studio (requires token)
result = api.create_studio('My Studio')

# Get studio by ID
studio = api.get_studio('studio_id')

# Get my studios (requires token)
my_studios = api.get_my_studios()

# Add user to studio (requires token)
result = api.add_user_to_studio('studio_id', 'user_id')

# Remove user from studio (requires token)
result = api.remove_user_from_studio('studio_id', 'user_id')
```

### 🏛️ Lobbies

```python
# Create a lobby (requires token)
result = api.create_lobby()

# Get lobby by ID
lobby = api.get_lobby('lobby_id')

# Get my current lobby (requires token)
my_lobby = api.get_my_lobby()

# Get user's lobby
user_lobby = api.get_user_lobby('user_id')

# Join a lobby (requires token)
result = api.join_lobby('lobby_id')

# Leave a lobby (requires token)
result = api.leave_lobby('lobby_id')
```

### 🔄 Trades

```python
# Start or get pending trade
trade = api.start_or_get_pending_trade('user_id')

# Get trade by ID
trade = api.get_trade('trade_id')

# Get user's trades
trades = api.get_user_trades('user_id')

# Add item to trade
result = api.add_item_to_trade('trade_id', {
    'itemId': 'item_id',
    'amount': 1,
    'metadata': {'custom': 'data'}
})

# Remove item from trade
result = api.remove_item_from_trade('trade_id', {
    'itemId': 'item_id',
    'amount': 1
})

# Approve a trade
result = api.approve_trade('trade_id')

# Cancel a trade
result = api.cancel_trade('trade_id')
```

### 🔐 OAuth2

```python
# Get OAuth2 application
app = api.get_oauth2_app('client_id')

# Create OAuth2 application (requires token)
app = api.create_oauth2_app('My App', ['https://example.com/callback'])

# Get my applications (requires token)
apps = api.get_my_oauth2_apps()

# Update OAuth2 application (requires token)
result = api.update_oauth2_app('client_id', {'name': 'Updated App Name'})

# Delete OAuth2 application (requires token)
result = api.delete_oauth2_app('client_id')

# Authorize an application (requires token)
result = api.authorize('client_id', 'redirect_uri')

# Get user by OAuth2 code
user = api.get_user_by_code('code', 'client_id')
```

## 🎯 Python Dataclasses

The library includes complete Python dataclasses for all objects:

```python
@dataclass
class User:
    userId: str
    username: str
    email: Optional[str] = None
    verified: bool = False
    balance: Optional[float] = None
    # ... other properties

@dataclass
class Game:
    gameId: str
    name: str
    description: str
    price: float
    rating: float = 0.0
    # ... other properties

@dataclass
class Item:
    itemId: str
    name: str
    description: str
    price: float
    iconHash: str
    # ... other properties

@dataclass
class Trade:
    id: str
    fromUserId: str
    toUserId: str
    fromUserItems: List[dict]
    toUserItems: List[dict]
    status: str
    # ... other properties
```

## ⚠️ Error Handling

All methods can raise exceptions. It's recommended to use try/except:

```python
try:
    user = api.get_me()
    print(f'Logged in user: {user.username}')
except Exception as error:
    print(f'Error getting profile: {error}')
```

Common errors:
- `Token is required` : Missing authentication token
- `User not found` : User not found
- `Item not found` : Item not found
- HTTP errors from `requests.HTTPError`

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

```python
from croissant_api import CroissantAPI

api = CroissantAPI()

def display_games():
    try:
        games = api.list_games()
        print(f'{len(games)} games found:')
        
        for game in games:
            print(f'- {game.name} ({game.price} credits)')
    except Exception as error:
        print(f'Error: {error}')

display_games()
```

### Authenticated application

```python
from croissant_api import CroissantAPI

api = CroissantAPI(token='your_token_here')

def buy_item(item_id: str, amount: int):
    try:
        # Check balance
        user = api.get_me()
        item = api.get_item(item_id)
        
        total_cost = item.price * amount
        
        if user.balance and user.balance >= total_cost:
            result = api.buy_item(item_id, amount)
            print(f'Purchase successful: {result.get("message")}')
        else:
            print('Insufficient balance')
    except Exception as error:
        print(f'Purchase error: {error}')

# Example usage
buy_item('some_item_id', 2)
```

### Trading application

```python
from croissant_api import CroissantAPI

api = CroissantAPI(token='your_token_here')

def initiate_trade(target_user_id: str, item_id: str, amount: int):
    try:
        # Start or get existing trade
        trade = api.start_or_get_pending_trade(target_user_id)
        print(f'Trade ID: {trade.id}')
        
        # Add item to trade
        trade_item = {
            'itemId': item_id,
            'amount': amount,
            'metadata': {'note': 'Trading from Python!'}
        }
        
        result = api.add_item_to_trade(trade.id, trade_item)
        print(f'Item added to trade: {result}')
        
        # Approve trade (if ready)
        # approval = api.approve_trade(trade.id)
        # print(f'Trade approved: {approval}')
        
    except Exception as error:
        print(f'Trade error: {error}')

# Example usage
initiate_trade('target_user_id', 'item_id', 1)
```

### Game inventory manager

```python
from croissant_api import CroissantAPI

api = CroissantAPI(token='your_token_here')

def manage_inventory():
    try:
        # Get user profile
        user = api.get_me()
        print(f'User: {user.username} (Balance: {user.balance} credits)')
        
        # Get inventory
        inventory = api.get_my_inventory()
        print(f'Inventory items: {len(inventory.get("items", []))}')
        
        # Get owned games
        games = api.get_my_owned_games()
        print(f'Owned games: {len(games)}')
        
        # List created items
        my_items = api.get_my_items()
        print(f'Created items: {len(my_items)}')
        
        for item in my_items:
            print(f'- {item.name}: {item.price} credits')
            
    except Exception as error:
        print(f'Error managing inventory: {error}')

manage_inventory()
```

## 📱 Usage in Different Environments

### Standard Python Script

```python
#!/usr/bin/env python3

import os
from croissant_api import CroissantAPI

# Get token from environment variable
token = os.getenv('CROISSANT_TOKEN')
api = CroissantAPI(token=token)

# Your code here
user = api.get_me()
print(f'Hello, {user.username}!')
```

### Django Application

```python
# views.py
from django.shortcuts import render
from django.conf import settings
from croissant_api import CroissantAPI

def game_store(request):
    api = CroissantAPI()
    games = api.list_games()
    
    context = {'games': games}
    return render(request, 'store.html', context)

def user_profile(request):
    if 'croissant_token' in request.session:
        api = CroissantAPI(token=request.session['croissant_token'])
        user = api.get_me()
        inventory = api.get_my_inventory()
        
        context = {'user': user, 'inventory': inventory}
        return render(request, 'profile.html', context)
```

### Flask Application

```python
from flask import Flask, session, jsonify
from croissant_api import CroissantAPI

app = Flask(__name__)

@app.route('/api/games')
def get_games():
    api = CroissantAPI()
    games = api.list_games()
    return jsonify([game.__dict__ for game in games])

@app.route('/api/profile')
def get_profile():
    if 'token' in session:
        api = CroissantAPI(token=session['token'])
        user = api.get_me()
        return jsonify(user.__dict__)
    return jsonify({'error': 'Not authenticated'}), 401
```

### Jupyter Notebook

```python
# Install in Jupyter
!pip install requests

# Import and use
from croissant_api import CroissantAPI
import pandas as pd

# Analyze games data
api = CroissantAPI()
games = api.list_games()

# Convert to DataFrame
games_data = [game.__dict__ for game in games]
df = pd.DataFrame(games_data)

# Display statistics
print(f"Average game price: {df['price'].mean():.2f}")
print(f"Most expensive game: {df.loc[df['price'].idxmax(), 'name']}")
```

## 🛠️ Development and Testing

### Setting up for Development

```python
# test_croissant_api.py
import unittest
from croissant_api import CroissantAPI

class TestCroissantAPI(unittest.TestCase):
    def setUp(self):
        self.api = CroissantAPI()
        self.api_with_token = CroissantAPI(token='test_token')
    
    def test_list_games(self):
        games = self.api.list_games()
        self.assertIsInstance(games, list)
    
    def test_search_users(self):
        users = self.api.search_users('test')
        self.assertIsInstance(users, list)

if __name__ == '__main__':
    unittest.main()
```

### Environment Variables

```bash
# Set environment variables
export CROISSANT_TOKEN="your_token_here"
export CROISSANT_BASE_URL="https://croissant-api.fr/api"  # Optional override
```

```python
import os
from croissant_api import CroissantAPI

# Use environment variables
token = os.getenv('CROISSANT_TOKEN')
api = CroissantAPI(token=token)
```

## 🔍 Type Hints and IDE Support

The library is fully typed with Python type hints:

```python
from typing import List, Optional
from croissant_api import CroissantAPI, User, Game, Item

api: CroissantAPI = CroissantAPI(token='your_token')

# All methods have proper return type hints
user: User = api.get_me()
games: List[Game] = api.list_games()
item: Item = api.get_item('item_id')
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
- [Community Discord](https://discord.gg/PjhRBDYZ3p)
- [Python Package Index (PyPI)](https://pypi.org/project/croissant-api/) (if published)

---

*Last updated: July 2025*
*API Version: v1.0*
*Python SDK Version: v1.0*
