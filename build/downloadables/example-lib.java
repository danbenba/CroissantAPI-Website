import { getInventory } from './croissant-api';

const itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";

public class PremiumCommand {
    public static void checkPremiumAccess(String userId) throws Exception {
        String inventoryResponse = getInventory(userId);
        // Assuming the response is parsed into a suitable structure
        boolean hasItem = inventoryResponse.contains(itemId); // Simplified check for the item

        if (hasItem) {
            System.out.println("Premium Commands");
            System.out.println("You have access to premium commands!");
        } else {
            System.out.println("Premium Access Required");
            System.out.println("To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.");
        }
    }
}

