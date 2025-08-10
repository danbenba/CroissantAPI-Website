/**
 * CroissantAPI usage example for Java
 * 
 * This test file shows how to use the main features
 * of the CroissantAPI library in Java.
 */
public class CroissantAPIExample {
    
    public static void main(String[] args) {
        // Example with authentication
        testWithAuthentication();
        
        // Example without authentication (public endpoints)
        testWithoutAuthentication();
    }
    
    /**
     * Test features requiring authentication
     */
    public static void testWithAuthentication() {
        try {
            // Initialize API with a token
            CroissantAPI api = new CroissantAPI("your_token_here");
            
            System.out.println("=== Test with authentication ===");
            
            // Get current user
            CroissantAPI.User me = api.users.getMe();
            System.out.println("Current user: " + me.username);
            System.out.println("Balance: " + me.balance + " credits");
            
            // Get inventory
            CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory();
            System.out.println("Items in inventory: " + inventory.inventory.size());
            
            // List owned games
            java.util.List<CroissantAPI.Game> myGames = api.games.getMyOwnedGames();
            System.out.println("Owned games: " + myGames.size());
            
            // List created items
            java.util.List<CroissantAPI.Item> myItems = api.items.getMyItems();
            System.out.println("Created items: " + myItems.size());
            
            // Create a lobby
            java.util.Map<String, Object> newLobby = api.lobbies.create();
            System.out.println("Lobby created: " + newLobby);
            
        } catch (Exception e) {
            System.err.println("Error during authentication test: " + e.getMessage());
    }
    
    /**
     * Test public features (without authentication)
     */
    public static void testWithoutAuthentication() {
        try {
            // Initialize API without token
            CroissantAPI api = new CroissantAPI();
            
            System.out.println("\\n=== Test without authentication ===");
            
            // List all games
            java.util.List<CroissantAPI.Game> games = api.games.list();
            System.out.println("Number of available games: " + games.size());
            
            if (!games.isEmpty()) {
                CroissantAPI.Game firstGame = games.get(0);
                System.out.println("First game: " + firstGame.name + " - " + firstGame.price + " credits");
            }
            
            // List all items
            java.util.List<CroissantAPI.Item> items = api.items.list();
            System.out.println("Number of available items: " + items.size());
            
            if (!items.isEmpty()) {
                CroissantAPI.Item firstItem = items.get(0);
                System.out.println("First item: " + firstItem.name + " - " + firstItem.price + " credits");
            }
            
            // Search users
            java.util.List<CroissantAPI.User> users = api.users.search("test");
            System.out.println("Users found with 'test': " + users.size());
            
            // Search games
            java.util.List<CroissantAPI.Game> adventureGames = api.games.search("adventure");
            System.out.println("Adventure games found: " + adventureGames.size());
            
        } catch (Exception e) {
            System.err.println("Error during test without authentication: " + e.getMessage());
        }
    }
    
    /**
     * Advanced usage example with error handling
     */
    public static void advancedExample() {
        try {
            CroissantAPI api = new CroissantAPI("your_token_here");
            
            // Example of item transaction with metadata
            java.util.Map<String, Object> metadata = new java.util.HashMap<>();
            metadata.put("custom_property", "special_value");
            metadata.put("rarity", "legendary");
            
            // Give an item with metadata
            java.util.Map<String, Object> result = api.items.give("item_id", 1, "target_user_id", metadata);
            System.out.println("Gift result: " + result);
            
            // Start a trade
            CroissantAPI.Trade trade = api.trades.startOrGetPending("other_user_id");
            
            // Add an item to the trade
            CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem("item_id", 2);
            api.trades.addItem(trade.id, tradeItem);
            
            // Approve the trade
            api.trades.approve(trade.id);
            
            // Create an OAuth2 application
            java.util.List<String> redirectUrls = java.util.Arrays.asList("https://example.com/callback");
            java.util.Map<String, String> app = api.oauth2.createApp("My Application", redirectUrls);
            System.out.println("Application created with client_id: " + app.get("client_id"));
            
        } catch (Exception e) {
            System.err.println("Error in advanced example: " + e.getMessage());
        }
    }
}
