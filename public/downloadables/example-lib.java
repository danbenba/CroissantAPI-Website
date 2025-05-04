public class ExampleLib {
    private static final String itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";

    public static void checkPremiumAccess(String userId) throws Exception {
        String inventoryResponse = CroissantAPI.inventory.get(userId);
        // Pour une vraie application, utilisez une bibliothèque JSON (ex: Gson, Jackson) pour parser la réponse.
        boolean hasItem = inventoryResponse.contains(itemId);

        if (hasItem) {
            System.out.println("Premium Commands");
            System.out.println("You have access to premium commands!");
        } else {
            System.out.println("Premium Access Required");
            System.out.println("To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.");
        }
    }

    public static String verifyUser(String userId, String verificationKey) throws Exception {
        return CroissantAPI.users.verify(userId, verificationKey);
    }

    // Exemple d'utilisation :
    // ExampleLib.checkPremiumAccess("724847846897221642");
    // System.out.println(ExampleLib.verifyUser("724847846897221642", "your_verification_key"));
}

