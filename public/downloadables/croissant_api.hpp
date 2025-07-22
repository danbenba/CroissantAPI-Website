#pragma once
#include <string>
#include <vector>
#include <optional>
#include <nlohmann/json.hpp>
#include <cpr/cpr.h>

using json = nlohmann::json;

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
};

struct User {
    std::string userId;
    std::string username;
    std::string avatar;
    std::string discriminator;
    int public_flags;
    int flags;
    std::string banner;
    std::optional<int> accent_color;
    std::string global_name;
    double balance;
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
};

struct InventoryItem {
    std::string name;
    std::string description;
    std::string itemId;
    int amount;
};

struct Inventory {
    std::string user_id;
    std::vector<InventoryItem> inventory;
};

struct Lobby {
    std::string lobbyId;
    std::vector<std::string> users;
};

struct Studio {
    std::string studio_id;
    std::string name;
    std::string admin_id;
    std::vector<User> users;
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
    std::optional<User> createUser(const User& user);
    std::optional<User> getUserBySteamId(const std::string& steamId);

    // --- GAMES ---
    std::vector<Game> listGames();
    std::optional<Game> getGame(const std::string& gameId);
    std::vector<Game> listMine();
    std::vector<Game> listOwned();
    std::vector<Game> listOwnedByUser(const std::string& userId);
    std::optional<Game> createGame(const Game& game);
    std::optional<Game> updateGame(const std::string& gameId, const Game& game);
    bool deleteGame(const std::string& gameId);

    // --- ITEMS ---
    std::vector<Item> listItems();
    std::vector<Item> listMineItems();
    std::optional<Item> getItem(const std::string& itemId);
    std::optional<Item> createItem(const Item& item);
    std::optional<Item> updateItem(const std::string& itemId, const Item& item);
    bool deleteItem(const std::string& itemId);
    bool buyItem(const std::string& itemId, int amount);
    bool sellItem(const std::string& itemId, int amount);
    bool giveItem(const std::string& itemId, int amount);
    bool consumeItem(const std::string& itemId, int amount);
    bool dropItem(const std::string& itemId, int amount);
    bool transferItem(const std::string& itemId, int amount, const std::string& targetUserId);

    // --- INVENTORY ---
    std::vector<InventoryItem> getInventory(const std::string& userId);

    // --- LOBBIES ---
    std::optional<Lobby> getLobby(const std::string& lobbyId);
    std::optional<Lobby> getUserLobby(const std::string& userId);
    std::optional<Lobby> getMineLobby();
    std::optional<Lobby> createLobby(const Lobby& lobby);
    bool joinLobby(const std::string& lobbyId);
    bool leaveLobby(const std::string& lobbyId);

    // --- STUDIOS ---
    std::optional<Studio> getStudio(const std::string& studioId);

    // --- OAUTH2 ---
    std::optional<User> getUserByCode(const std::string& code, const std::string& client_id, const std::string& client_secret, const std::string& redirect_uri);
};

// Les implémentations des méthodes sont à placer dans un .cpp, en utilisant cpr pour les requêtes HTTP et nlohmann/json pour la (dé)sérialisation.
