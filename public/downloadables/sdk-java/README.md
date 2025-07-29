# CroissantAPI Java Client

Java client for the Croissant API, allowing interaction with all endpoints of the Croissant ecosystem.

## Installation

### Option 1: Direct download

1. Download the following files:
   - `CroissantAPI.java` (main class)
   - `CroissantAPIExample.java` (usage example)
   - `pom.xml` or `build.gradle` (depending on your build system)

2. Add the Gson dependency to your project

### Option 2: With Maven

Copy the provided `pom.xml` file to your project and run:

```bash
mvn clean compile
mvn exec:java -Dexec.mainClass="CroissantAPIExample"
```

### Option 3: With Gradle

Copy the provided `build.gradle` file to your project and run:

```bash
./gradlew build
./gradlew runExample
```

### Dependencies

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

## Basic usage

### Initialization

```java
// With authentication token
CroissantAPI api = new CroissantAPI("your_auth_token");

// Without authentication (for public endpoints)
CroissantAPI api = new CroissantAPI();
```

### User management

```java
// Get current user
User me = api.users.getMe();

// Search users
List<User> users = api.users.search("username");

// Get user by ID
User user = api.users.getUser("user_id");

// Transfer credits
Map<String, Object> result = api.users.transferCredits("target_user_id", 100);
```

### Game management

```java
// List all games
List<Game> games = api.games.list();

// Search games
List<Game> adventureGames = api.games.search("adventure");

// Get game by ID
Game game = api.games.get("game_id");

// Buy a game
Map<String, Object> purchase = api.games.buy("game_id");
```

### Item management

```java
// List all items
List<Item> items = api.items.list();

// Buy an item
Map<String, Object> purchase = api.items.buy("item_id", 5);

// Sell an item
Map<String, Object> sale = api.items.sell("item_id", 2);

// Give an item to a user
Map<String, Object> gift = api.items.give("item_id", 1, "user_id");

// Give an item with metadata
Map<String, Object> metadata = new HashMap<>();
metadata.put("custom_data", "value");
api.items.give("item_id", 1, "user_id", metadata);
```

### Inventory management

```java
// Get current user's inventory
CroissantAPI.Inventory.InventoryResponse myInventory = api.inventory.getMyInventory();

// Get another user's inventory
CroissantAPI.Inventory.InventoryResponse userInventory = api.inventory.get("user_id");

// Access inventory items
for (InventoryItem item : myInventory.inventory) {
    System.out.println("Item: " + item.name + ", Amount: " + item.amount);
}
```

### Trade management

```java
// Start or get pending trade
Trade trade = api.trades.startOrGetPending("user_id");

// Add item to trade
TradeItem tradeItem = new TradeItem("item_id", 2);
api.trades.addItem(trade.id, tradeItem);

// Approve trade
api.trades.approve(trade.id);

// Cancel trade
api.trades.cancel(trade.id);
```

### Lobby management

```java
// Create lobby
Map<String, Object> newLobby = api.lobbies.create();

// Join lobby
api.lobbies.join("lobby_id");

// Get current user's lobby
Lobby myLobby = api.lobbies.getMyLobby();

// Leave lobby
api.lobbies.leave("lobby_id");
```

### OAuth2

```java
// Create OAuth2 application
List<String> redirectUrls = Arrays.asList("https://example.com/callback");
Map<String, String> app = api.oauth2.createApp("My App", redirectUrls);

// Get user's applications
List<OAuth2App> myApps = api.oauth2.getMyApps();

// Authorize application
Map<String, String> auth = api.oauth2.authorize("client_id", "redirect_uri");

// Get user by authorization code
User user = api.oauth2.getUserByCode("auth_code", "client_id");
```

## Error handling

```java
try {
    User me = api.users.getMe();
    System.out.println("User: " + me.username);
} catch (Exception e) {
    System.err.println("API Error: " + e.getMessage());
}
```

## Data structures

### User
```java
public class User {
    public String userId;
    public String username;
    public String email;
    public Double balance;
    public boolean verified;
    // ... other properties
}
```

### Game
```java
public class Game {
    public String gameId;
    public String name;
    public String description;
    public double price;
    public String owner_id;
    // ... other properties
}
```

### Item
```java
public class Item {
    public String itemId;
    public String name;
    public String description;
    public double price;
    public String owner;
    // ... other properties
}
```

## Important notes

- All methods that require authentication will throw an exception if no token is provided
- API responses are automatically deserialized into typed Java objects
- HTTP error handling is built-in with detailed error messages
- Some methods have multiple overloads to support different optional parameters

## Dependencies

- Java 8 or higher
- Gson 2.10.1 or higher for JSON serialization

## Included files

- **CroissantAPI.java** - Main API client class
- **CroissantAPIExample.java** - Complete usage examples
- **README_CroissantAPI_Java.md** - Detailed documentation
- **pom.xml** - Maven configuration
- **build.gradle** - Gradle configuration
- **croissant-api-java.json** - Project metadata

## Quick example

```java
// Initialization
CroissantAPI api = new CroissantAPI("your_token");

// Get current user
User me = api.users.getMe();
System.out.println("Hello " + me.username);

// List games
List<Game> games = api.games.list();
System.out.println("Available games: " + games.size());

// Buy an item
Map<String, Object> result = api.items.buy("item_id", 1);
```
