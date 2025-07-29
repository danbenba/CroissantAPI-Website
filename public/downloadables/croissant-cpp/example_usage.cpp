#include "croissant_api_new.hpp"
#include <iostream>
#include <iomanip>

using namespace CroissantAPI;

int main() {
    // Créer un client avec votre token d'authentification
    // Remplacez "your_token_here" par votre vrai token
    Client api("your_token_here");
    
    std::cout << "=== Exemple d'utilisation de la Croissant API C++ ===" << std::endl;
    
    try {
        // 1. Obtenir les informations de l'utilisateur authentifié
        std::cout << "\n--- Informations utilisateur ---" << std::endl;
        auto user = api.users.getMe();
        if (user) {
            std::cout << "Nom d'utilisateur: " << user->username << std::endl;
            std::cout << "User ID: " << user->userId << std::endl;
            std::cout << "Vérifié: " << (user->verified ? "Oui" : "Non") << std::endl;
            if (user->balance) {
                std::cout << "Solde: " << std::fixed << std::setprecision(2) 
                         << *user->balance << " crédits" << std::endl;
            }
            if (user->email) {
                std::cout << "Email: " << *user->email << std::endl;
            }
        } else {
            std::cout << "Impossible d'obtenir les informations utilisateur" << std::endl;
        }
        
        // 2. Lister et rechercher des jeux
        std::cout << "\n--- Jeux disponibles ---" << std::endl;
        auto games = api.games.list();
        std::cout << "Nombre total de jeux: " << games.size() << std::endl;
        
        // Afficher les 5 premiers jeux
        for (size_t i = 0; i < std::min(games.size(), size_t(5)); ++i) {
            const auto& game = games[i];
            std::cout << "- " << game.name << " (ID: " << game.gameId 
                     << ", Prix: " << game.price << "€)" << std::endl;
        }
        
        // Rechercher des jeux
        std::cout << "\n--- Recherche de jeux (mot-clé: 'action') ---" << std::endl;
        auto searchResults = api.games.search("action");
        std::cout << "Jeux trouvés: " << searchResults.size() << std::endl;
        for (const auto& game : searchResults) {
            std::cout << "- " << game.name << std::endl;
        }
        
        // 3. Obtenir l'inventaire
        std::cout << "\n--- Inventaire ---" << std::endl;
        auto [userId, inventory] = api.inventory.getMyInventory();
        std::cout << "Items dans l'inventaire: " << inventory.size() << std::endl;
        
        for (const auto& item : inventory) {
            std::cout << "- " << item.name << " x" << item.amount 
                     << " (Prix: " << item.price << "€)" << std::endl;
        }
        
        // 4. Lister les items disponibles
        std::cout << "\n--- Items du store ---" << std::endl;
        auto items = api.items.list();
        std::cout << "Items disponibles: " << items.size() << std::endl;
        
        // Afficher les 5 premiers items
        for (size_t i = 0; i < std::min(items.size(), size_t(5)); ++i) {
            const auto& item = items[i];
            std::cout << "- " << item.name << " (ID: " << item.itemId 
                     << ", Prix: " << item.price << "€)" << std::endl;
        }
        
        // 5. Rechercher des utilisateurs
        std::cout << "\n--- Recherche d'utilisateurs (mot-clé: 'user') ---" << std::endl;
        auto users = api.users.search("user");
        std::cout << "Utilisateurs trouvés: " << users.size() << std::endl;
        for (size_t i = 0; i < std::min(users.size(), size_t(3)); ++i) {
            const auto& foundUser = users[i];
            std::cout << "- " << foundUser.username << " (ID: " << foundUser.userId 
                     << ", Vérifié: " << (foundUser.verified ? "Oui" : "Non") << ")" << std::endl;
        }
        
        // 6. Obtenir les jeux créés par l'utilisateur
        std::cout << "\n--- Mes jeux créés ---" << std::endl;
        auto myGames = api.games.getMyCreatedGames();
        std::cout << "Jeux créés: " << myGames.size() << std::endl;
        for (const auto& game : myGames) {
            std::cout << "- " << game.name << " (ID: " << game.gameId << ")" << std::endl;
        }
        
        // 7. Obtenir les jeux possédés
        std::cout << "\n--- Mes jeux possédés ---" << std::endl;
        auto ownedGames = api.games.getMyOwnedGames();
        std::cout << "Jeux possédés: " << ownedGames.size() << std::endl;
        for (const auto& game : ownedGames) {
            std::cout << "- " << game.name << std::endl;
        }
        
        // 8. Obtenir les items créés par l'utilisateur
        std::cout << "\n--- Mes items créés ---" << std::endl;
        auto myItems = api.items.getMyItems();
        std::cout << "Items créés: " << myItems.size() << std::endl;
        for (const auto& item : myItems) {
            std::cout << "- " << item.name << " (Prix: " << item.price << "€)" << std::endl;
        }
        
        // 9. Obtenir les studios
        std::cout << "\n--- Mes studios ---" << std::endl;
        auto studios = api.studios.getMyStudios();
        std::cout << "Studios: " << studios.size() << std::endl;
        for (const auto& studio : studios) {
            std::cout << "- " << studio.username << " (ID: " << studio.user_id << ")" << std::endl;
        }
        
        // 10. Recherche globale
        std::cout << "\n--- Recherche globale ---" << std::endl;
        auto globalResults = api.globalSearch("game");
        std::cout << "Résultats de recherche globale obtenus" << std::endl;
        
        // 11. Exemple de création d'item (commenté pour éviter la création accidentelle)
        /*
        std::cout << "\n--- Création d'un item de test ---" << std::endl;
        auto createResponse = api.items.create("Item Test C++", "Description de test", 5.0, "", true);
        if (createResponse.success) {
            std::cout << "Item créé avec succès: " << createResponse.message << std::endl;
        } else {
            std::cout << "Erreur lors de la création: " << createResponse.message << std::endl;
        }
        */
        
        // 12. Exemple d'obtention d'un jeu spécifique
        if (!games.empty()) {
            std::cout << "\n--- Détails d'un jeu spécifique ---" << std::endl;
            auto gameDetails = api.games.get(games[0].gameId);
            if (gameDetails) {
                std::cout << "Jeu: " << gameDetails->name << std::endl;
                std::cout << "Description: " << gameDetails->description << std::endl;
                std::cout << "Prix: " << gameDetails->price << "€" << std::endl;
                std::cout << "Multijoueur: " << (gameDetails->multiplayer ? "Oui" : "Non") << std::endl;
                if (gameDetails->genre) {
                    std::cout << "Genre: " << *gameDetails->genre << std::endl;
                }
            }
        }
        
    } catch (const std::runtime_error& e) {
        std::cerr << "Erreur d'authentification: " << e.what() << std::endl;
        std::cerr << "Vérifiez que vous avez fourni un token valide." << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Erreur: " << e.what() << std::endl;
    }
    
    std::cout << "\n=== Fin de l'exemple ===" << std::endl;
    return 0;
}

