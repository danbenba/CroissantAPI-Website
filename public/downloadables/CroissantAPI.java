import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;
import java.util.HashMap;
import com.google.gson.Gson;

/**
 * CroissantAPI provides methods to interact with the Croissant API (v2 style).
 */
public class CroissantAPI {
    private static final String CROISSANT_BASE_URL = "https://croissant-api.fr/api";
    private final String token;
    private final Gson gson = new Gson();

    public CroissantAPI(String token) {
        if (token == null || token.isEmpty()) throw new IllegalArgumentException("Token is required");
        this.token = token;
    }

    private String sendRequest(String endpoint, String method, String jsonInput, boolean auth) {
        try {
            URL url = new URL(CROISSANT_BASE_URL + endpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod(method);
            conn.setRequestProperty("Content-Type", "application/json");
            if (auth) conn.setRequestProperty("Authorization", "Bearer " + token);
            if (jsonInput != null) {
                conn.setDoOutput(true);
                try (OutputStream os = conn.getOutputStream()) {
                    byte[] input = jsonInput.getBytes("utf-8");
                    os.write(input, 0, input.length);
                }
            }
            int code = conn.getResponseCode();
            if (code < 200 || code >= 300) {
                // Instead of throwing an exception, return a default value
                return getDefaultValueForEndpoint(endpoint);
            }
            StringBuilder response = new StringBuilder();
            try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
                String line;
                while ((line = br.readLine()) != null) response.append(line.trim());
            }
            conn.disconnect();
            return response.toString();
        } catch (Exception e) {
            // Handle exceptions and return a default value
            e.printStackTrace(); // Log the exception for debugging
            return getDefaultValueForEndpoint(endpoint);
        }
    }

    private String getDefaultValueForEndpoint(String endpoint) {
        // Define default values for different endpoints
        if (endpoint.equals("/users/@me")) return "{}"; // Example: empty JSON object for user
        if (endpoint.startsWith("/users/")) return "{}"; // Default user object
        if (endpoint.startsWith("/games/")) return "[]"; // Default games list
        if (endpoint.startsWith("/items/")) return "[]"; // Default items list
        if (endpoint.startsWith("/inventory/")) return "[]"; // Default inventory list
        if (endpoint.startsWith("/lobbies/")) return "{}"; // Default lobby object
        return ""; // Generic default: empty string
    }

    // --- USERS ---
    public class Users {
        public String getMe() {
            return sendRequest("/users/@me", "GET", null, true);
        }
        public String getUser(String userId) {
            return sendRequest("/users/" + userId, "GET", null, false);
        }
        public String search(String query) {
            try {
                return sendRequest("/users/search?q=" + java.net.URLEncoder.encode(query, "UTF-8"), "GET", null, false);
            } catch (Exception e) {
                e.printStackTrace();
                return "[]"; // or any other suitable default for search results
            }
        }
        public String verify(String userId, String verificationKey) {
            try {
                String params = "?userId=" + java.net.URLEncoder.encode(userId, "UTF-8") +
                                "&verificationKey=" + java.net.URLEncoder.encode(verificationKey, "UTF-8");
                return sendRequest("/users/auth-verification" + params, "GET", null, false);
            } catch (Exception e) {
                e.printStackTrace();
                return "{\"success\": false}"; // Suitable default for verify
            }
        }
        public String transferCredits(String targetUserId, int amount) {
            Map<String, Object> body = new HashMap<>();
            body.put("targetUserId", targetUserId);
            body.put("amount", amount);
            return sendRequest("/users/transfer-credits", "POST", gson.toJson(body), true);
        }
        public String create(Map<String, Object> options) {
            // Create a new user
            return sendRequest("/users/create", "POST", gson.toJson(options), true);
        }
    }
    public final Users users = new Users();

    // --- GAMES ---
    public class Games {
        public String list() {
            return sendRequest("/games", "GET", null, false);
        }
        public String get(String gameId) {
            return sendRequest("/games/" + gameId, "GET", null, false);
        }
        public String listMine() {
            return sendRequest("/games/@mine", "GET", null, true);
        }
        public String listOwned() {
            return sendRequest("/games/list/@me", "GET", null, true);
        }
        public String listOwnedByUser(String userId)  {
            return sendRequest("/games/list/" + userId, "GET", null, false);
        }
        public String create(Map<String, Object> options) {
            return sendRequest("/games", "POST", gson.toJson(options), true);
        }
        public String update(String gameId, Map<String, Object> options) {
            return sendRequest("/games/" + gameId, "PUT", gson.toJson(options), true);
        }
        public String delete(String gameId) {
            return sendRequest("/games/" + gameId, "DELETE", null, true);
        }
    }
    public final Games games = new Games();

    // --- ITEMS ---
    public class Items {
        public String list() {
            return sendRequest("/items", "GET", null, false);
        }
        public String listMine() {
            return sendRequest("/items/@mine", "GET", null, true);
        }
        public String get(String itemId) {
            return sendRequest("/items/" + itemId, "GET", null, false);
        }
        public String create(Map<String, Object> options) {
            return sendRequest("/items/create", "POST", gson.toJson(options), true);
        }
        public String update(String itemId, Map<String, Object> options) {
            return sendRequest("/items/update/" + itemId, "PUT", gson.toJson(options), true);
        }
        public String delete(String itemId) {
            return sendRequest("/items/delete/" + itemId, "DELETE", null, true);
        }
        public String buy(String itemId, int amount) {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            return sendRequest("/items/buy/" + itemId, "POST", gson.toJson(body), true);
        }
        public String sell(String itemId, int amount) {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            return sendRequest("/items/sell/" + itemId, "POST", gson.toJson(body), true);
        }
        public String give(String itemId, int amount) {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            return sendRequest("/items/give/" + itemId, "POST", gson.toJson(body), true);
        }
        public String consume(String itemId, int amount) {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            return sendRequest("/items/consume/" + itemId, "POST", gson.toJson(body), true);
        }
        public String drop(String itemId, int amount) {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            return sendRequest("/items/drop/" + itemId, "POST", gson.toJson(body), true);
        }
        public String transfer(String itemId, int amount, String targetUserId) {
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amount);
            body.put("targetUserId", targetUserId);
            return sendRequest("/items/transfer/" + itemId, "POST", gson.toJson(body), true);
        }
    }
    public final Items items = new Items();

    // --- INVENTORY ---
    public class Inventory {
        public String get(String userId) {
            return sendRequest("/inventory/" + userId, "GET", null, false);
        }
    }
    public final Inventory inventory = new Inventory();

    // --- LOBBIES ---
    public class Lobbies {
        public String get(String lobbyId) {
            return sendRequest("/lobbies/" + lobbyId, "GET", null, false);
        }
        public String getUserLobby(String userId) {
            return sendRequest("/lobbies/user/" + userId, "GET", null, false);
        }
        public String getMine() {
            return sendRequest("/lobbies/user/@me", "GET", null, true);
        }
        public String create(Map<String, Object> options) {
            return sendRequest("/lobbies", "POST", gson.toJson(options), true);
        }
        public String join(String lobbyId) {
            return sendRequest("/lobbies/" + lobbyId + "/join", "POST", null, true);
        }
        public String leave(String lobbyId) {
            return sendRequest("/lobbies/" + lobbyId + "/leave", "POST", null, true);
        }
    }
    public final Lobbies lobbies = new Lobbies();
}
