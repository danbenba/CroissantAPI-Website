/**
 * Exemple d'utilisation de CroissantAPI pour Java
 * 
 * Ce fichier de test montre comment utiliser les principales fonctionnalités
 * de la bibliothèque CroissantAPI en Java.
 */
public class CroissantAPIExample {
    
    public static void main(String[] args) {
        // Exemple avec authentification
        testWithAuthentication();
        
        // Exemple sans authentification (endpoints publics)
        testWithoutAuthentication();
    }
    
    /**
     * Test des fonctionnalités nécessitant une authentification
     */
    public static void testWithAuthentication() {
        try {
            // Initialiser l'API avec un token
            CroissantAPI api = new CroissantAPI("votre_token_ici");
            
            System.out.println("=== Test avec authentification ===");
            
            // Obtenir l'utilisateur actuel
            CroissantAPI.User me = api.users.getMe();
            System.out.println("Utilisateur actuel: " + me.username);
            System.out.println("Solde: " + me.balance + " crédits");
            
            // Obtenir l'inventaire
            CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory();
            System.out.println("Objets dans l'inventaire: " + inventory.inventory.size());
            
            // Lister les jeux possédés
            java.util.List<CroissantAPI.Game> myGames = api.games.getMyOwnedGames();
            System.out.println("Jeux possédés: " + myGames.size());
            
            // Lister les objets créés
            java.util.List<CroissantAPI.Item> myItems = api.items.getMyItems();
            System.out.println("Objets créés: " + myItems.size());
            
            // Créer un lobby
            java.util.Map<String, Object> newLobby = api.lobbies.create();
            System.out.println("Lobby créé: " + newLobby);
            
        } catch (Exception e) {
            System.err.println("Erreur lors du test avec authentification: " + e.getMessage());
        }
    }
    
    /**
     * Test des fonctionnalités publiques (sans authentification)
     */
    public static void testWithoutAuthentication() {
        try {
            // Initialiser l'API sans token
            CroissantAPI api = new CroissantAPI();
            
            System.out.println("\\n=== Test sans authentification ===");
            
            // Lister tous les jeux
            java.util.List<CroissantAPI.Game> games = api.games.list();
            System.out.println("Nombre de jeux disponibles: " + games.size());
            
            if (!games.isEmpty()) {
                CroissantAPI.Game firstGame = games.get(0);
                System.out.println("Premier jeu: " + firstGame.name + " - " + firstGame.price + " crédits");
            }
            
            // Lister tous les objets
            java.util.List<CroissantAPI.Item> items = api.items.list();
            System.out.println("Nombre d'objets disponibles: " + items.size());
            
            if (!items.isEmpty()) {
                CroissantAPI.Item firstItem = items.get(0);
                System.out.println("Premier objet: " + firstItem.name + " - " + firstItem.price + " crédits");
            }
            
            // Rechercher des utilisateurs
            java.util.List<CroissantAPI.User> users = api.users.search("test");
            System.out.println("Utilisateurs trouvés avec 'test': " + users.size());
            
            // Rechercher des jeux
            java.util.List<CroissantAPI.Game> adventureGames = api.games.search("adventure");
            System.out.println("Jeux d'aventure trouvés: " + adventureGames.size());
            
        } catch (Exception e) {
            System.err.println("Erreur lors du test sans authentification: " + e.getMessage());
        }
    }
    
    /**
     * Exemple d'utilisation avancée avec gestion d'erreurs
     */
    public static void advancedExample() {
        try {
            CroissantAPI api = new CroissantAPI("votre_token_ici");
            
            // Exemple de transaction d'objet avec métadonnées
            java.util.Map<String, Object> metadata = new java.util.HashMap<>();
            metadata.put("custom_property", "special_value");
            metadata.put("rarity", "legendary");
            
            // Donner un objet avec métadonnées
            java.util.Map<String, Object> result = api.items.give("item_id", 1, "target_user_id", metadata);
            System.out.println("Résultat du don: " + result);
            
            // Démarrer un échange
            CroissantAPI.Trade trade = api.trades.startOrGetPending("autre_utilisateur_id");
            
            // Ajouter un objet à l'échange
            CroissantAPI.TradeItem tradeItem = new CroissantAPI.TradeItem("item_id", 2);
            api.trades.addItem(trade.id, tradeItem);
            
            // Approuver l'échange
            api.trades.approve(trade.id);
            
            // Créer une application OAuth2
            java.util.List<String> redirectUrls = java.util.Arrays.asList("https://example.com/callback");
            java.util.Map<String, String> app = api.oauth2.createApp("Mon Application", redirectUrls);
            System.out.println("Application créée avec client_id: " + app.get("client_id"));
            
        } catch (Exception e) {
            System.err.println("Erreur dans l'exemple avancé: " + e.getMessage());
        }
    }
}
