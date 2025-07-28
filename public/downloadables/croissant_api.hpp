#pragma once
#include <string>
#include <vector>
#include <optional>
#include <nlohmann/json.hpp>
#include <cpr/cpr.h>

using json = nlohmann::json;

struct LobbyUser {
    std::string username;
    std::string user_id;
    bool verified;
    std::optional<std::string> steam_username;
    std::optional<std::string> steam_avatar_url;
    std::optional<std::string> steam_id;
};

struct StudioUser {
    std::string user_id;
    std::string username;
    bool verified;
    bool admin;
};

struct TradeItemDetail {
    std::string itemId;
    std::string name;
    std::string description;
    std::string iconHash;
    int amount;
};

struct TradeItem {
    std::string itemId;
    int amount;
};

struct Game {
    std::string gameId;
    std::string name;
    std::string description;
    std::string owner_id;
    std::optional<std::string> download_link;
    double price;
    bool showInStore;
    std::optional<std::string> iconHash, splashHash, bannerHash, genre, release_date, developer, publisher, platforms, website, trailer_link;
    double rating;
    bool multiplayer;
    
    Game() = default;
    Game(const json& j);
};

struct User {
    std::string userId;
    std::string username;
    std::string email;
    std::optional<double> balance;
    bool verified;
    std::optional<std::string> steam_id;
    std::optional<std::string> steam_username;
    std::optional<std::string> steam_avatar_url;
    bool isStudio;
    bool admin;
    std::optional<bool> disabled;
    std::optional<std::string> google_id;
    std::optional<std::string> discord_id;
    std::optional<bool> haveAuthenticator;
    std::optional<std::string> verificationKey;
    
    User() = default;
    User(const json& j);
};

struct Item {
    std::string itemId;
    std::string name;
    std::string description;
    double price;
    std::string owner;
    bool showInStore;
    std::string iconHash;
    bool deleted;
    
    Item() = default;
    Item(const json& j);
};

struct InventoryItem {
    std::string itemId;
    std::string name;
    std::string description;
    int amount;
    std::optional<std::string> iconHash;
    
    InventoryItem() = default;
    InventoryItem(const json& j);
};

struct Lobby {
    std::string lobbyId;
    std::vector<LobbyUser> users;
    
    Lobby() = default;
    Lobby(const json& j);
};

struct Studio {
    std::string user_id;
    std::string username;
    bool verified;
    std::string admin_id;
    std::optional<bool> isAdmin;
    std::optional<std::string> apiKey;
    std::optional<std::vector<StudioUser>> users;
    
    Studio() = default;
    Studio(const json& j);
};

struct Trade {
    std::string id;
    std::string fromUserId;
    std::string toUserId;
    std::vector<TradeItemDetail> fromUserItems;
    std::vector<TradeItemDetail> toUserItems;
    bool approvedFromUser;
    bool approvedToUser;
    std::string status;
    std::string createdAt;
    std::string updatedAt;
    
    Trade() = default;
    Trade(const json& j);
};

struct OAuth2App {
    std::string client_id;
    std::string client_secret;
    std::string name;
    std::vector<std::string> redirect_urls;
    
    OAuth2App() = default;
    OAuth2App(const json& j);
};

class CroissantAPI {
    std::string token;
    const std::string base_url = "https://croissant-api.fr/api";
public:
    CroissantAPI(const std::string& token_ = "") : token(token_) {}

    // --- USERS ---
    std::optional<User> getMe();
    std::optional<User> getUser(const std::string& userId);
    std::vector<User> searchUsers(const std::string& query);
    bool verifyUser(const std::string& userId, const std::string& verificationKey);
    bool transferCredits(const std::string& targetUserId, double amount);
    bool changeUsername(const std::string& username);
    bool changePassword(const std::string& oldPassword, const std::string& newPassword, const std::string& confirmPassword);

    // --- GAMES ---
    std::vector<Game> listGames();
    std::vector<Game> searchGames(const std::string& query);
    std::optional<Game> getGame(const std::string& gameId);
    std::vector<Game> getMyCreatedGames();
    std::vector<Game> getMyOwnedGames();
    std::optional<Game> createGame(const Game& game);
    std::optional<Game> updateGame(const std::string& gameId, const Game& game);
    bool buyGame(const std::string& gameId);

    // --- ITEMS ---
    std::vector<Item> listItems();
    std::vector<Item> getMyItems();
    std::vector<Item> searchItems(const std::string& query);
    std::optional<Item> getItem(const std::string& itemId);
    bool createItem(const std::string& name, const std::string& description, double price, const std::string& iconHash = "", bool showInStore = true);
    bool updateItem(const std::string& itemId, const Item& item);
    bool deleteItem(const std::string& itemId);
    bool buyItem(const std::string& itemId, int amount);
    bool sellItem(const std::string& itemId, int amount);
    bool giveItem(const std::string& itemId, int amount);
    bool consumeItem(const std::string& itemId, int amount);
    bool dropItem(const std::string& itemId, int amount);

    // --- INVENTORY ---
    std::vector<InventoryItem> getMyInventory();
    std::vector<InventoryItem> getInventory(const std::string& userId);

    // --- LOBBIES ---
    bool createLobby();
    std::optional<Lobby> getLobby(const std::string& lobbyId);
    std::optional<Lobby> getMyLobby();
    std::optional<Lobby> getUserLobby(const std::string& userId);
    bool joinLobby(const std::string& lobbyId);
    bool leaveLobby(const std::string& lobbyId);

    // --- STUDIOS ---
    bool createStudio(const std::string& studioName);
    std::optional<Studio> getStudio(const std::string& studioId);
    std::vector<Studio> getMyStudios();
    bool addUserToStudio(const std::string& studioId, const std::string& userId);
    bool removeUserFromStudio(const std::string& studioId, const std::string& userId);

    // --- TRADES ---
    std::optional<Trade> startOrGetPendingTrade(const std::string& userId);
    std::optional<Trade> getTrade(const std::string& tradeId);
    std::vector<Trade> getMyTrades();
    bool addItemToTrade(const std::string& tradeId, const TradeItem& tradeItem);
    bool removeItemFromTrade(const std::string& tradeId, const TradeItem& tradeItem);
    bool approveTrade(const std::string& tradeId);
    bool cancelTrade(const std::string& tradeId);

    // --- SEARCH ---
    json globalSearch(const std::string& query);
};

// Les implémentations des méthodes sont à placer dans un .cpp, en utilisant cpr pour les requêtes HTTP et nlohmann/json pour la (dé)sérialisation.
