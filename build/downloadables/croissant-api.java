import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

/**
 * The CroissantAPI class provides methods to interact with the Croissant API.
 * It allows users to perform various operations such as retrieving items, 
 * buying items, checking inventory, and managing items.
 */
public class CroissantAPI {
    private static final String CROISSANT_BASE_URL = "https://croissant-api.fr";

    /**
     * Sends an HTTP request to the specified endpoint with the given method and JSON input.
     *
     * @param endpoint the API endpoint to send the request to
     * @param method   the HTTP method (GET, POST, etc.)
     * @param jsonInputString the JSON input string to send in the request body
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    private static String sendRequest(String endpoint, String method, String jsonInputString) throws Exception {
        URL url = new URL(CROISSANT_BASE_URL + endpoint);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);

        if (jsonInputString != null) {
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInputString.getBytes("utf-8");
                os.write(input, 0, input.length);
            }
        }

        if (conn.getResponseCode() != HttpURLConnection.HTTP_OK) {
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

    /**
     * Retrieves items from the API.
     *
     * @param itemId the ID of the item to retrieve (optional)
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String getItems(String itemId) throws Exception {
        String endpoint = "/api/items";
        if (itemId != null) {
            endpoint += "?itemId=" + itemId;
        }
        return sendRequest(endpoint, "GET", null);
    }

    /**
     * Buys an item from the API.
     *
     * @param itemId the ID of the item to buy
     * @param amount the amount of the item to buy
     * @param token the user's authentication token
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String buyItem(String itemId, int amount, String token) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("itemId", itemId);
        body.put("amount", amount);
        body.put("token", token);
        return sendRequest("/api/buy", "POST", new com.google.gson.Gson().toJson(body));
    }

    /**
     * Checks if a user has a specific item.
     *
     * @param userId the ID of the user
     * @param itemId the ID of the item to check
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String hasItem(String userId, String itemId) throws Exception {
        String endpoint = "/api/hasItem?userId=" + userId + "&itemId=" + itemId;
        return sendRequest(endpoint, "GET", null);
    }

    /**
     * Retrieves the inventory of a user.
     *
     * @param userId the ID of the user
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String getInventory(String userId) throws Exception {
        String endpoint = "/api/inventory?userId=" + userId;
        return sendRequest(endpoint, "GET", null);
    }

    /**
     * Gives an item to a user.
     *
     * @param userId the ID of the user to give the item to
     * @param itemId the ID of the item to give
     * @param amount the amount of the item to give
     * @param token the user's authentication token
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String giveItem(String userId, String itemId, int amount, String token) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("itemId", itemId);
        body.put("amount", amount);
        body.put("token", token);
        return sendRequest("/api/giveItem", "POST", new com.google.gson.Gson().toJson(body));
    }

    /**
     * Consumes an item for a user.
     *
     * @param userId the ID of the user consuming the item
     * @param itemId the ID of the item to consume
     * @param amount the amount of the item to consume
     * @param token the user's authentication token
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String consumeItem(String userId, String itemId, int amount, String token) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("itemId", itemId);
        body.put("amount", amount);
        body.put("token", token);
        return sendRequest("/api/consumeItem", "DELETE", new com.google.gson.Gson().toJson(body));
    }

    /**
     * Opens a bundle for a user.
     *
     * @param userId the ID of the user opening the bundle
     * @param bundleId the ID of the bundle to open
     * @param amount the amount of the bundle to open
     * @param token the user's authentication token
     * @return the response from the API as a String
     * @throws Exception if an error occurs during the request
     */
    public static String openBundle(String userId, String bundleId, int amount, String token) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("userId", userId);
        body.put("bundleId", bundleId);
        body.put("amount", amount);
        body.put("token", token);
        return sendRequest("/api/openBundle", "PUT", new com.google.gson.Gson().toJson(body));
    }
}
