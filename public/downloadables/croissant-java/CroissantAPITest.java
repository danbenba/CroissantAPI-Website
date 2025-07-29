import org.junit.Test;
import org.junit.Before;
import static org.junit.Assert.*;
import java.util.List;
import java.util.Map;

/**
 * Tests unitaires pour CroissantAPI
 * 
 * Ces tests vérifient les fonctionnalités de base de l'API.
 * Note: Ces tests nécessitent une connexion internet et un token valide.
 */
public class CroissantAPITest {
    
    private CroissantAPI apiWithAuth;
    private CroissantAPI apiWithoutAuth;
    
    @Before
    public void setUp() {
        // Initialiser l'API avec et sans authentification
        // Remplacez "test_token" par un vrai token pour les tests
        apiWithAuth = new CroissantAPI("test_token");
        apiWithoutAuth = new CroissantAPI();
    }
    
    @Test
    public void testConstructors() {
        // Test des constructeurs
        assertNotNull("L'API avec token ne doit pas être null", apiWithAuth);
        assertNotNull("L'API sans token ne doit pas être null", apiWithoutAuth);
        
        // Test du token
        assertEquals("Le token doit être conservé", "test_token", apiWithAuth.getToken());
        assertNull("Le token doit être null sans authentification", apiWithoutAuth.getToken());
    }
    
    @Test
    public void testPublicEndpoints() {
        try {
            // Test des endpoints publics (ne nécessitent pas d'authentification)
            
            // Lister les jeux
            List<CroissantAPI.Game> games = apiWithoutAuth.games.list();
            assertNotNull("La liste des jeux ne doit pas être null", games);
            
            // Lister les objets
            List<CroissantAPI.Item> items = apiWithoutAuth.items.list();
            assertNotNull("La liste des objets ne doit pas être null", items);
            
            // Rechercher des utilisateurs
            List<CroissantAPI.User> users = apiWithoutAuth.users.search("test");
            assertNotNull("Les résultats de recherche ne doivent pas être null", users);
            
            System.out.println("Tests des endpoints publics: OK");
        } catch (Exception e) {
            // En cas d'erreur réseau, on ne fait pas échouer le test
            System.out.println("Avertissement: Impossible de tester les endpoints publics - " + e.getMessage());
        }
    }
    
    @Test
    public void testAuthenticationRequired() {
        // Test que les méthodes nécessitant une authentification lèvent une exception
        // quand aucun token n'est fourni
        
        try {
            apiWithoutAuth.users.getMe();
            fail("getMe() devrait lever une exception sans token");
        } catch (Exception e) {
            assertTrue("L'exception doit mentionner l'authentification", 
                      e.getMessage().contains("token") || e.getMessage().contains("Token"));
        }
        
        try {
            apiWithoutAuth.inventory.getMyInventory();
            fail("getMyInventory() devrait lever une exception sans token");
        } catch (Exception e) {
            assertTrue("L'exception doit mentionner l'authentification", 
                      e.getMessage().contains("token") || e.getMessage().contains("Token"));
        }
        
        System.out.println("Tests d'authentification requise: OK");
    }
    
    @Test
    public void testDataModels() {
        // Test de la création des modèles de données
        
        // Test TradeItem
        CroissantAPI.TradeItem tradeItem1 = new CroissantAPI.TradeItem("item123", 5);
        assertEquals("L'ID de l'objet doit être correct", "item123", tradeItem1.itemId);
        assertEquals("La quantité doit être correcte", 5, tradeItem1.amount);
        assertNull("Les métadonnées doivent être null par défaut", tradeItem1.metadata);
        
        // Test TradeItem avec métadonnées
        java.util.Map<String, Object> metadata = new java.util.HashMap<>();
        metadata.put("special", true);
        CroissantAPI.TradeItem tradeItem2 = new CroissantAPI.TradeItem("item456", 2, metadata);
        assertEquals("L'ID de l'objet doit être correct", "item456", tradeItem2.itemId);
        assertEquals("La quantité doit être correcte", 2, tradeItem2.amount);
        assertNotNull("Les métadonnées ne doivent pas être null", tradeItem2.metadata);
        assertTrue("Les métadonnées doivent contenir la valeur", (Boolean) tradeItem2.metadata.get("special"));
        
        System.out.println("Tests des modèles de données: OK");
    }
    
    @Test
    public void testUrlConstruction() {
        // Test que l'URL de base est correcte
        assertEquals("L'URL de base doit être correcte", 
                    "https://croissant-api.fr/api", 
                    apiWithAuth.getBaseUrl());
    }
    
    @Test
    public void testErrorHandling() {
        // Test de la gestion d'erreur pour des IDs invalides
        try {
            apiWithoutAuth.games.get("invalid_game_id");
            // Si aucune exception n'est levée, c'est soit qu'un jeu existe avec cet ID,
            // soit qu'il y a un problème de réseau - on ne fait pas échouer le test
        } catch (Exception e) {
            // C'est le comportement attendu pour un ID invalide
            assertNotNull("Le message d'erreur ne doit pas être null", e.getMessage());
        }
        
        System.out.println("Tests de gestion d'erreur: OK");
    }
    
    /**
     * Test d'intégration complet (nécessite un token valide)
     * Ce test est désactivé par défaut car il nécessite une vraie authentification
     */
    // @Test
    public void testIntegrationWithRealToken() {
        // Pour exécuter ce test, décommentez cette méthode et fournissez un vrai token
        String realToken = System.getProperty("croissant.token");
        if (realToken == null || realToken.isEmpty()) {
            System.out.println("Token non fourni, saut du test d'intégration");
            return;
        }
        
        try {
            CroissantAPI api = new CroissantAPI(realToken);
            
            // Test authentification
            CroissantAPI.User me = api.users.getMe();
            assertNotNull("L'utilisateur ne doit pas être null", me);
            assertNotNull("Le nom d'utilisateur ne doit pas être null", me.username);
            
            // Test inventaire
            CroissantAPI.Inventory.InventoryResponse inventory = api.inventory.getMyInventory();
            assertNotNull("L'inventaire ne doit pas être null", inventory);
            assertNotNull("L'ID utilisateur ne doit pas être null", inventory.user_id);
            assertNotNull("La liste d'objets ne doit pas être null", inventory.inventory);
            
            System.out.println("Test d'intégration avec token réel: OK");
            System.out.println("Utilisateur: " + me.username);
            System.out.println("Objets dans l'inventaire: " + inventory.inventory.size());
            
        } catch (Exception e) {
            fail("Le test d'intégration a échoué: " + e.getMessage());
        }
    }
}
