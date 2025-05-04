import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

/**
 * CroissantAPI Java client adapté à la structure de croissant-api.ts.
 * Les méthodes sont regroupées par catégories : users, items, inventory, games, lobbies.
 */
public class CroissantAPI {
    private static final String CROISSANT_BASE_URL = "https://croissant-api.fr/api";

    private static String sendRequest(String endpoint, String method, String jsonInputString, Map<String, String> headers) throws Exception {
        URL url = new URL(CROISSANT_BASE_URL + endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json");
        if (headers != null) {
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                conn.setRequestProperty(entry.getKey(), entry.getValue());
            }
        }
        conn.setDoOutput(jsonInputString != null);

        if (jsonInputString != null) {
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
        }

        if (conn.getResponseCode() < 200 || conn.getResponseCode() >= 300) {
            throw new RuntimeException("Failed : HTTP error code : " + conn.getResponseCode());
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), "utf-8"))) {
            String responseLine;
            while ((responseLine = br.readLine()) != null) {
                response.append(responseLine.trim());
            }
        }

        conn.disconnect();
        return response.toString();
    }

    // --- Users ---
    public static class users {
        public static String create(String userId, String username, int balance) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            body.put("username", username);
            body.put("balance", balance);
            return sendRequest("/users/create", "POST", new com.google.gson.Gson().toJson(body), null);
        }

        public static String get(String userId) throws Exception {
            return sendRequest("/users/" + userId, "GET", null, null);
        }

        public static String verify(String userId, String verificationKey) throws Exception {
            String params = "?userId=" + URLEncoder.encode(userId, "UTF-8") + "&verificationKey=" + URLEncoder.encode(verificationKey, "UTF-8");
            return sendRequest("/users/auth-verification" + params, "POST", null, null);
        }
    }

    // --- Items ---
    public static class items {
        public static String get(String itemId) throws Exception {
            String endpoint = "/items";
            if (itemId != null && !itemId.isEmpty()) {
                endpoint += "/" + itemId;
            }
            return sendRequest(endpoint, "GET", null, null);
        }
    }

    // --- Inventory ---
    public static class inventory {
        public static String get(String userId) throws Exception {
            return sendRequest("/inventory/" + userId, "GET", null, null);
        }
    }

    // --- Games ---
    public static class games {
        public static String list() throws Exception {
            return sendRequest("/games", "GET", null, null);
        }

        public static String get(String gameId) throws Exception {
            return sendRequest("/games/" + gameId, "GET", null, null);
        }

        public static String create(String name, String description, int price, boolean showInStore, String token) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("name", name);
            body.put("description", description);
            body.put("price", price);
            body.put("showInStore", showInStore);
            Map<String, String> headers = new HashMap<>();
            headers.put("Authorization", "Bearer " + token);
            return sendRequest("/games", "POST", new com.google.gson.Gson().toJson(body), headers);
        }

        public static String update(String gameId, Map<String, Object> updates) throws Exception {
            return sendRequest("/games/" + gameId, "PUT", new com.google.gson.Gson().toJson(updates), null);
        }

        public static String delete(String gameId) throws Exception {
            return sendRequest("/games/" + gameId, "DELETE", null, null);
        }
    }

    // --- Lobbies ---
    public static class lobbies {
        public static String get(String lobbyId) throws Exception {
            return sendRequest("/lobbies/" + lobbyId, "GET", null, null);
        }

        public static String getUserLobby(String userId) throws Exception {
            return sendRequest("/lobbies/user/" + userId, "GET", null, null);
        }

        public static String create(String[] users) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("users", users);
            return sendRequest("/lobbies", "POST", new com.google.gson.Gson().toJson(body), null);
        }

        public static String join(String lobbyId, String userId) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            return sendRequest("/lobbies/" + lobbyId + "/join", "POST", new com.google.gson.Gson().toJson(body), null);
        }

        public static String leave(String lobbyId, String userId) throws Exception {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", userId);
            return sendRequest("/lobbies/" + lobbyId + "/leave", "POST", new com.google.gson.Gson().toJson(body), null);
        }
    }
}