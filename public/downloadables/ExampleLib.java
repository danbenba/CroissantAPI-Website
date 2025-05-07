import com.google.gson.*;
import java.util.*;

public class ExampleLib {
    private static final String ITEM_ID = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";
    private static final String USER_ID = "724847846897221642";
    private static final String TOKEN = "your_token_here"; // Remplacez par un vrai token

    public static void checkPremiumAccess(String userId) throws Exception {
        CroissantAPI api = new CroissantAPI(TOKEN);
        String inventoryJson = api.inventory.get(userId);

        // Parse inventory JSON to check for the item
        JsonObject inventoryObj = JsonParser.parseString(inventoryJson).getAsJsonObject();
        JsonArray inventoryArr = inventoryObj.getAsJsonArray("inventory");
        boolean hasItem = false;
        for (JsonElement el : inventoryArr) {
            JsonObject item = el.getAsJsonObject();
            if (ITEM_ID.equals(item.get("item_id").getAsString())) {
                hasItem = true;
                break;
            }
        }

        if (hasItem) {
            System.out.println("Premium Commands");
            System.out.println("You have access to premium commands!");
        } else {
            System.out.println("Premium Access Required");
            System.out.println("To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.");
        }
    }

    public static void main(String[] args) throws Exception {
        checkPremiumAccess(USER_ID);
    }
}