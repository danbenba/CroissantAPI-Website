#include "croissant_api_new.hpp"
#include <iostream>
#include <iomanip>

using namespace CroissantAPI;

int main() {
    // Create a client with your authentication token
    // Replace "your_token_here" with your real token
    Client api("your_token_here");
    
    std::cout << "=== Croissant API C++ Usage Example ===" << std::endl;
    
    try {
        // 1. Get authenticated user information
        std::cout << "\n--- User Information ---" << std::endl;
        auto user = api.users.getMe();
        if (user) {
            std::cout << "Username: " << user->username << std::endl;
            std::cout << "User ID: " << user->userId << std::endl;
            std::cout << "Verified: " << (user->verified ? "Yes" : "No") << std::endl;
            if (user->balance) {
                std::cout << "Balance: " << std::fixed << std::setprecision(2) 
                         << *user->balance << " credits" << std::endl;
            }
            if (user->email) {
                std::cout << "Email: " << *user->email << std::endl;
            }
        } else {
            std::cout << "Unable to get user information" << std::endl;
        }
        
        // 2. List and search games
        std::cout << "\n--- Available Games ---" << std::endl;
        auto games = api.games.list();
        std::cout << "Total games: " << games.size() << std::endl;
        
        // Display first 5 games
        for (size_t i = 0; i < std::min(games.size(), size_t(5)); ++i) {
            const auto& game = games[i];
            std::cout << "- " << game.name << " (ID: " << game.gameId 
                     << ", Price: " << game.price << "€)" << std::endl;
        }
        
        // Search games
        std::cout << "\n--- Game Search (keyword: 'action') ---" << std::endl;
        auto searchResults = api.games.search("action");
        std::cout << "Games found: " << searchResults.size() << std::endl;
        for (const auto& game : searchResults) {
            std::cout << "- " << game.name << std::endl;
        }
        
        // 3. Get inventory
        std::cout << "\n--- Inventory ---" << std::endl;
        auto [userId, inventory] = api.inventory.getMyInventory();
        std::cout << "Items in inventory: " << inventory.size() << std::endl;
        
        for (const auto& item : inventory) {
            std::cout << "- " << item.name << " x" << item.amount 
                     << " (Price: " << item.price << "€)" << std::endl;
        }
        
        // 4. List available items
        std::cout << "\n--- Store Items ---" << std::endl;
        auto items = api.items.list();
        std::cout << "Available items: " << items.size() << std::endl;
        
        // Display first 5 items
        for (size_t i = 0; i < std::min(items.size(), size_t(5)); ++i) {
            const auto& item = items[i];
            std::cout << "- " << item.name << " (ID: " << item.itemId 
                     << ", Price: " << item.price << "€)" << std::endl;
        }
        
        // 5. Search users
        std::cout << "\n--- User Search (keyword: 'user') ---" << std::endl;
        auto users = api.users.search("user");
        std::cout << "Users found: " << users.size() << std::endl;
        for (size_t i = 0; i < std::min(users.size(), size_t(3)); ++i) {
            const auto& foundUser = users[i];
            std::cout << "- " << foundUser.username << " (ID: " << foundUser.userId 
                     << ", Verified: " << (foundUser.verified ? "Yes" : "No") << ")" << std::endl;
        }
        
        // 6. Get games created by user
        std::cout << "\n--- My Created Games ---" << std::endl;
        auto myGames = api.games.getMyCreatedGames();
        std::cout << "Created games: " << myGames.size() << std::endl;
        for (const auto& game : myGames) {
            std::cout << "- " << game.name << " (ID: " << game.gameId << ")" << std::endl;
        }
        
        // 7. Get owned games
        std::cout << "\n--- My Owned Games ---" << std::endl;
        auto ownedGames = api.games.getMyOwnedGames();
        std::cout << "Owned games: " << ownedGames.size() << std::endl;
        for (const auto& game : ownedGames) {
            std::cout << "- " << game.name << std::endl;
        }
        
        // 8. Get items created by user
        std::cout << "\n--- My Created Items ---" << std::endl;
        auto myItems = api.items.getMyItems();
        std::cout << "Created items: " << myItems.size() << std::endl;
        for (const auto& item : myItems) {
            std::cout << "- " << item.name << " (Price: " << item.price << "€)" << std::endl;
        }
        
        // 9. Get studios
        std::cout << "\n--- My Studios ---" << std::endl;
        auto studios = api.studios.getMyStudios();
        std::cout << "Studios: " << studios.size() << std::endl;
        for (const auto& studio : studios) {
            std::cout << "- " << studio.username << " (ID: " << studio.user_id << ")" << std::endl;
        }
        
        // 10. Global search
        std::cout << "\n--- Global Search ---" << std::endl;
        auto globalResults = api.globalSearch("game");
        std::cout << "Global search results obtained" << std::endl;
        
        // 11. Example of item creation (commented to avoid accidental creation)
        /*
        std::cout << "\n--- Creating Test Item ---" << std::endl;
        auto createResponse = api.items.create("C++ Test Item", "Test description", 5.0, "", true);
        if (createResponse.success) {
            std::cout << "Item created successfully: " << createResponse.message << std::endl;
        } else {
            std::cout << "Creation error: " << createResponse.message << std::endl;
        }
        */
        
        // 12. Example of getting specific game details
        if (!games.empty()) {
            std::cout << "\n--- Specific Game Details ---" << std::endl;
            auto gameDetails = api.games.get(games[0].gameId);
            if (gameDetails) {
                std::cout << "Game: " << gameDetails->name << std::endl;
                std::cout << "Description: " << gameDetails->description << std::endl;
                std::cout << "Price: " << gameDetails->price << "€" << std::endl;
                std::cout << "Multiplayer: " << (gameDetails->multiplayer ? "Yes" : "No") << std::endl;
                if (gameDetails->genre) {
                    std::cout << "Genre: " << *gameDetails->genre << std::endl;
                }
            }
        }
        
    } catch (const std::runtime_error& e) {
        std::cerr << "Authentication error: " << e.what() << std::endl;
        std::cerr << "Please check that you provided a valid token." << std::endl;
    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << std::endl;
    }
    
    std::cout << "\n=== End of Example ===" << std::endl;
    return 0;
}

// Example function to show usage with advanced error handling
void advancedExample() {
    Client api("your_token_here");
    
    std::cout << "\n=== Advanced Example with Error Handling ===" << std::endl;
    
    // Example of credit transfer with error handling
    try {
        auto users = api.users.search("test");
        if (!users.empty()) {
            std::string targetUserId = users[0].userId;
            auto response = api.users.transferCredits(targetUserId, 10.0);
            
            if (response.success) {
                std::cout << "Transfer successful: " << response.message << std::endl;
            } else {
                std::cout << "Transfer failed: " << response.message << std::endl;
            }
        }
    } catch (const std::runtime_error& e) {
        std::cout << "Token required for transfer: " << e.what() << std::endl;
    }
    
    // Example of item purchase with error handling
    try {
        auto items = api.items.list();
        if (!items.empty()) {
            std::string itemId = items[0].itemId;
            auto response = api.items.buy(itemId, 1);
            
            if (response.success) {
                std::cout << "Purchase successful: " << response.message << std::endl;
            } else {
                std::cout << "Purchase failed: " << response.message << std::endl;
            }
        }
    } catch (const std::runtime_error& e) {
        std::cout << "Authentication required for purchase: " << e.what() << std::endl;
    }
}
