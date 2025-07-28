#include "croissant_api.hpp"

// Constructors for structs
Game::Game(const json& j) {
    gameId = j.value("gameId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    owner_id = j.value("owner_id", "");
    download_link = j.contains("download_link") && !j["download_link"].is_null() ? std::optional<std::string>(j["download_link"]) : std::nullopt;
    price = j.value("price", 0.0);
    showInStore = j.value("showInStore", false);
    iconHash = j.contains("iconHash") && !j["iconHash"].is_null() ? std::optional<std::string>(j["iconHash"]) : std::nullopt;
    splashHash = j.contains("splashHash") && !j["splashHash"].is_null() ? std::optional<std::string>(j["splashHash"]) : std::nullopt;
    bannerHash = j.contains("bannerHash") && !j["bannerHash"].is_null() ? std::optional<std::string>(j["bannerHash"]) : std::nullopt;
    genre = j.contains("genre") && !j["genre"].is_null() ? std::optional<std::string>(j["genre"]) : std::nullopt;
    release_date = j.contains("release_date") && !j["release_date"].is_null() ? std::optional<std::string>(j["release_date"]) : std::nullopt;
    developer = j.contains("developer") && !j["developer"].is_null() ? std::optional<std::string>(j["developer"]) : std::nullopt;
    publisher = j.contains("publisher") && !j["publisher"].is_null() ? std::optional<std::string>(j["publisher"]) : std::nullopt;
    platforms = j.contains("platforms") && !j["platforms"].is_null() ? std::optional<std::string>(j["platforms"]) : std::nullopt;
    website = j.contains("website") && !j["website"].is_null() ? std::optional<std::string>(j["website"]) : std::nullopt;
    trailer_link = j.contains("trailer_link") && !j["trailer_link"].is_null() ? std::optional<std::string>(j["trailer_link"]) : std::nullopt;
    rating = j.value("rating", 0.0);
    multiplayer = j.value("multiplayer", false);
}

User::User(const json& j) {
    userId = j.value("userId", "");
    username = j.value("username", "");
    email = j.value("email", "");
    balance = j.contains("balance") ? std::optional<double>(j["balance"]) : std::nullopt;
    verified = j.value("verified", false);
    steam_id = j.contains("steam_id") && !j["steam_id"].is_null() ? std::optional<std::string>(j["steam_id"]) : std::nullopt;
    steam_username = j.contains("steam_username") && !j["steam_username"].is_null() ? std::optional<std::string>(j["steam_username"]) : std::nullopt;
    steam_avatar_url = j.contains("steam_avatar_url") && !j["steam_avatar_url"].is_null() ? std::optional<std::string>(j["steam_avatar_url"]) : std::nullopt;
    isStudio = j.value("isStudio", false);
    admin = j.value("admin", false);
    disabled = j.contains("disabled") ? std::optional<bool>(j["disabled"]) : std::nullopt;
    google_id = j.contains("google_id") && !j["google_id"].is_null() ? std::optional<std::string>(j["google_id"]) : std::nullopt;
    discord_id = j.contains("discord_id") && !j["discord_id"].is_null() ? std::optional<std::string>(j["discord_id"]) : std::nullopt;
    haveAuthenticator = j.contains("haveAuthenticator") ? std::optional<bool>(j["haveAuthenticator"]) : std::nullopt;
    verificationKey = j.contains("verificationKey") && !j["verificationKey"].is_null() ? std::optional<std::string>(j["verificationKey"]) : std::nullopt;
}

Item::Item(const json& j) {
    itemId = j.value("itemId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    price = j.value("price", 0.0);
    owner = j.value("owner", "");
    showInStore = j.value("showInStore", false);
    iconHash = j.value("iconHash", "");
    deleted = j.value("deleted", false);
}

InventoryItem::InventoryItem(const json& j) {
    itemId = j.value("itemId", "");
    name = j.value("name", "");
    description = j.value("description", "");
    amount = j.value("amount", 0);
    iconHash = j.contains("iconHash") && !j["iconHash"].is_null() ? std::optional<std::string>(j["iconHash"]) : std::nullopt;
}

Lobby::Lobby(const json& j) {
    lobbyId = j.value("lobbyId", "");
    users.clear();
    if (j.contains("users") && j["users"].is_array()) {
        for (const auto& u : j["users"]) {
            LobbyUser user;
            user.username = u.value("username", "");
            user.user_id = u.value("user_id", "");
            user.verified = u.value("verified", false);
            user.steam_username = u.contains("steam_username") && !u["steam_username"].is_null() ? std::optional<std::string>(u["steam_username"]) : std::nullopt;
            user.steam_avatar_url = u.contains("steam_avatar_url") && !u["steam_avatar_url"].is_null() ? std::optional<std::string>(u["steam_avatar_url"]) : std::nullopt;
            user.steam_id = u.contains("steam_id") && !u["steam_id"].is_null() ? std::optional<std::string>(u["steam_id"]) : std::nullopt;
            users.push_back(user);
        }
    }
}

Studio::Studio(const json& j) {
    user_id = j.value("user_id", "");
    username = j.value("username", "");
    verified = j.value("verified", false);
    admin_id = j.value("admin_id", "");
    isAdmin = j.contains("isAdmin") ? std::optional<bool>(j["isAdmin"]) : std::nullopt;
    apiKey = j.contains("apiKey") && !j["apiKey"].is_null() ? std::optional<std::string>(j["apiKey"]) : std::nullopt;
    
    if (j.contains("users") && j["users"].is_array()) {
        std::vector<StudioUser> studioUsers;
        for (const auto& u : j["users"]) {
            StudioUser user;
            user.user_id = u.value("user_id", "");
            user.username = u.value("username", "");
            user.verified = u.value("verified", false);
            user.admin = u.value("admin", false);
            studioUsers.push_back(user);
        }
        users = studioUsers;
    }
}

Trade::Trade(const json& j) {
    id = j.value("id", "");
    fromUserId = j.value("fromUserId", "");
    toUserId = j.value("toUserId", "");
    approvedFromUser = j.value("approvedFromUser", false);
    approvedToUser = j.value("approvedToUser", false);
    status = j.value("status", "");
    createdAt = j.value("createdAt", "");
    updatedAt = j.value("updatedAt", "");
    
    fromUserItems.clear();
    if (j.contains("fromUserItems") && j["fromUserItems"].is_array()) {
        for (const auto& item : j["fromUserItems"]) {
            TradeItemDetail detail;
            detail.itemId = item.value("itemId", "");
            detail.name = item.value("name", "");
            detail.description = item.value("description", "");
            detail.iconHash = item.value("iconHash", "");
            detail.amount = item.value("amount", 0);
            fromUserItems.push_back(detail);
        }
    }
    
    toUserItems.clear();
    if (j.contains("toUserItems") && j["toUserItems"].is_array()) {
        for (const auto& item : j["toUserItems"]) {
            TradeItemDetail detail;
            detail.itemId = item.value("itemId", "");
            detail.name = item.value("name", "");
            detail.description = item.value("description", "");
            detail.iconHash = item.value("iconHash", "");
            detail.amount = item.value("amount", 0);
            toUserItems.push_back(detail);
        }
    }
}

OAuth2App::OAuth2App(const json& j) {
    client_id = j.value("client_id", "");
    client_secret = j.value("client_secret", "");
    name = j.value("name", "");
    redirect_urls.clear();
    if (j.contains("redirect_urls") && j["redirect_urls"].is_array()) {
        for (const auto& url : j["redirect_urls"]) {
            redirect_urls.push_back(url);
        }
    }
}

// --- USERS ---
std::optional<User> CroissantAPI::getMe() {
    if (token.empty()) return std::nullopt;
    auto r = cpr::Get(cpr::Url{base_url + "/users/@me"}, cpr::Bearer{token});
    if (r.status_code == 200) return User(json::parse(r.text));
    return std::nullopt;
}

std::optional<User> CroissantAPI::getUser(const std::string& userId) {
    auto r = cpr::Get(cpr::Url{base_url + "/users/" + userId});
    if (r.status_code == 200) return User(json::parse(r.text));
    return std::nullopt;
}

std::vector<User> CroissantAPI::searchUsers(const std::string& query) {
    auto r = cpr::Get(cpr::Url{base_url + "/users/search?q=" + cpr::util::urlEncode(query)});
    std::vector<User> users;
    if (r.status_code == 200) {
        for (const auto& u : json::parse(r.text)) users.emplace_back(u);
    }
    return users;
}

bool CroissantAPI::verifyUser(const std::string& userId, const std::string& verificationKey) {
    json body = {{"userId", userId}, {"verificationKey", verificationKey}};
    auto r = cpr::Post(cpr::Url{base_url + "/users/auth-verification"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}});
    return r.status_code == 200;
}

bool CroissantAPI::transferCredits(const std::string& targetUserId, double amount) {
    if (token.empty()) return false;
    json body = {{"targetUserId", targetUserId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/users/transfer-credits"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::changeUsername(const std::string& username) {
    if (token.empty()) return false;
    json body = {{"username", username}};
    auto r = cpr::Post(cpr::Url{base_url + "/users/change-username"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::changePassword(const std::string& oldPassword, const std::string& newPassword, const std::string& confirmPassword) {
    if (token.empty()) return false;
    json body = {{"oldPassword", oldPassword}, {"newPassword", newPassword}, {"confirmPassword", confirmPassword}};
    auto r = cpr::Post(cpr::Url{base_url + "/users/change-password"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

// --- GAMES ---
std::vector<Game> CroissantAPI::listGames() {
    auto r = cpr::Get(cpr::Url{base_url + "/games"});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::vector<Game> CroissantAPI::searchGames(const std::string& query) {
    auto r = cpr::Get(cpr::Url{base_url + "/games/search?q=" + cpr::util::urlEncode(query)});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::optional<Game> CroissantAPI::getGame(const std::string& gameId) {
    auto r = cpr::Get(cpr::Url{base_url + "/games/" + gameId});
    if (r.status_code == 200) return Game(json::parse(r.text));
    return std::nullopt;
}

std::vector<Game> CroissantAPI::getMyCreatedGames() {
    if (token.empty()) return {};
    auto r = cpr::Get(cpr::Url{base_url + "/games/@mine"}, cpr::Bearer{token});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::vector<Game> CroissantAPI::getMyOwnedGames() {
    if (token.empty()) return {};
    auto r = cpr::Get(cpr::Url{base_url + "/games/list/@me"}, cpr::Bearer{token});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::optional<Game> CroissantAPI::createGame(const Game& game) {
    if (token.empty()) return std::nullopt;
    json body = {
        {"name", game.name},
        {"description", game.description},
        {"price", game.price},
        {"showInStore", game.showInStore},
        {"multiplayer", game.multiplayer}
    };
    if (game.iconHash) body["iconHash"] = *game.iconHash;
    if (game.genre) body["genre"] = *game.genre;
    if (game.developer) body["developer"] = *game.developer;
    if (game.publisher) body["publisher"] = *game.publisher;
    if (game.platforms) body["platforms"] = *game.platforms;
    if (game.website) body["website"] = *game.website;
    if (game.trailer_link) body["trailer_link"] = *game.trailer_link;
    
    auto r = cpr::Post(cpr::Url{base_url + "/games"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    if (r.status_code == 200 || r.status_code == 201) {
        auto response = json::parse(r.text);
        if (response.contains("game")) return Game(response["game"]);
    }
    return std::nullopt;
}

std::optional<Game> CroissantAPI::updateGame(const std::string& gameId, const Game& game) {
    if (token.empty()) return std::nullopt;
    json body = {
        {"name", game.name},
        {"description", game.description},
        {"price", game.price},
        {"showInStore", game.showInStore},
        {"multiplayer", game.multiplayer}
    };
    if (game.iconHash) body["iconHash"] = *game.iconHash;
    if (game.genre) body["genre"] = *game.genre;
    if (game.developer) body["developer"] = *game.developer;
    if (game.publisher) body["publisher"] = *game.publisher;
    if (game.platforms) body["platforms"] = *game.platforms;
    if (game.website) body["website"] = *game.website;
    if (game.trailer_link) body["trailer_link"] = *game.trailer_link;
    
    auto r = cpr::Put(cpr::Url{base_url + "/games/" + gameId}, 
                      cpr::Body{body.dump()}, 
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Bearer{token});
    if (r.status_code == 200) return Game(json::parse(r.text));
    return std::nullopt;
}

bool CroissantAPI::buyGame(const std::string& gameId) {
    if (token.empty()) return false;
    auto r = cpr::Post(cpr::Url{base_url + "/games/" + gameId + "/buy"}, cpr::Bearer{token});
    return r.status_code == 200;
}

// --- ITEMS ---
std::vector<Item> CroissantAPI::listItems() {
    auto r = cpr::Get(cpr::Url{base_url + "/items"});
    std::vector<Item> items;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) items.emplace_back(i);
    }
    return items;
}

std::vector<Item> CroissantAPI::getMyItems() {
    if (token.empty()) return {};
    auto r = cpr::Get(cpr::Url{base_url + "/items/@mine"}, cpr::Bearer{token});
    std::vector<Item> items;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) items.emplace_back(i);
    }
    return items;
}

std::vector<Item> CroissantAPI::searchItems(const std::string& query) {
    auto r = cpr::Get(cpr::Url{base_url + "/items/search?q=" + cpr::util::urlEncode(query)});
    std::vector<Item> items;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) items.emplace_back(i);
    }
    return items;
}

std::optional<Item> CroissantAPI::getItem(const std::string& itemId) {
    auto r = cpr::Get(cpr::Url{base_url + "/items/" + itemId});
    if (r.status_code == 200) return Item(json::parse(r.text));
    return std::nullopt;
}

bool CroissantAPI::createItem(const std::string& name, const std::string& description, double price, const std::string& iconHash, bool showInStore) {
    if (token.empty()) return false;
    json body = {
        {"name", name},
        {"description", description},
        {"price", price},
        {"showInStore", showInStore}
    };
    if (!iconHash.empty()) body["iconHash"] = iconHash;
    
    auto r = cpr::Post(cpr::Url{base_url + "/items/create"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200 || r.status_code == 201;
}

bool CroissantAPI::updateItem(const std::string& itemId, const Item& item) {
    if (token.empty()) return false;
    json body = {
        {"name", item.name},
        {"description", item.description},
        {"price", item.price},
        {"showInStore", item.showInStore},
        {"iconHash", item.iconHash}
    };
    
    auto r = cpr::Put(cpr::Url{base_url + "/items/update/" + itemId}, 
                      cpr::Body{body.dump()}, 
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::deleteItem(const std::string& itemId) {
    if (token.empty()) return false;
    auto r = cpr::Delete(cpr::Url{base_url + "/items/delete/" + itemId}, cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::buyItem(const std::string& itemId, int amount) {
    if (token.empty()) return false;
    json body = {{"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/buy/" + itemId}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::sellItem(const std::string& itemId, int amount) {
    if (token.empty()) return false;
    json body = {{"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/sell/" + itemId}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::giveItem(const std::string& itemId, int amount) {
    if (token.empty()) return false;
    json body = {{"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/give/" + itemId}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::consumeItem(const std::string& itemId, int amount) {
    if (token.empty()) return false;
    json body = {{"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/consume/" + itemId}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::dropItem(const std::string& itemId, int amount) {
    if (token.empty()) return false;
    json body = {{"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/drop/" + itemId}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

// --- INVENTORY ---
std::vector<InventoryItem> CroissantAPI::getMyInventory() {
    if (token.empty()) return {};
    auto r = cpr::Get(cpr::Url{base_url + "/inventory/@me"}, cpr::Bearer{token});
    std::vector<InventoryItem> inventory;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) inventory.emplace_back(i);
    }
    return inventory;
}

std::vector<InventoryItem> CroissantAPI::getInventory(const std::string& userId) {
    auto r = cpr::Get(cpr::Url{base_url + "/inventory/" + userId});
    std::vector<InventoryItem> inventory;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) inventory.emplace_back(i);
    }
    return inventory;
}

// --- LOBBIES ---
bool CroissantAPI::createLobby() {
    if (token.empty()) return false;
    auto r = cpr::Post(cpr::Url{base_url + "/lobbies"}, cpr::Bearer{token});
    return r.status_code == 200 || r.status_code == 201;
}

std::optional<Lobby> CroissantAPI::getLobby(const std::string& lobbyId) {
    auto r = cpr::Get(cpr::Url{base_url + "/lobbies/" + lobbyId});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

std::optional<Lobby> CroissantAPI::getMyLobby() {
    if (token.empty()) return std::nullopt;
    auto r = cpr::Get(cpr::Url{base_url + "/lobbies/user/@me"}, cpr::Bearer{token});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

std::optional<Lobby> CroissantAPI::getUserLobby(const std::string& userId) {
    auto r = cpr::Get(cpr::Url{base_url + "/lobbies/user/" + userId});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

bool CroissantAPI::joinLobby(const std::string& lobbyId) {
    if (token.empty()) return false;
    auto r = cpr::Post(cpr::Url{base_url + "/lobbies/" + lobbyId + "/join"}, cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::leaveLobby(const std::string& lobbyId) {
    if (token.empty()) return false;
    auto r = cpr::Post(cpr::Url{base_url + "/lobbies/" + lobbyId + "/leave"}, cpr::Bearer{token});
    return r.status_code == 200;
}

// --- STUDIOS ---
bool CroissantAPI::createStudio(const std::string& studioName) {
    if (token.empty()) return false;
    json body = {{"studioName", studioName}};
    auto r = cpr::Post(cpr::Url{base_url + "/studios"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200 || r.status_code == 201;
}

std::optional<Studio> CroissantAPI::getStudio(const std::string& studioId) {
    auto r = cpr::Get(cpr::Url{base_url + "/studios/" + studioId});
    if (r.status_code == 200) return Studio(json::parse(r.text));
    return std::nullopt;
}

std::vector<Studio> CroissantAPI::getMyStudios() {
    if (token.empty()) return {};
    auto r = cpr::Get(cpr::Url{base_url + "/studios/user/@me"}, cpr::Bearer{token});
    std::vector<Studio> studios;
    if (r.status_code == 200) {
        for (const auto& s : json::parse(r.text)) studios.emplace_back(s);
    }
    return studios;
}

bool CroissantAPI::addUserToStudio(const std::string& studioId, const std::string& userId) {
    if (token.empty()) return false;
    json body = {{"userId", userId}};
    auto r = cpr::Post(cpr::Url{base_url + "/studios/" + studioId + "/add-user"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::removeUserFromStudio(const std::string& studioId, const std::string& userId) {
    if (token.empty()) return false;
    json body = {{"userId", userId}};
    auto r = cpr::Post(cpr::Url{base_url + "/studios/" + studioId + "/remove-user"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

// --- TRADES ---
std::optional<Trade> CroissantAPI::startOrGetPendingTrade(const std::string& userId) {
    if (token.empty()) return std::nullopt;
    auto r = cpr::Post(cpr::Url{base_url + "/trades/start-or-latest/" + userId}, cpr::Bearer{token});
    if (r.status_code == 200) return Trade(json::parse(r.text));
    return std::nullopt;
}

std::optional<Trade> CroissantAPI::getTrade(const std::string& tradeId) {
    if (token.empty()) return std::nullopt;
    auto r = cpr::Get(cpr::Url{base_url + "/trades/" + tradeId}, cpr::Bearer{token});
    if (r.status_code == 200) return Trade(json::parse(r.text));
    return std::nullopt;
}

std::vector<Trade> CroissantAPI::getMyTrades() {
    if (token.empty()) return {};
    auto r = cpr::Get(cpr::Url{base_url + "/trades/user/@me"}, cpr::Bearer{token});
    std::vector<Trade> trades;
    if (r.status_code == 200) {
        for (const auto& t : json::parse(r.text)) trades.emplace_back(t);
    }
    return trades;
}

bool CroissantAPI::addItemToTrade(const std::string& tradeId, const TradeItem& tradeItem) {
    if (token.empty()) return false;
    json body = {{"tradeItem", {{"itemId", tradeItem.itemId}, {"amount", tradeItem.amount}}}};
    auto r = cpr::Post(cpr::Url{base_url + "/trades/" + tradeId + "/add-item"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::removeItemFromTrade(const std::string& tradeId, const TradeItem& tradeItem) {
    if (token.empty()) return false;
    json body = {{"tradeItem", {{"itemId", tradeItem.itemId}, {"amount", tradeItem.amount}}}};
    auto r = cpr::Post(cpr::Url{base_url + "/trades/" + tradeId + "/remove-item"}, 
                       cpr::Body{body.dump()}, 
                       cpr::Header{{"Content-Type", "application/json"}},
                       cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::approveTrade(const std::string& tradeId) {
    if (token.empty()) return false;
    auto r = cpr::Put(cpr::Url{base_url + "/trades/" + tradeId + "/approve"}, cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::cancelTrade(const std::string& tradeId) {
    if (token.empty()) return false;
    auto r = cpr::Put(cpr::Url{base_url + "/trades/" + tradeId + "/cancel"}, cpr::Bearer{token});
    return r.status_code == 200;
}

// --- SEARCH ---
json CroissantAPI::globalSearch(const std::string& query) {
    auto r = cpr::Get(cpr::Url{base_url + "/search?q=" + cpr::util::urlEncode(query)});
    if (r.status_code == 200) return json::parse(r.text);
    return json::object();
}
