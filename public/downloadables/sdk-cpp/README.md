# Croissant API C++ Library

A modern C++ library for interacting with the Croissant API. This library has been completely rewritten from scratch based on the TypeScript interface to provide a consistent and typed developer experience.

## Features

- **Modern interface**: Uses namespaces to organize methods by category
- **Type safety**: Strongly typed C++ structures corresponding to TypeScript interfaces
- **Error handling**: Appropriate exceptions and clear return codes
- **Complete documentation**: All methods are documented with their parameters
- **Full API support**: All Croissant API features are supported

## Dependencies

- **nlohmann/json**: For JSON serialization/deserialization
- **cpr**: For HTTP requests
- **C++17** or newer

## Installation

### With vcpkg (recommended)

```bash
vcpkg install nlohmann-json cpr
```

### With CMake

```cmake
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

target_link_libraries(your_target PRIVATE nlohmann_json::nlohmann_json cpr::cpr)
```

## Basic usage

```cpp
#include "croissant_api_new.hpp"
#include <iostream>

using namespace CroissantAPI;

int main() {
    // Create a client with an authentication token
    Client api("your_api_token_here");
    
    try {
        // Get authenticated user information
        auto user = api.users.getMe();
        if (user) {
            std::cout << "Connected as: " << user->username << std::endl;
            std::cout << "User ID: " << user->userId << std::endl;
            if (user->balance) {
                std::cout << "Balance: " << *user->balance << " credits" << std::endl;
            }
        }
        
        // List all available games
        auto games = api.games.list();
        std::cout << "Available games: " << games.size() << std::endl;
        
        // Search users
        auto users = api.users.search("john");
        for (const auto& foundUser : users) {
            std::cout << "User found: " << foundUser.username << std::endl;
        }
        
        // Get inventory
        auto [userId, inventory] = api.inventory.getMyInventory();
        std::cout << "Items in inventory: " << inventory.size() << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

## Organization by Namespaces

The library organizes methods into logical namespaces:

### Users (`api.users`)
- `getMe()` - Get authenticated user profile
- `search(query)` - Search users
- `getUser(userId)` - Get user by ID
- `transferCredits(targetUserId, amount)` - Transfer credits
- `verify(userId, verificationKey)` - Verify a user
- `changeUsername(username)` - Change username
- `changePassword(oldPassword, newPassword, confirmPassword)` - Change password

### Games (`api.games`)
- `list()` - List all games
- `search(query)` - Search games
- `get(gameId)` - Get game by ID
- `getMyCreatedGames()` - Get games created by user
- `getMyOwnedGames()` - Get games owned by user
- `create(game)` - Create a new game
- `update(gameId, game)` - Update a game
- `buy(gameId)` - Buy a game

### Items (`api.items`)
- `list()` - List all items
- `search(query)` - Search items
- `get(itemId)` - Get item by ID
- `getMyItems()` - Get items created by user
- `create(name, description, price, iconHash, showInStore)` - Create an item
- `update(itemId, item)` - Update an item
- `deleteItem(itemId)` - Delete an item
- `buy(itemId, amount)` - Buy an item
- `sell(itemId, amount)` - Sell an item
- `give(itemId, amount, userId, metadata)` - Give an item to a user
- `consume(itemId, userId, amount, uniqueId)` - Consume an item
- `updateMetadata(itemId, uniqueId, metadata)` - Update metadata
- `drop(itemId, amount, uniqueId)` - Drop an item

### Inventory (`api.inventory`)
- `getMyInventory()` - Get authenticated user's inventory
- `get(userId)` - Get a user's inventory

### Lobbies (`api.lobbies`)
- `create()` - Create a lobby
- `get(lobbyId)` - Get lobby by ID
- `getMyLobby()` - Get user's lobby
- `getUserLobby(userId)` - Get a user's lobby
- `join(lobbyId)` - Join a lobby
- `leave(lobbyId)` - Leave a lobby

### Studios (`api.studios`)
- `create(studioName)` - Create a studio
- `get(studioId)` - Get studio by ID
- `getMyStudios()` - Get user's studios
- `addUser(studioId, userId)` - Add user to studio
- `removeUser(studioId, userId)` - Remove user from studio

### Trades (`api.trades`)
- `startOrGetPending(userId)` - Start or get pending trade
- `get(tradeId)` - Get trade by ID
- `getUserTrades(userId)` - Get user's trades
- `addItem(tradeId, tradeItem)` - Add item to trade
- `removeItem(tradeId, tradeItem)` - Remove item from trade
- `approve(tradeId)` - Approve a trade
- `cancel(tradeId)` - Cancel a trade

### OAuth2 (`api.oauth2`)
- `getApp(client_id)` - Get OAuth2 app
- `createApp(name, redirect_urls)` - Create OAuth2 app
- `getMyApps()` - Get user's OAuth2 apps
- `updateApp(client_id, name, redirect_urls)` - Update an app
- `deleteApp(client_id)` - Delete an app
- `authorize(client_id, redirect_uri)` - Authorize a user
- `getUserByCode(code, client_id)` - Get user by code

## Error handling

The library uses several mechanisms for error handling:

- **std::optional**: For methods that may not return a result
- **std::runtime_error**: For errors requiring missing token
- **APIResponse**: For operations that return a status and message

```cpp
// Using with std::optional
auto user = api.users.getUser("user_id");
if (user) {
    std::cout << "User found: " << user->username << std::endl;
} else {
    std::cout << "User not found" << std::endl;
}

// Using with APIResponse
auto response = api.items.create("My Item", "Description", 10.0);
if (response.success) {
    std::cout << "Item created: " << response.message << std::endl;
} else {
    std::cout << "Error: " << response.message << std::endl;
}

// Exception handling
try {
    auto inventory = api.inventory.getMyInventory();
} catch (const std::runtime_error& e) {
    std::cout << "Token required: " << e.what() << std::endl;
}
```

## Data structures

All structures correspond to TypeScript interfaces:

```cpp
// Example of using structures
Game newGame;
newGame.name = "My Game";
newGame.description = "Game description";
newGame.price = 19.99;
newGame.multiplayer = true;
newGame.genre = "Action";

auto createdGame = api.games.create(newGame);
if (createdGame) {
    std::cout << "Game created with ID: " << createdGame->gameId << std::endl;
}
```

## Compilation

```bash
# With g++
g++ -std=c++17 main.cpp croissant_api_new.cpp -lnlohmann_json -lcpr -o my_app

# With CMake
cmake_minimum_required(VERSION 3.10)
project(MyApp)

set(CMAKE_CXX_STANDARD 17)

find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

add_executable(my_app main.cpp croissant_api_new.cpp)
target_link_libraries(my_app PRIVATE nlohmann_json::nlohmann_json cpr::cpr)
```

## Migration from old version

The new library uses a different approach with namespaces:

```cpp
// Old version
CroissantAPI api("token");
auto user = api.getMe();
auto games = api.listGames();

// New version
CroissantAPI::Client api("token");
auto user = api.users.getMe();
auto games = api.games.list();
```

## License

This library follows the Croissant project license.
