# Croissant API Java Client Library

A Java client library for interacting with the Croissant API. This library provides a simple and type-safe interface for all Croissant platform features with full POJO support and Gson serialization.

## 🚀 Installation

### Option 1: Direct Download

Download the files from the Croissant website:
- [CroissantAPI.java](https://croissant-api.fr/downloadables/sdk-java/CroissantAPI.java) (Main class)
- [CroissantAPIExample.java](https://croissant-api.fr/downloadables/sdk-java/CroissantAPIExample.java) (Usage examples)
- [pom.xml](https://croissant-api.fr/downloadables/sdk-java/pom.xml) or [build.gradle](https://croissant-api.fr/downloadables/sdk-java/build.gradle) (Build configuration)

### Option 2: Maven Integration

Copy the provided `pom.xml` to your project and run:

```bash
mvn clean compile
mvn exec:java -Dexec.mainClass="CroissantAPIExample"
```

### Option 3: Gradle Integration

Copy the provided `build.gradle` to your project and run:

```bash
./gradlew build
./gradlew runExample
```

## 📋 Requirements

- **Java**: 8 or higher
- **Dependencies**: Gson 2.10.1+ for JSON serialization
- **Environment**: Any Java environment (JRE/JDK)

## 🔧 Quick Start

### Dependencies Setup

#### Maven
```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

#### Gradle
```gradle
implementation 'com.google.code.gson:gson:2.10.1'
```

### Initialization

```java
// Without authentication (limited access)
CroissantAPI api = new CroissantAPI();

// With authentication token
CroissantAPI api = new CroissantAPI("your_auth_token_here");
```

### Basic Examples

```java
// Get games list
List<Game> games = api.games.list();

// Search users
List<User> users = api.users.search("username");

// Get your profile (requires token)
User me = api.users.getMe();

// Buy an item (requires token)
Map<String, Object> result = api.items.buy("item_id", 1);
```

## 📚 Method Documentation

### 👤 Users

```java
// Get your profile
User user = api.users.getMe();

// Search users
List<User> users = api.users.search("John");

// Get user by ID
User user = api.users.getUser("user_id");

// Transfer credits
Map<String, Object> result = api.users.transferCredits("target_user_id", 100);

// Verify a user
Map<String, Object> result = api.users.verify("user_id", "verification_key");
```

### 🎮 Games

```java
// List all games
List<Game> games = api.games.list();

// Search games
List<Game> games = api.games.search("platformer");

// Get game by ID
Game game = api.games.get("game_id");

// Get my created games (requires token)
List<Game> myGames = api.games.getMyCreatedGames();

// Get my owned games (requires token)
List<Game> ownedGames = api.games.getMyOwnedGames();
```

### 🎒 Inventory

```java
// Get my inventory (requires token)
CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory();

// Get user's inventory
CroissantAPI.Inventory.InventoryResponse userInventory = api.inventory.get("user_id");
```

### 🛍️ Items

```java
// List all items
List<Item> items = api.items.list();

// Search items
List<Item> items = api.items.search("sword");

// Get item by ID
Item item = api.items.get("item_id");

// Get my items (requires token)
List<Item> myItems = api.items.getMyItems();

// Create an item (requires token)
Map<String, Object> itemData = new HashMap<>();
itemData.put("name", "Magic Sword");
itemData.put("description", "An enchanted sword");
itemData.put("price", 100);
itemData.put("iconHash", "optional_icon_hash");
Map<String, Object> result = api.items.create(itemData);

// Update an item (requires token)
Map<String, Object> updateData = new HashMap<>();
updateData.put("name", "Updated Magic Sword");
updateData.put("price", 150);
Map<String, Object> result = api.items.update("item_id", updateData);

// Buy an item (requires token)
Map<String, Object> result = api.items.buy("item_id", 2);

// Sell an item (requires token)
Map<String, Object> result = api.items.sell("item_id", 1);

// Give an item to a user (requires token)
Map<String, Object> metadata = new HashMap<>();
metadata.put("custom", "data");
Map<String, Object> result = api.items.give("item_id", 1, "target_user_id", metadata);

// Consume an item (requires token)
Map<String, Object> params = new HashMap<>();
params.put("amount", 1);
Map<String, Object> result = api.items.consume("item_id", params);

// Update item metadata (requires token)
Map<String, Object> metadata = new HashMap<>();
metadata.put("level", 5);
Map<String, Object> result = api.items.updateMetadata("item_id", "unique_id", metadata);

// Drop an item from inventory (requires token)
Map<String, Object> params = new HashMap<>();
params.put("amount", 1);
Map<String, Object> result = api.items.drop("item_id", params);

// Delete an item (requires token)
Map<String, Object> result = api.items.delete("item_id");
```

### 🏢 Studios

```java
// Create a studio (requires token)
Map<String, Object> result = api.studios.create("My Studio");

// Get studio by ID
Studio studio = api.studios.get("studio_id");

// Get my studios (requires token)
List<Studio> myStudios = api.studios.getMyStudios();

// Add user to studio (requires token)
Map<String, Object> result = api.studios.addUser("studio_id", "user_id");

// Remove user from studio (requires token)
Map<String, Object> result = api.studios.removeUser("studio_id", "user_id");
```

### 🏛️ Lobbies

```java
// Create a lobby (requires token)
Map<String, Object> result = api.lobbies.create();

// Get lobby by ID
Lobby lobby = api.lobbies.get("lobby_id");

// Get my current lobby (requires token)
Lobby myLobby = api.lobbies.getMyLobby();

// Get user's lobby
Lobby userLobby = api.lobbies.getUserLobby("user_id");

// Join a lobby (requires token)
Map<String, Object> result = api.lobbies.join("lobby_id");

// Leave a lobby (requires token)
Map<String, Object> result = api.lobbies.leave("lobby_id");
```

### 🔄 Trades

```java
// Start or get pending trade
Trade trade = api.trades.startOrGetPending("user_id");

// Get trade by ID
Trade trade = api.trades.get("trade_id");

// Get user's trades
List<Trade> trades = api.trades.getUserTrades("user_id");

// Add item to trade
Map<String, Object> tradeItem = new HashMap<>();
tradeItem.put("itemId", "item_id");
tradeItem.put("amount", 1);
tradeItem.put("metadata", Map.of("custom", "data"));
Map<String, Object> result = api.trades.addItem("trade_id", tradeItem);

// Remove item from trade
Map<String, Object> tradeItem = new HashMap<>();
tradeItem.put("itemId", "item_id");
tradeItem.put("amount", 1);
Map<String, Object> result = api.trades.removeItem("trade_id", tradeItem);

// Approve a trade
Map<String, Object> result = api.trades.approve("trade_id");

// Cancel a trade
Map<String, Object> result = api.trades.cancel("trade_id");
```

### 🔐 OAuth2

```java
// Get OAuth2 application
OAuth2App app = api.oauth2.getApp("client_id");

// Create OAuth2 application (requires token)
List<String> redirectUrls = Arrays.asList("https://example.com/callback");
Map<String, String> app = api.oauth2.createApp("My App", redirectUrls);

// Get my applications (requires token)
List<OAuth2App> apps = api.oauth2.getMyApps();

// Update OAuth2 application (requires token)
Map<String, Object> data = new HashMap<>();
data.put("name", "Updated App Name");
Map<String, Object> result = api.oauth2.updateApp("client_id", data);

// Delete OAuth2 application (requires token)
Map<String, Object> result = api.oauth2.deleteApp("client_id");

// Authorize an application (requires token)
Map<String, String> result = api.oauth2.authorize("client_id", "redirect_uri");

// Get user by OAuth2 code
User user = api.oauth2.getUserByCode("code", "client_id");
```

## 🎯 Java POJOs

The library includes complete Java POJOs for all objects:

```java
public class User {
    public String userId;
    public String username;
    public String email;
    public boolean verified;
    public Double balance;
    // ... other properties
}

public class Game {
    public String gameId;
    public String name;
    public String description;
    public double price;
    public double rating;
    // ... other properties
}

public class Item {
    public String itemId;
    public String name;
    public String description;
    public double price;
    public String iconHash;
    // ... other properties
}

public class Trade {
    public String id;
    public String fromUserId;
    public String toUserId;
    public List<Map<String, Object>> fromUserItems;
    public List<Map<String, Object>> toUserItems;
    public String status;
    // ... other properties
}
```

## ⚠️ Error Handling

All methods can throw exceptions. It's recommended to use try/catch:

```java
try {
    User user = api.users.getMe();
    System.out.println("Logged in user: " + user.username);
} catch (Exception error) {
    System.err.println("Error getting profile: " + error.getMessage());
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

```java
public class GameBrowser {
    public static void main(String[] args) {
        CroissantAPI api = new CroissantAPI();
        
        try {
            List<Game> games = api.games.list();
            System.out.println(games.size() + " games found:");
            
            for (Game game : games) {
                System.out.println("- " + game.name + " (" + game.price + " credits)");
            }
        } catch (Exception error) {
            System.err.println("Error: " + error.getMessage());
        }
    }
}
```

### Authenticated application

```java
public class ItemPurchaser {
    private CroissantAPI api;
    
    public ItemPurchaser(String token) {
        this.api = new CroissantAPI(token);
    }
    
    public void buyItem(String itemId, int amount) {
        try {
            // Check balance
            User user = api.users.getMe();
            Item item = api.items.get(itemId);
            
            double totalCost = item.price * amount;
            
            if (user.balance != null && user.balance >= totalCost) {
                Map<String, Object> result = api.items.buy(itemId, amount);
                System.out.println("Purchase successful: " + result.get("message"));
            } else {
                System.out.println("Insufficient balance");
            }
        } catch (Exception error) {
            System.err.println("Purchase error: " + error.getMessage());
        }
    }
    
    public static void main(String[] args) {
        ItemPurchaser purchaser = new ItemPurchaser("your_token_here");
        purchaser.buyItem("some_item_id", 2);
    }
}
```

### Trading application

```java
public class TradeManager {
    private CroissantAPI api;
    
    public TradeManager(String token) {
        this.api = new CroissantAPI(token);
    }
    
    public void initiateTrade(String targetUserId, String itemId, int amount) {
        try {
            // Start or get existing trade
            Trade trade = api.trades.startOrGetPending(targetUserId);
            System.out.println("Trade ID: " + trade.id);
            
            // Add item to trade
            Map<String, Object> tradeItem = new HashMap<>();
            tradeItem.put("itemId", itemId);
            tradeItem.put("amount", amount);
            tradeItem.put("metadata", Map.of("note", "Trading from Java!"));
            
            Map<String, Object> result = api.trades.addItem(trade.id, tradeItem);
            System.out.println("Item added to trade: " + result);
            
            // Approve trade (if ready)
            // Map<String, Object> approval = api.trades.approve(trade.id);
            // System.out.println("Trade approved: " + approval);
            
        } catch (Exception error) {
            System.err.println("Trade error: " + error.getMessage());
        }
    }
    
    public static void main(String[] args) {
        TradeManager manager = new TradeManager("your_token_here");
        manager.initiateTrade("target_user_id", "item_id", 1);
    }
}
```

### Game inventory manager

```java
public class InventoryManager {
    private CroissantAPI api;
    
    public InventoryManager(String token) {
        this.api = new CroissantAPI(token);
    }
    
    public void manageInventory() {
        try {
            // Get user profile
            User user = api.users.getMe();
            System.out.println("User: " + user.username + " (Balance: " + user.balance + " credits)");
            
            // Get inventory
            CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory();
            System.out.println("Inventory items: " + inventory.inventory.size());
            
            // Get owned games
            List<Game> games = api.games.getMyOwnedGames();
            System.out.println("Owned games: " + games.size());
            
            // List created items
            List<Item> myItems = api.items.getMyItems();
            System.out.println("Created items: " + myItems.size());
            
            for (Item item : myItems) {
                System.out.println("- " + item.name + ": " + item.price + " credits");
            }
            
        } catch (Exception error) {
            System.err.println("Error managing inventory: " + error.getMessage());
        }
    }
    
    public static void main(String[] args) {
        InventoryManager manager = new InventoryManager("your_token_here");
        manager.manageInventory();
    }
}
```

## 📱 Usage in Different Environments

### Standard Java Application

```java
public class CroissantApp {
    public static void main(String[] args) {
        // Get token from environment variable
        String token = System.getenv("CROISSANT_TOKEN");
        CroissantAPI api = new CroissantAPI(token);
        
        try {
            User user = api.users.getMe();
            System.out.println("Hello, " + user.username + "!");
        } catch (Exception e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
}
```

### Spring Boot Application

```java
@RestController
@RequestMapping("/api")
public class CroissantController {
    
    @GetMapping("/games")
    public ResponseEntity<List<Game>> getGames() {
        try {
            CroissantAPI api = new CroissantAPI();
            List<Game> games = api.games.list();
            return ResponseEntity.ok(games);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
    
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestHeader("Authorization") String token) {
        try {
            CroissantAPI api = new CroissantAPI(token.replace("Bearer ", ""));
            User user = api.users.getMe();
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(401).build();
        }
    }
}
```

### Android Application

```java
public class CroissantService {
    private CroissantAPI api;
    private Context context;
    
    public CroissantService(Context context) {
        this.context = context;
        String token = getStoredToken();
        this.api = new CroissantAPI(token);
    }
    
    public void loadUserProfile(Callback<User> callback) {
        new AsyncTask<Void, Void, User>() {
            @Override
            protected User doInBackground(Void... voids) {
                try {
                    return api.users.getMe();
                } catch (Exception e) {
                    return null;
                }
            }
            
            @Override
            protected void onPostExecute(User user) {
                callback.onResult(user);
            }
        }.execute();
    }
    
    private String getStoredToken() {
        SharedPreferences prefs = context.getSharedPreferences("croissant", Context.MODE_PRIVATE);
        return prefs.getString("token", null);
    }
}
```

### JavaFX Application

```java
public class CroissantFXApp extends Application {
    private CroissantAPI api;
    
    @Override
    public void start(Stage primaryStage) {
        api = new CroissantAPI("your_token_here");
        
        VBox root = new VBox();
        ListView<String> gameList = new ListView<>();
        
        // Load games
        Task<List<Game>> loadGamesTask = new Task<List<Game>>() {
            @Override
            protected List<Game> call() throws Exception {
                return api.games.list();
            }
        };
        
        loadGamesTask.setOnSucceeded(e -> {
            List<Game> games = loadGamesTask.getValue();
            ObservableList<String> gameNames = FXCollections.observableArrayList();
            for (Game game : games) {
                gameNames.add(game.name + " - " + game.price + " credits");
            }
            gameList.setItems(gameNames);
        });
        
        new Thread(loadGamesTask).start();
        
        root.getChildren().add(gameList);
        Scene scene = new Scene(root, 800, 600);
        primaryStage.setScene(scene);
        primaryStage.setTitle("Croissant Games");
        primaryStage.show();
    }
}
```

## 🛠️ Development and Testing

### Setting up for Development

```java
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import static org.junit.jupiter.api.Assertions.*;

public class CroissantAPITest {
    private CroissantAPI api;
    private CroissantAPI apiWithToken;
    
    @BeforeEach
    void setUp() {
        api = new CroissantAPI();
        apiWithToken = new CroissantAPI("test_token");
    }
    
    @Test
    void testListGames() {
        List<Game> games = api.games.list();
        assertNotNull(games);
        assertTrue(games instanceof List);
    }
    
    @Test
    void testSearchUsers() {
        List<User> users = api.users.search("test");
        assertNotNull(users);
        assertTrue(users instanceof List);
    }
}
```

### Environment Variables

```bash
# Set environment variables
export CROISSANT_TOKEN="your_token_here"
export CROISSANT_BASE_URL="https://croissant-api.fr/api"  # Optional override
```

```java
public class Config {
    public static String getToken() {
        return System.getenv("CROISSANT_TOKEN");
    }
    
    public static String getBaseUrl() {
        return System.getenv("CROISSANT_BASE_URL");
    }
}

// Usage
CroissantAPI api = new CroissantAPI(Config.getToken());
```

## 🔍 Type Safety and IDE Support

The library is fully typed with Java generics and provides excellent IDE support:

```java
// All methods have proper return types
CroissantAPI api = new CroissantAPI("your_token");

User user = api.users.getMe();          // Returns User object
List<Game> games = api.games.list();    // Returns List<Game>
Item item = api.items.get("item_id");   // Returns Item object
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
- [Maven Central](https://search.maven.org/search?q=croissant-api) (if published)

---

*Last updated: July 2025*
*API Version: v1.0*
*Java SDK Version: v1.0*
