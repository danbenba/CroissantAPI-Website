import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

/**
 * Croissant API Client for Java
 * 
 * This client library provides access to the Croissant API endpoints.
 * It supports user management, game operations, item transactions, inventory management,
 * lobby operations, studio management, and OAuth2 authentication.
 */
public class CroissantAPI {
    private static final String CROISSANT_BASE_URL = "https://croissant-api.fr/api";
    private final String token;
    private final Gson gson = new Gson();

    public CroissantAPI(String token) {
        if (token == null || token.isEmpty()) {
            throw new IllegalArgumentException("Token is required");
        }
        this.token = token;
    }

    /**
     * Make HTTP request to API
     */
    private String sendRequest(String endpoint, String method, String jsonInput, boolean auth) throws Exception {
        URL url = new URL(CROISSANT_BASE_URL + endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json");
        
        if (auth && token != null) {
            conn.setRequestProperty("Authorization", "Bearer " + token);
        }
        
        if (jsonInput != null) {
            conn.setDoOutput(true);
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.getBytes("UTF-8");
                os.write(input, 0, input.length);
            }
        }
        
        int responseCode = conn.getResponseCode();
        if (responseCode < 200 || responseCode >= 300) {
            throw new RuntimeException("HTTP error code: " + responseCode);
        }
        
        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "UTF-8"))) {
            String line;
            while ((line = br.readLine()) != null) {
                response.append(line.trim());
            }
        }
        
        conn.disconnect();
        return response.toString();
    }

    // === DATA MODELS ===

    public static class Game {
        public String gameId;
        public String name;
        public String description;
        public String owner_id;
        public String download_link;
        public double price;
        public boolean showInStore;
        public String iconHash;
        public String splashHash;
        public String bannerHash;
        public String genre;
        public String release_date;
        public String developer;
        public String publisher;
        public String platforms;
        public double rating;
        public String website;
        public String trailer_link;
        public boolean multiplayer;
    }

    public static class User {
        public String userId;
        public String username;
        public String email;
        public Double balance;
        public boolean verified;
        public String steam_id;
        public String steam_username;
        public String steam_avatar_url;
        public boolean isStudio;
        public boolean admin;
        public Boolean disabled;
        public String google_id;
        public String discord_id;
        public List<Studio> studios;
        public List<String> roles;
        public List<InventoryItem> inventory;
        public List<Item> ownedItems;
        public List<Game> createdGames;
        public Boolean haveAuthenticator;
        public String verificationKey;
    }

    public static class Item {
        public String itemId;
        public String name;
        public String description;
        public double price;
        public String owner;
        public boolean showInStore;
        public String iconHash;
        public boolean deleted;
    }

    public static class InventoryItem {
        public String itemId;
        public String name;
        public String description;
        public int amount;
        public String iconHash;
    }

    public static class Lobby {
        public String lobbyId;
        public List<LobbyUser> users;
        
        public static class LobbyUser {
            public String username;
            public String user_id;
            public boolean verified;
            public String steam_username;
            public String steam_avatar_url;
            public String steam_id;
        }
    }

    public static class Studio {
        public String user_id;
        public String username;
        public boolean verified;
        public String admin_id;
        public Boolean isAdmin;
        public String apiKey;
        public List<StudioUser> users;
        
        public static class StudioUser {
            public String user_id;
            public String username;
            public boolean verified;
            public boolean admin;
        }
    }

    public static class Trade {
        public String id;
        public String fromUserId;
        public String toUserId;
        public List<TradeItemDetails> fromUserItems;
        public List<TradeItemDetails> toUserItems;
        public boolean approvedFromUser;
        public boolean approvedToUser;
        public String status;
        public String createdAt;
        public String updatedAt;
        
        public static class TradeItemDetails {
            public String itemId;
            public String name;
            public String description;
            public String iconHash;
            public int amount;
        }
    }

    public static class TradeItem {
        public String itemId;
        public int amount;
    }

    public static class OAuth2App {
        public String client_id;
        public String client_secret;
        public String name;
        public List<String> redirect_urls;
    }

    // === USER ENDPOINTS ===

    public class Users {
        /**
         * Get current authenticated user
         */
        public User getMe() throws Exception {
            String response = sendRequest("/users/@me", "GET", null, true);
            return gson.fromJson(response, User.class);
        }

        /**
         * Get user by ID
         */
        public User getUser(String userId) throws Exception {
            String response = sendRequest("/users/" + userId, "GET", null, false);
            return gson.fromJson(response, User.class);
        }

        /**
         * Search users by query
         */
        public List<User> search(String query) throws Exception {
            String encodedQuery = URLEncoder.encode(query, "UTF-8");
            String response = sendRequest("/users/search?q=" + encodedQuery, "GET", null, false);
            return gson.fromJson(response, new TypeToken<List<User>>(){}.getType());
        }

        /**
         * Verify user credentials
         */
        public Map<String, Object> verify(String userId, String verificationKey) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("verificationKey", verificationKey);
            String response = sendRequest("/users/auth-verification", "POST", gson.toJson(body), false);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Transfer credits to another user
         */
        public Map<String, Object> transferCredits(String targetUserId, int amount) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("targetUserId", targetUserId);
            body.put("amount", amount);
            String response = sendRequest("/users/transfer-credits", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Change username
         */
        public Map<String, Object> changeUsername(String username) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("username", username);
            String response = sendRequest("/users/change-username", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Change password
         */
        public Map<String, Object> changePassword(String oldPassword, String newPassword, String confirmPassword) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("oldPassword", oldPassword);
            body.put("newPassword", newPassword);
            body.put("confirmPassword", confirmPassword);
            String response = sendRequest("/users/change-password", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final Users users = new Users();

    // === GAME ENDPOINTS ===

    public class Games {
        /**
         * List all games
         */
        public List<Game> list() throws Exception {
            String response = sendRequest("/games", "GET", null, false);
            return gson.fromJson(response, new TypeToken<List<Game>>(){}.getType());
        }

        /**
         * Search games by query
         */
        public List<Game> search(String query) throws Exception {
            String encodedQuery = URLEncoder.encode(query, "UTF-8");
            String response = sendRequest("/games/search?q=" + encodedQuery, "GET", null, false);
            return gson.fromJson(response, new TypeToken<List<Game>>(){}.getType());
        }

        /**
         * Get game by ID
         */
        public Game get(String gameId) throws Exception {
            String response = sendRequest("/games/" + gameId, "GET", null, false);
            return gson.fromJson(response, Game.class);
        }

        /**
         * Get games created by current user
         */
        public List<Game> getMyCreatedGames() throws Exception {
            String response = sendRequest("/games/@mine", "GET", null, true);
            return gson.fromJson(response, new TypeToken<List<Game>>(){}.getType());
        }

        /**
         * Get games owned by current user
         */
        public List<Game> getMyOwnedGames() throws Exception {
            String response = sendRequest("/games/list/@me", "GET", null, true);
            return gson.fromJson(response, new TypeToken<List<Game>>(){}.getType());
        }

        /**
         * Create new game
         */
        public Map<String, Object> create(Map<String, Object> gameData) throws Exception {
            String response = sendRequest("/games", "POST", gson.toJson(gameData), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Update existing game
         */
        public Game update(String gameId, Map<String, Object> gameData) throws Exception {
            String response = sendRequest("/games/" + gameId, "PUT", gson.toJson(gameData), true);
            return gson.fromJson(response, Game.class);
        }

        /**
         * Buy a game
         */
        public Map<String, Object> buy(String gameId) throws Exception {
            String response = sendRequest("/games/" + gameId + "/buy", "POST", null, true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final Games games = new Games();

    // === ITEM ENDPOINTS ===

    public class Items {
        /**
         * List all items
         */
        public List<Item> list() throws Exception {
            String response = sendRequest("/items", "GET", null, false);
            return gson.fromJson(response, new TypeToken<List<Item>>(){}.getType());
        }

        /**
         * Get items created by current user
         */
        public List<Item> getMyItems() throws Exception {
            String response = sendRequest("/items/@mine", "GET", null, true);
            return gson.fromJson(response, new TypeToken<List<Item>>(){}.getType());
        }

        /**
         * Search items by query
         */
        public List<Item> search(String query) throws Exception {
            String encodedQuery = URLEncoder.encode(query, "UTF-8");
            String response = sendRequest("/items/search?q=" + encodedQuery, "GET", null, false);
            return gson.fromJson(response, new TypeToken<List<Item>>(){}.getType());
        }

        /**
         * Get item by ID
         */
        public Item get(String itemId) throws Exception {
            String response = sendRequest("/items/" + itemId, "GET", null, false);
            return gson.fromJson(response, Item.class);
        }

        /**
         * Create new item
         */
        public Map<String, Object> create(Map<String, Object> itemData) throws Exception {
            String response = sendRequest("/items/create", "POST", gson.toJson(itemData), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Update existing item
         */
        public Map<String, Object> update(String itemId, Map<String, Object> itemData) throws Exception {
            String response = sendRequest("/items/update/" + itemId, "PUT", gson.toJson(itemData), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Delete item
         */
        public Map<String, Object> delete(String itemId) throws Exception {
            String response = sendRequest("/items/delete/" + itemId, "DELETE", null, true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Buy item
         */
        public Map<String, Object> buy(String itemId, int amount) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            String response = sendRequest("/items/buy/" + itemId, "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Sell item
         */
        public Map<String, Object> sell(String itemId, int amount) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            String response = sendRequest("/items/sell/" + itemId, "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Give item
         */
        public Map<String, Object> give(String itemId, int amount) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            String response = sendRequest("/items/give/" + itemId, "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Consume item
         */
        public Map<String, Object> consume(String itemId, int amount) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            String response = sendRequest("/items/consume/" + itemId, "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Drop item
         */
        public Map<String, Object> drop(String itemId, int amount) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            String response = sendRequest("/items/drop/" + itemId, "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final Items items = new Items();

    // === INVENTORY ENDPOINTS ===

    public class Inventory {
        /**
         * Get user's inventory
         */
        public List<InventoryItem> get(String userId) throws Exception {
            String response = sendRequest("/inventory/" + userId, "GET", null, false);
            return gson.fromJson(response, new TypeToken<List<InventoryItem>>(){}.getType());
        }

        /**
         * Get current user's inventory
         */
        public List<InventoryItem> getMyInventory() throws Exception {
            String response = sendRequest("/inventory/@me", "GET", null, true);
            return gson.fromJson(response, new TypeToken<List<InventoryItem>>(){}.getType());
        }
    }
    public final Inventory inventory = new Inventory();

    // === LOBBY ENDPOINTS ===

    public class Lobbies {
        /**
         * Create new lobby
         */
        public Map<String, Object> create() throws Exception {
            String response = sendRequest("/lobbies", "POST", "{}", true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Get lobby by ID
         */
        public Lobby get(String lobbyId) throws Exception {
            String response = sendRequest("/lobbies/" + lobbyId, "GET", null, false);
            return gson.fromJson(response, Lobby.class);
        }

        /**
         * Get current user's lobby
         */
        public Lobby getMyLobby() throws Exception {
            String response = sendRequest("/lobbies/@me", "GET", null, true);
            return gson.fromJson(response, Lobby.class);
        }

        /**
         * Get user's lobby
         */
        public Lobby getUserLobby(String userId) throws Exception {
            String response = sendRequest("/lobbies/user/" + userId, "GET", null, false);
            return gson.fromJson(response, Lobby.class);
        }

        /**
         * Join a lobby
         */
        public Map<String, Object> join(String lobbyId) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("lobbyId", lobbyId);
            String response = sendRequest("/lobbies/join", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Leave a lobby
         */
        public Map<String, Object> leave(String lobbyId) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("lobbyId", lobbyId);
            String response = sendRequest("/lobbies/leave", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final Lobbies lobbies = new Lobbies();

    // === STUDIO ENDPOINTS ===

    public class Studios {
        /**
         * Create new studio
         */
        public Map<String, Object> create(String studioName) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("name", studioName);
            String response = sendRequest("/studios", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Get studio by ID
         */
        public Studio get(String studioId) throws Exception {
            String response = sendRequest("/studios/" + studioId, "GET", null, false);
            return gson.fromJson(response, Studio.class);
        }

        /**
         * Get current user's studios
         */
        public List<Studio> getMyStudios() throws Exception {
            String response = sendRequest("/studios/@me", "GET", null, true);
            return gson.fromJson(response, new TypeToken<List<Studio>>(){}.getType());
        }

        /**
         * Add user to studio
         */
        public Map<String, Object> addUser(String studioId, String userId) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            String response = sendRequest("/studios/" + studioId + "/users", "POST", gson.toJson(body), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Remove user from studio
         */
        public Map<String, Object> removeUser(String studioId, String userId) throws Exception {
            String response = sendRequest("/studios/" + studioId + "/users/" + userId, "DELETE", null, true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final Studios studios = new Studios();

    // === TRADE ENDPOINTS ===

    public class Trades {
        /**
         * Start or get pending trade
         */
        public Trade startOrGetPending(String userId) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            String response = sendRequest("/trades", "POST", gson.toJson(body), true);
            return gson.fromJson(response, Trade.class);
        }

        /**
         * Get trade by ID
         */
        public Trade get(String tradeId) throws Exception {
            String response = sendRequest("/trades/" + tradeId, "GET", null, true);
            return gson.fromJson(response, Trade.class);
        }

        /**
         * Get current user's trades
         */
        public List<Trade> getMyTrades() throws Exception {
            String response = sendRequest("/trades/@me", "GET", null, true);
            return gson.fromJson(response, new TypeToken<List<Trade>>(){}.getType());
        }

        /**
         * Add item to trade
         */
        public Map<String, Object> addItem(String tradeId, TradeItem tradeItem) throws Exception {
            String response = sendRequest("/trades/" + tradeId + "/items", "POST", gson.toJson(tradeItem), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Remove item from trade
         */
        public Map<String, Object> removeItem(String tradeId, TradeItem tradeItem) throws Exception {
            String response = sendRequest("/trades/" + tradeId + "/items", "DELETE", gson.toJson(tradeItem), true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Approve trade
         */
        public Map<String, Object> approve(String tradeId) throws Exception {
            String response = sendRequest("/trades/" + tradeId + "/approve", "POST", null, true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Cancel trade
         */
        public Map<String, Object> cancel(String tradeId) throws Exception {
            String response = sendRequest("/trades/" + tradeId + "/cancel", "POST", null, true);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final Trades trades = new Trades();

    // === OAUTH2 ENDPOINTS ===

    public class OAuth2 {
        /**
         * Exchange authorization code for access token
         */
        public Map<String, Object> getUserByCode(String code, String clientId, String clientSecret, String redirectUri) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("code", code);
            body.put("client_id", clientId);
            body.put("client_secret", clientSecret);
            body.put("redirect_uri", redirectUri);
            body.put("grant_type", "authorization_code");
            String response = sendRequest("/oauth2/token", "POST", gson.toJson(body), false);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Refresh access token
         */
        public Map<String, Object> refreshToken(String refreshToken, String clientId, String clientSecret) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("refresh_token", refreshToken);
            body.put("client_id", clientId);
            body.put("client_secret", clientSecret);
            body.put("grant_type", "refresh_token");
            String response = sendRequest("/oauth2/token", "POST", gson.toJson(body), false);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }

        /**
         * Revoke access token
         */
        public Map<String, Object> revokeToken(String accessToken, String clientId, String clientSecret) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("token", accessToken);
            body.put("client_id", clientId);
            body.put("client_secret", clientSecret);
            String response = sendRequest("/oauth2/revoke", "POST", gson.toJson(body), false);
            return gson.fromJson(response, new TypeToken<Map<String, Object>>(){}.getType());
        }
    }
    public final OAuth2 oauth2 = new OAuth2();

    // === SEARCH ENDPOINTS ===

    public class Search {
        public static class GlobalSearchResult {
            public List<User> users;
            public List<Item> items;
            public List<Game> games;
        }

        /**
         * Global search across users, items, and games
         */
        public GlobalSearchResult global(String query) throws Exception {
            String encodedQuery = URLEncoder.encode(query, "UTF-8");
            String response = sendRequest("/search?q=" + encodedQuery, "GET", null, false);
            return gson.fromJson(response, GlobalSearchResult.class);
        }
    }
    public final Search search = new Search();

    // === UTILITY METHODS ===

    /**
     * Get current authentication token
     */
    public String getToken() {
        return token;
    }

    /**
     * Get base URL for API requests
     */
    public String getBaseUrl() {
        return CROISSANT_BASE_URL;
    }
}
