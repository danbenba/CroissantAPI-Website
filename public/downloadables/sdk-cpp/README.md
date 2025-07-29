# Croissant API C++ Client Library

A modern C++ client library for interacting with the Croissant API. This library provides a simple and type-safe interface for all Croissant platform features with full struct support and modern C++ features.

## 🚀 Installation

### Option 1: Direct Download

Download the files from the Croissant website:
- [croissant_api.hpp](https://croissant-api.fr/downloadables/sdk-cpp/croissant_api.hpp) (Header file)
- [croissant_api.cpp](https://croissant-api.fr/downloadables/sdk-cpp/croissant_api.cpp) (Implementation)
- [CMakeLists.txt](https://croissant-api.fr/downloadables/sdk-cpp/CMakeLists.txt) (CMake configuration)

### Option 2: vcpkg Integration

```bash
vcpkg install nlohmann-json cpr
```

### Option 3: CMake Integration

```cmake
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

add_executable(my_app main.cpp croissant_api.cpp)
target_link_libraries(my_app PRIVATE nlohmann_json::nlohmann_json cpr::cpr)
```

## 📋 Requirements

- **C++**: C++17 or newer
- **Dependencies**: 
  - `nlohmann/json` for JSON serialization/deserialization
  - `cpr` for HTTP requests
- **Environment**: Any modern C++ compiler (GCC 7+, Clang 5+, MSVC 2017+)

## 🔧 Quick Start

### Dependencies Setup

#### vcpkg (Recommended)
```bash
vcpkg install nlohmann-json cpr
```

#### CMake
```cmake
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

target_link_libraries(your_target PRIVATE nlohmann_json::nlohmann_json cpr::cpr)
```

### Initialization

```cpp
#include "croissant_api.hpp"

using namespace CroissantAPI;

// Without authentication (limited access)
Client api;

// With authentication token
Client api("your_auth_token_here");
```

### Basic Examples

```cpp
// Get games list
auto games = api.games.list();

// Search users
auto users = api.users.search("username");

// Get your profile (requires token)
auto me = api.users.getMe();

// Buy an item (requires token)
auto result = api.items.buy("item_id", 1);
```

## 📚 Method Documentation

### 👤 Users

```cpp
// Get your profile
auto user = api.users.getMe();

// Search users
auto users = api.users.search("John");

// Get user by ID
auto user = api.users.getUser("user_id");

// Transfer credits
auto result = api.users.transferCredits("target_user_id", 100.0);

// Verify a user
auto result = api.users.verify("user_id", "verification_key");
```

### 🎮 Games

```cpp
// List all games
auto games = api.games.list();

// Search games
auto games = api.games.search("platformer");

// Get game by ID
auto game = api.games.get("game_id");

// Get my created games (requires token)
auto myGames = api.games.getMyCreatedGames();

// Get my owned games (requires token)
auto ownedGames = api.games.getMyOwnedGames();
```

### 🎒 Inventory

```cpp
// Get my inventory (requires token)
auto [userId, inventory] = api.inventory.getMyInventory();

// Get user's inventory
auto [targetUserId, userInventory] = api.inventory.get("user_id");
```

### 🛍️ Items

```cpp
// List all items
auto items = api.items.list();

// Search items
auto items = api.items.search("sword");

// Get item by ID
auto item = api.items.get("item_id");

// Get my items (requires token)
auto myItems = api.items.getMyItems();

// Create an item (requires token)
auto response = api.items.create("Magic Sword", "An enchanted sword", 100.0, "icon_hash", true);

// Update an item (requires token)
Item updatedItem;
updatedItem.name = "Updated Magic Sword";
updatedItem.price = 150.0;
auto result = api.items.update("item_id", updatedItem);

// Buy an item (requires token)
auto result = api.items.buy("item_id", 2);

// Sell an item (requires token)
auto result = api.items.sell("item_id", 1);

// Give an item to a user (requires token)
nlohmann::json metadata = {{"custom", "data"}};
auto result = api.items.give("item_id", 1, "target_user_id", metadata);

// Consume an item (requires token)
auto result = api.items.consume("item_id", "target_user_id", 1, "unique_id");

// Update item metadata (requires token)
nlohmann::json metadata = {{"level", 5}};
auto result = api.items.updateMetadata("item_id", "unique_id", metadata);

// Drop an item from inventory (requires token)
auto result = api.items.drop("item_id", 1, "unique_id");

// Delete an item (requires token)
auto result = api.items.deleteItem("item_id");
```

### 🏢 Studios

```cpp
// Create a studio (requires token)
auto result = api.studios.create("My Studio");

// Get studio by ID
auto studio = api.studios.get("studio_id");

// Get my studios (requires token)
auto myStudios = api.studios.getMyStudios();

// Add user to studio (requires token)
auto result = api.studios.addUser("studio_id", "user_id");

// Remove user from studio (requires token)
auto result = api.studios.removeUser("studio_id", "user_id");
```

### 🏛️ Lobbies

```cpp
// Create a lobby (requires token)
auto result = api.lobbies.create();

// Get lobby by ID
auto lobby = api.lobbies.get("lobby_id");

// Get my current lobby (requires token)
auto myLobby = api.lobbies.getMyLobby();

// Get user's lobby
auto userLobby = api.lobbies.getUserLobby("user_id");

// Join a lobby (requires token)
auto result = api.lobbies.join("lobby_id");

// Leave a lobby (requires token)
auto result = api.lobbies.leave("lobby_id");
```

### 🔄 Trades

```cpp
// Start or get pending trade
auto trade = api.trades.startOrGetPending("user_id");

// Get trade by ID
auto trade = api.trades.get("trade_id");

// Get user's trades
auto trades = api.trades.getUserTrades("user_id");

// Add item to trade
TradeItem tradeItem;
tradeItem.itemId = "item_id";
tradeItem.amount = 1;
tradeItem.metadata = {{"custom", "data"}};
auto result = api.trades.addItem("trade_id", tradeItem);

// Remove item from trade
TradeItem tradeItem;
tradeItem.itemId = "item_id";
tradeItem.amount = 1;
auto result = api.trades.removeItem("trade_id", tradeItem);

// Approve a trade
auto result = api.trades.approve("trade_id");

// Cancel a trade
auto result = api.trades.cancel("trade_id");
```

### 🔐 OAuth2

```cpp
// Get OAuth2 application
auto app = api.oauth2.getApp("client_id");

// Create OAuth2 application (requires token)
std::vector<std::string> redirectUrls = {"https://example.com/callback"};
auto response = api.oauth2.createApp("My App", redirectUrls);

// Get my applications (requires token)
auto apps = api.oauth2.getMyApps();

// Update OAuth2 application (requires token)
auto result = api.oauth2.updateApp("client_id", "Updated App Name", redirectUrls);

// Delete OAuth2 application (requires token)
auto result = api.oauth2.deleteApp("client_id");

// Authorize an application (requires token)
auto result = api.oauth2.authorize("client_id", "redirect_uri");

// Get user by OAuth2 code
auto user = api.oauth2.getUserByCode("code", "client_id");
```

## 🎯 C++ Structs

The library includes complete C++ structs for all objects:

```cpp
struct User {
    std::string userId;
    std::string username;
    std::optional<std::string> email;
    bool verified = false;
    std::optional<double> balance;
    // ... other properties
};

struct Game {
    std::string gameId;
    std::string name;
    std::string description;
    double price;
    double rating = 0.0;
    // ... other properties
};

struct Item {
    std::string itemId;
    std::string name;
    std::string description;
    double price;
    std::string iconHash;
    // ... other properties
};

struct Trade {
    std::string id;
    std::string fromUserId;
    std::string toUserId;
    std::vector<nlohmann::json> fromUserItems;
    std::vector<nlohmann::json> toUserItems;
    std::string status;
    // ... other properties
};
```

## ⚠️ Error Handling

The library uses several mechanisms for error handling:

```cpp
// Using std::optional for methods that may not return a result
auto user = api.users.getUser("user_id");
if (user) {
    std::cout << "User found: " << user->username << std::endl;
} else {
    std::cout << "User not found" << std::endl;
}

// Using APIResponse for operations that return status
auto response = api.items.create("My Item", "Description", 10.0);
if (response.success) {
    std::cout << "Item created: " << response.message << std::endl;
} else {
    std::cout << "Error: " << response.message << std::endl;
}

// Exception handling for authentication errors
try {
    auto inventory = api.inventory.getMyInventory();
} catch (const std::runtime_error& e) {
    std::cout << "Authentication error: " << e.what() << std::endl;
}
```

Common errors:
- `Token is required` : Missing authentication token
- `User not found` : User not found
- `Item not found` : Item not found
- HTTP errors from network requests

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

```cpp
#include "croissant_api.hpp"
#include <iostream>

int main() {
    CroissantAPI::Client api;
    
    try {
        auto games = api.games.list();
        std::cout << games.size() << " games found:" << std::endl;
        
        for (const auto& game : games) {
            std::cout << "- " << game.name << " (" << game.price << " credits)" << std::endl;
        }
    } catch (const std::exception& error) {
        std::cerr << "Error: " << error.what() << std::endl;
    }
    
    return 0;
}
```

### Authenticated application

```cpp
#include "croissant_api.hpp"
#include <iostream>

class ItemPurchaser {
private:
    CroissantAPI::Client api;
    
public:
    ItemPurchaser(const std::string& token) : api(token) {}
    
    void buyItem(const std::string& itemId, int amount) {
        try {
            // Check balance
            auto user = api.users.getMe();
            auto item = api.items.get(itemId);
            
            if (!user || !item) {
                std::cout << "User or item not found" << std::endl;
                return;
            }
            
            double totalCost = item->price * amount;
            
            if (user->balance && *user->balance >= totalCost) {
                auto result = api.items.buy(itemId, amount);
                if (result.success) {
                    std::cout << "Purchase successful: " << result.message << std::endl;
                } else {
                    std::cout << "Purchase failed: " << result.message << std::endl;
                }
            } else {
                std::cout << "Insufficient balance" << std::endl;
            }
        } catch (const std::exception& error) {
            std::cerr << "Purchase error: " << error.what() << std::endl;
        }
    }
};

int main() {
    ItemPurchaser purchaser("your_token_here");
    purchaser.buyItem("some_item_id", 2);
    return 0;
}
```

### Trading application

```cpp
#include "croissant_api.hpp"
#include <iostream>

class TradeManager {
private:
    CroissantAPI::Client api;
    
public:
    TradeManager(const std::string& token) : api(token) {}
    
    void initiateTrade(const std::string& targetUserId, const std::string& itemId, int amount) {
        try {
            // Start or get existing trade
            auto trade = api.trades.startOrGetPending(targetUserId);
            if (!trade) {
                std::cout << "Failed to create or get trade" << std::endl;
                return;
            }
            
            std::cout << "Trade ID: " << trade->id << std::endl;
            
            // Add item to trade
            TradeItem tradeItem;
            tradeItem.itemId = itemId;
            tradeItem.amount = amount;
            tradeItem.metadata = {{"note", "Trading from C++!"}};
            
            auto result = api.trades.addItem(trade->id, tradeItem);
            if (result.success) {
                std::cout << "Item added to trade: " << result.message << std::endl;
            } else {
                std::cout << "Failed to add item: " << result.message << std::endl;
            }
            
            // Approve trade (if ready)
            // auto approval = api.trades.approve(trade->id);
            // std::cout << "Trade approved: " << approval.message << std::endl;
            
        } catch (const std::exception& error) {
            std::cerr << "Trade error: " << error.what() << std::endl;
        }
    }
};

int main() {
    TradeManager manager("your_token_here");
    manager.initiateTrade("target_user_id", "item_id", 1);
    return 0;
}
```

### Game inventory manager

```cpp
#include "croissant_api.hpp"
#include <iostream>

class InventoryManager {
private:
    CroissantAPI::Client api;
    
public:
    InventoryManager(const std::string& token) : api(token) {}
    
    void manageInventory() {
        try {
            // Get user profile
            auto user = api.users.getMe();
            if (!user) {
                std::cout << "Failed to get user profile" << std::endl;
                return;
            }
            
            std::cout << "User: " << user->username;
            if (user->balance) {
                std::cout << " (Balance: " << *user->balance << " credits)";
            }
            std::cout << std::endl;
            
            // Get inventory
            auto [userId, inventory] = api.inventory.getMyInventory();
            std::cout << "Inventory items: " << inventory.size() << std::endl;
            
            // Get owned games
            auto games = api.games.getMyOwnedGames();
            std::cout << "Owned games: " << games.size() << std::endl;
            
            // List created items
            auto myItems = api.items.getMyItems();
            std::cout << "Created items: " << myItems.size() << std::endl;
            
            for (const auto& item : myItems) {
                std::cout << "- " << item.name << ": " << item.price << " credits" << std::endl;
            }
            
        } catch (const std::exception& error) {
            std::cerr << "Error managing inventory: " << error.what() << std::endl;
        }
    }
};

int main() {
    InventoryManager manager("your_token_here");
    manager.manageInventory();
    return 0;
}
```

## 📱 Usage in Different Environments

### Standard C++ Application

```cpp
#include "croissant_api.hpp"
#include <iostream>
#include <cstdlib>

int main() {
    // Get token from environment variable
    const char* token = std::getenv("CROISSANT_TOKEN");
    if (!token) {
        std::cerr << "CROISSANT_TOKEN environment variable not set" << std::endl;
        return 1;
    }
    
    CroissantAPI::Client api(token);
    
    try {
        auto user = api.users.getMe();
        if (user) {
            std::cout << "Hello, " << user->username << "!" << std::endl;
        }
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    return 0;
}
```

### Qt Application

```cpp
#include "croissant_api.hpp"
#include <QApplication>
#include <QMainWindow>
#include <QListWidget>
#include <QVBoxLayout>
#include <QWidget>
#include <QtConcurrent>
#include <QFutureWatcher>

class CroissantMainWindow : public QMainWindow {
    Q_OBJECT
    
private:
    CroissantAPI::Client api;
    QListWidget* gameList;
    
public:
    CroissantMainWindow(const QString& token, QWidget* parent = nullptr) 
        : QMainWindow(parent), api(token.toStdString()) {
        
        auto centralWidget = new QWidget(this);
        setCentralWidget(centralWidget);
        
        auto layout = new QVBoxLayout(centralWidget);
        gameList = new QListWidget(this);
        layout->addWidget(gameList);
        
        loadGames();
    }
    
private slots:
    void onGamesLoaded() {
        auto watcher = static_cast<QFutureWatcher<std::vector<Game>>*>(sender());
        auto games = watcher->result();
        
        for (const auto& game : games) {
            QString item = QString("%1 - %2 credits")
                .arg(QString::fromStdString(game.name))
                .arg(game.price);
            gameList->addItem(item);
        }
        
        watcher->deleteLater();
    }
    
private:
    void loadGames() {
        auto watcher = new QFutureWatcher<std::vector<Game>>(this);
        connect(watcher, &QFutureWatcher<std::vector<Game>>::finished,
                this, &CroissantMainWindow::onGamesLoaded);
        
        auto future = QtConcurrent::run([this]() {
            return api.games.list();
        });
        watcher->setFuture(future);
    }
};

int main(int argc, char *argv[]) {
    QApplication app(argc, argv);
    
    CroissantMainWindow window("your_token_here");
    window.show();
    
    return app.exec();
}

#include "main.moc"
```

### Game Engine Integration (Custom Engine)

```cpp
#include "croissant_api.hpp"

class CroissantGameManager {
private:
    CroissantAPI::Client api;
    std::thread networkThread;
    std::atomic<bool> running{true};
    
public:
    CroissantGameManager(const std::string& token) : api(token) {
        networkThread = std::thread(&CroissantGameManager::networkLoop, this);
    }
    
    ~CroissantGameManager() {
        running = false;
        if (networkThread.joinable()) {
            networkThread.join();
        }
    }
    
    void purchaseItem(const std::string& itemId, int amount) {
        // Queue purchase for network thread
        // Implementation depends on your threading model
    }
    
    void startTrade(const std::string& targetPlayerId) {
        // Queue trade initiation for network thread
        // Implementation depends on your threading model
    }
    
private:
    void networkLoop() {
        while (running) {
            try {
                // Process network operations
                // Update game state based on API responses
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
            } catch (const std::exception& e) {
                // Log error
            }
        }
    }
};
```

### Embedded System (Limited Resources)

```cpp
#include "croissant_api.hpp"
#include <memory>

class LightweightCroissantClient {
private:
    std::unique_ptr<CroissantAPI::Client> api;
    
public:
    bool initialize(const std::string& token) {
        try {
            api = std::make_unique<CroissantAPI::Client>(token);
            return true;
        } catch (...) {
            return false;
        }
    }
    
    bool verifyUser(const std::string& userId, const std::string& key) {
        if (!api) return false;
        
        try {
            auto result = api->users.verify(userId, key);
            return result.success;
        } catch (...) {
            return false;
        }
    }
    
    void cleanup() {
        api.reset();
    }
};
```

## 🛠️ Development and Testing

### CMake Setup

```cmake
cmake_minimum_required(VERSION 3.15)
project(CroissantAPIExample)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Find dependencies
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

# Add executable
add_executable(croissant_example 
    main.cpp 
    croissant_api.cpp
)

# Link libraries
target_link_libraries(croissant_example PRIVATE 
    nlohmann_json::nlohmann_json 
    cpr::cpr
)

# Enable testing
enable_testing()
add_subdirectory(tests)
```

### Unit Testing

```cpp
#include "croissant_api.hpp"
#include <gtest/gtest.h>

class CroissantAPITest : public ::testing::Test {
protected:
    void SetUp() override {
        api = std::make_unique<CroissantAPI::Client>();
        apiWithToken = std::make_unique<CroissantAPI::Client>("test_token");
    }
    
    std::unique_ptr<CroissantAPI::Client> api;
    std::unique_ptr<CroissantAPI::Client> apiWithToken;
};

TEST_F(CroissantAPITest, ListGames) {
    auto games = api->games.list();
    EXPECT_TRUE(!games.empty() || games.empty()); // Should not throw
}

TEST_F(CroissantAPITest, SearchUsers) {
    auto users = api->users.search("test");
    EXPECT_TRUE(!users.empty() || users.empty()); // Should not throw
}

TEST_F(CroissantAPITest, GetMeRequiresToken) {
    EXPECT_THROW(api->users.getMe(), std::runtime_error);
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
```

### Environment Configuration

```cpp
#include <cstdlib>
#include <string>

class Config {
public:
    static std::string getToken() {
        const char* token = std::getenv("CROISSANT_TOKEN");
        return token ? std::string(token) : "";
    }
    
    static std::string getBaseUrl() {
        const char* url = std::getenv("CROISSANT_BASE_URL");
        return url ? std::string(url) : "https://croissant-api.fr/api";
    }
};

// Usage
CroissantAPI::Client api(Config::getToken());
```

## 🔍 Modern C++ Features

The library leverages modern C++ features:

```cpp
// Structured bindings (C++17)
auto [userId, inventory] = api.inventory.getMyInventory();

// std::optional for nullable values
auto user = api.users.getUser("user_id");
if (user.has_value()) {
    std::cout << "User: " << user->username << std::endl;
}

// Range-based for loops
for (const auto& game : api.games.list()) {
    std::cout << game.name << std::endl;
}

// Smart pointers for memory management
auto api = std::make_unique<CroissantAPI::Client>("token");

// Move semantics
Game newGame = createGame();
api.games.create(std::move(newGame));
```

## 🚀 Compilation Instructions

### GCC/Clang
```bash
g++ -std=c++17 -O2 main.cpp croissant_api.cpp -lnlohmann_json -lcpr -o my_app
```

### MSVC
```cmd
cl /std:c++17 /O2 main.cpp croissant_api.cpp /link nlohmann_json.lib cpr.lib
```

### CMake Build
```bash
mkdir build && cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=[vcpkg root]/scripts/buildsystems/vcpkg.cmake
cmake --build . --config Release
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
- [vcpkg Package Manager](https://vcpkg.io/)
- [nlohmann/json Documentation](https://json.nlohmann.me/)
- [CPR Documentation](https://docs.libcpr.org/)

---

*Last updated: July 2025*
*API Version: v1.0*
*C++ SDK Version: v1.0*
