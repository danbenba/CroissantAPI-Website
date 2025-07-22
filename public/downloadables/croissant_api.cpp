#include "croissant_api.hpp"

// --- USERS ---
std::optional<User> CroissantAPI::getMe() {
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

// --- GAMES ---
std::vector<Game> CroissantAPI::listGames() {
    auto r = cpr::Get(cpr::Url{base_url + "/games"});
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

// --- ITEMS ---
std::vector<Item> CroissantAPI::listItems() {
    auto r = cpr::Get(cpr::Url{base_url + "/items"});
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

// --- INVENTORY ---
std::vector<InventoryItem> CroissantAPI::getInventory(const std::string& userId) {
    auto r = cpr::Get(cpr::Url{base_url + "/inventory/" + userId});
    std::vector<InventoryItem> inv;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) inv.emplace_back(i);
    }
    return inv;
}

// --- LOBBIES ---
std::optional<Lobby> CroissantAPI::getLobby(const std::string& lobbyId) {
    auto r = cpr::Get(cpr::Url{base_url + "/lobbies/" + lobbyId});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

// --- STUDIOS ---
std::optional<Studio> CroissantAPI::getStudio(const std::string& studioId) {
    auto r = cpr::Get(cpr::Url{base_url + "/studios/" + studioId});
    if (r.status_code == 200) return Studio(json::parse(r.text));
    return std::nullopt;
}

// --- OAUTH2 ---
std::optional<User> CroissantAPI::getUserByCode(const std::string& code, const std::string& client_id, const std::string& client_secret, const std::string& redirect_uri) {
    json body = {
        {"code", code},
        {"client_id", client_id},
        {"client_secret", client_secret},
        {"redirect_uri", redirect_uri},
        {"grant_type", "authorization_code"}
    };
    auto r = cpr::Post(cpr::Url{base_url + "/oauth2/token"}, cpr::Body{body.dump()}, cpr::Header{{"Content-Type", "application/json"}});
    if (r.status_code == 200) return User(json::parse(r.text));
    return std::nullopt;
}

// --- USERS (suite) ---
bool CroissantAPI::verifyUser(const std::string& userId, const std::string& verificationKey) {
    auto r = cpr::Get(cpr::Url{base_url + "/users/auth-verification?userId=" + userId + "&verificationKey=" + verificationKey});
    return r.status_code == 200;
}

bool CroissantAPI::transferCredits(const std::string& targetUserId, double amount) {
    json body = {{"targetUserId", targetUserId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/users/transfer-credits"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

std::optional<User> CroissantAPI::createUser(const User& user) {
    json body = {
        {"userId", user.userId},
        {"username", user.username},
        {"avatar", user.avatar},
        {"discriminator", user.discriminator},
        {"public_flags", user.public_flags},
        {"flags", user.flags},
        {"banner", user.banner},
        {"accent_color", user.accent_color},
        {"global_name", user.global_name},
        {"balance", user.balance}
    };
    auto r = cpr::Post(cpr::Url{base_url + "/users/create"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    if (r.status_code == 200) return User(json::parse(r.text));
    return std::nullopt;
}

std::optional<User> CroissantAPI::getUserBySteamId(const std::string& steamId) {
    auto r = cpr::Get(cpr::Url{base_url + "/users/getUserBySteamId?steamId=" + steamId});
    if (r.status_code == 200) return User(json::parse(r.text));
    return std::nullopt;
}

// --- GAMES (suite) ---
std::vector<Game> CroissantAPI::listMine() {
    auto r = cpr::Get(cpr::Url{base_url + "/games/@mine"}, cpr::Bearer{token});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::vector<Game> CroissantAPI::listOwned() {
    auto r = cpr::Get(cpr::Url{base_url + "/games/list/@me"}, cpr::Bearer{token});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::vector<Game> CroissantAPI::listOwnedByUser(const std::string& userId) {
    auto r = cpr::Get(cpr::Url{base_url + "/games/list/" + userId});
    std::vector<Game> games;
    if (r.status_code == 200) {
        for (const auto& g : json::parse(r.text)) games.emplace_back(g);
    }
    return games;
}

std::optional<Game> CroissantAPI::createGame(const Game& game) {
    json body = {
        {"gameId", game.gameId},
        {"name", game.name},
        {"description", game.description},
        {"owner_id", game.owner_id},
        {"download_link", game.download_link},
        {"price", game.price},
        {"showInStore", game.showInStore},
        {"iconHash", game.iconHash},
        {"splashHash", game.splashHash},
        {"bannerHash", game.bannerHash},
        {"genre", game.genre},
        {"release_date", game.release_date},
        {"developer", game.developer},
        {"publisher", game.publisher},
        {"platforms", game.platforms},
        {"rating", game.rating},
        {"website", game.website},
        {"trailer_link", game.trailer_link},
        {"multiplayer", game.multiplayer}
    };
    auto r = cpr::Post(cpr::Url{base_url + "/games"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    if (r.status_code == 200) return Game(json::parse(r.text));
    return std::nullopt;
}

std::optional<Game> CroissantAPI::updateGame(const std::string& gameId, const Game& game) {
    json body = {
        {"name", game.name},
        {"description", game.description},
        {"price", game.price},
        {"showInStore", game.showInStore},
        {"iconHash", game.iconHash},
        {"splashHash", game.splashHash},
        {"bannerHash", game.bannerHash},
        {"genre", game.genre},
        {"release_date", game.release_date},
        {"developer", game.developer},
        {"publisher", game.publisher},
        {"platforms", game.platforms},
        {"rating", game.rating},
        {"website", game.website},
        {"trailer_link", game.trailer_link},
        {"multiplayer", game.multiplayer}
    };
    auto r = cpr::Put(cpr::Url{base_url + "/games/" + gameId},
                     cpr::Bearer{token},
                     cpr::Header{{"Content-Type", "application/json"}},
                     cpr::Body{body.dump()});
    if (r.status_code == 200) return Game(json::parse(r.text));
    return std::nullopt;
}

bool CroissantAPI::deleteGame(const std::string& gameId) {
    auto r = cpr::Delete(cpr::Url{base_url + "/games/" + gameId}, cpr::Bearer{token});
    return r.status_code == 200;
}

// --- ITEMS (suite) ---
std::vector<Item> CroissantAPI::listMineItems() {
    auto r = cpr::Get(cpr::Url{base_url + "/items/@mine"}, cpr::Bearer{token});
    std::vector<Item> items;
    if (r.status_code == 200) {
        for (const auto& i : json::parse(r.text)) items.emplace_back(i);
    }
    return items;
}

std::optional<Item> CroissantAPI::createItem(const Item& item) {
    json body = {
        {"itemId", item.itemId},
        {"name", item.name},
        {"description", item.description},
        {"price", item.price},
        {"owner", item.owner},
        {"showInStore", item.showInStore},
        {"iconHash", item.iconHash},
        {"deleted", item.deleted}
    };
    auto r = cpr::Post(cpr::Url{base_url + "/items/create"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    if (r.status_code == 200) return Item(json::parse(r.text));
    return std::nullopt;
}

std::optional<Item> CroissantAPI::updateItem(const std::string& itemId, const Item& item) {
    json body = {
        {"name", item.name},
        {"description", item.description},
        {"price", item.price},
        {"showInStore", item.showInStore},
        {"iconHash", item.iconHash},
        {"deleted", item.deleted}
    };
    auto r = cpr::Put(cpr::Url{base_url + "/items/" + itemId},
                     cpr::Bearer{token},
                     cpr::Header{{"Content-Type", "application/json"}},
                     cpr::Body{body.dump()});
    if (r.status_code == 200) return Item(json::parse(r.text));
    return std::nullopt;
}

bool CroissantAPI::deleteItem(const std::string& itemId) {
    auto r = cpr::Delete(cpr::Url{base_url + "/items/" + itemId}, cpr::Bearer{token});
    return r.status_code == 200;
}

bool CroissantAPI::buyItem(const std::string& itemId, int amount) {
    json body = {{"itemId", itemId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/buy"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

bool CroissantAPI::sellItem(const std::string& itemId, int amount) {
    json body = {{"itemId", itemId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/sell"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

bool CroissantAPI::giveItem(const std::string& itemId, int amount) {
    json body = {{"itemId", itemId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/give"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

bool CroissantAPI::consumeItem(const std::string& itemId, int amount) {
    json body = {{"itemId", itemId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/consume"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

bool CroissantAPI::dropItem(const std::string& itemId, int amount) {
    json body = {{"itemId", itemId}, {"amount", amount}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/drop"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

bool CroissantAPI::transferItem(const std::string& itemId, int amount, const std::string& targetUserId) {
    json body = {{"itemId", itemId}, {"amount", amount}, {"targetUserId", targetUserId}};
    auto r = cpr::Post(cpr::Url{base_url + "/items/transfer"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

// --- LOBBIES (suite) ---
std::optional<Lobby> CroissantAPI::getUserLobby(const std::string& userId) {
    auto r = cpr::Get(cpr::Url{base_url + "/lobbies/user/" + userId});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

std::optional<Lobby> CroissantAPI::getMineLobby() {
    auto r = cpr::Get(cpr::Url{base_url + "/lobbies/@me"}, cpr::Bearer{token});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

std::optional<Lobby> CroissantAPI::createLobby(const Lobby& lobby) {
    json body = {
        {"lobbyId", lobby.lobbyId},
        {"users", lobby.users}
    };
    auto r = cpr::Post(cpr::Url{base_url + "/lobbies"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    if (r.status_code == 200) return Lobby(json::parse(r.text));
    return std::nullopt;
}

bool CroissantAPI::joinLobby(const std::string& lobbyId) {
    json body = {{"lobbyId", lobbyId}};
    auto r = cpr::Post(cpr::Url{base_url + "/lobbies/join"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

bool CroissantAPI::leaveLobby(const std::string& lobbyId) {
    json body = {{"lobbyId", lobbyId}};
    auto r = cpr::Post(cpr::Url{base_url + "/lobbies/leave"},
                      cpr::Bearer{token},
                      cpr::Header{{"Content-Type", "application/json"}},
                      cpr::Body{body.dump()});
    return r.status_code == 200;
}

// À compléter pour chaque méthode CRUD (POST/PUT/DELETE) et actions spéciales (buy, sell, etc.) en suivant ce modèle.
