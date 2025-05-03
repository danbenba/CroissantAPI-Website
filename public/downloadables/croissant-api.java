import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * CroissantAPI Java client adapté à la structure de croissant-api.ts.
 */
public class CroissantAPI {
    private static final String CROISSANT_BASE_URL = "https://croissant-api.fr";

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

    // --- Utilisateurs ---
    public static String createUser(String userId, String username, int balance) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("username", username);
        body.put("balance", balance);
        return sendRequest("/users/create", "POST", new com.google.gson.Gson().toJson(body), null);
    }

    public static String getUser(String userId) throws Exception {
        return sendRequest("/users/" + userId, "GET", null, null);
    }

    // --- Items ---
    public static String getItems(String itemId) throws Exception {
        String endpoint = "/items";
        if (itemId != null && !itemId.isEmpty()) {
            endpoint += "/" + itemId;
        }
        return sendRequest(endpoint, "GET", null, null);
    }

    // --- Inventaire ---
    public static String getInventory(String userId) throws Exception {
        return sendRequest("/inventory/" + userId, "GET", null, null);
    }

    // --- Games ---
    public static String listGames() throws Exception {
        return sendRequest("/games", "GET", null, null);
    }

    public static String getGame(String gameId) throws Exception {
        return sendRequest("/games/" + gameId, "GET", null, null);
    }

    public static String createGame(String name, String description, int price, boolean showInStore, String token) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("name", name);
        body.put("description", description);
        body.put("price", price);
        body.put("showInStore", showInStore);
        Map<String, String> headers = new HashMap<>();
        headers.put("Authorization", "Bearer " + token);
        return sendRequest("/games", "POST", new com.google.gson.Gson().toJson(body), headers);
    }

    public static String updateGame(String gameId, Map<String, Object> updates) throws Exception {
        return sendRequest("/games/" + gameId, "PUT", new com.google.gson.Gson().toJson(updates), null);
    }

    public static String deleteGame(String gameId) throws Exception {
        return sendRequest("/games/" + gameId, "DELETE", null, null);
    }

    // --- Lobbies ---
    public static String getLobby(String lobbyId) throws Exception {
        return sendRequest("/lobbies/" + lobbyId, "GET", null, null);
    }

    public static String getUserLobby(String userId) throws Exception {
        return sendRequest("/lobbies/user/" + userId, "GET", null, null);
    }

    public static String createLobby(String[] users) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("users", users);
        return sendRequest("/lobbies", "POST", new com.google.gson.Gson().toJson(body), null);
    }

    public static String joinLobby(String lobbyId, String userId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        return sendRequest("/lobbies/" + lobbyId + "/join", "POST", new com.google.gson.Gson().toJson(body), null);
    }

    public static String leaveLobby(String lobbyId, String userId) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        return sendRequest("/lobbies/" + lobbyId + "/leave", "POST", new com.google.gson.Gson().toJson(body), null);
    }
}