// Fonction d'exemple pour montrer l'utilisation avec gestion d'erreurs avancée
void advancedExample() {
    Client api("your_token_here");
    
    std::cout << "\n=== Exemple avancé avec gestion d'erreurs ===" << std::endl;
    
    // Exemple de transfert de crédits avec gestion d'erreurs
    try {
        auto users = api.users.search("test");
        if (!users.empty()) {
            std::string targetUserId = users[0].userId;
            auto response = api.users.transferCredits(targetUserId, 10.0);
            
            if (response.success) {
                std::cout << "Transfert réussi: " << response.message << std::endl;
            } else {
                std::cout << "Échec du transfert: " << response.message << std::endl;
            }
        }
    } catch (const std::runtime_error& e) {
        std::cout << "Token requis pour le transfert: " << e.what() << std::endl;
    }
    
    // Exemple d'achat d'item avec gestion d'erreurs
    try {
        auto items = api.items.list();
        if (!items.empty()) {
            std::string itemId = items[0].itemId;
            auto response = api.items.buy(itemId, 1);
            
            if (response.success) {
                std::cout << "Achat réussi: " << response.message << std::endl;
            } else {
                std::cout << "Échec de l'achat: " << response.message << std::endl;
            }
        }
    } catch (const std::runtime_error& e) {
        std::cout << "Authentification requise pour l'achat: " << e.what() << std::endl;
    }
}
