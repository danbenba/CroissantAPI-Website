use serde::{Deserialize, Serialize};
use reqwest::{Client, Error, header::HeaderMap, header::AUTHORIZATION, header::CONTENT_TYPE};
use std::collections::HashMap;

const CROISSANT_BASE_URL: &str = "https://croissant-api.fr/api";

/// Game represents a game in the Croissant API.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Game {
    #[serde(rename = "gameId")]
    pub game_id: String,
    pub name: String,
    pub description: String,
    pub owner_id: String,
    pub download_link: Option<String>,
    pub price: f64,
    #[serde(rename = "showInStore")]
    pub show_in_store: bool,
    #[serde(rename = "iconHash")]
    pub icon_hash: Option<String>,
    #[serde(rename = "splashHash")]
    pub splash_hash: Option<String>,
    #[serde(rename = "bannerHash")]
    pub banner_hash: Option<String>,
    pub genre: Option<String>,
    pub release_date: Option<String>,
    pub developer: Option<String>,
    pub publisher: Option<String>,
    pub platforms: Option<String>,
    pub rating: f64,
    pub website: Option<String>,
    pub trailer_link: Option<String>,
    pub multiplayer: bool,
}

/// User represents a user in the Croissant API.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "userId")]
    pub user_id: String,
    pub username: String,
    pub email: String,
    pub balance: Option<f64>,
    pub verified: bool,
    pub steam_id: Option<String>,
    pub steam_username: Option<String>,
    pub steam_avatar_url: Option<String>,
    #[serde(rename = "isStudio")]
    pub is_studio: bool,
    pub admin: bool,
    pub disabled: Option<bool>,
    pub google_id: Option<String>,
    pub discord_id: Option<String>,
    pub studios: Option<Vec<Studio>>,
    pub roles: Option<Vec<String>>,
    pub inventory: Option<Vec<InventoryItem>>,
    #[serde(rename = "ownedItems")]
    pub owned_items: Option<Vec<Item>>,
    #[serde(rename = "createdGames")]
    pub created_games: Option<Vec<Game>>,
    #[serde(rename = "haveAuthenticator")]
    pub have_authenticator: Option<bool>,
    #[serde(rename = "verificationKey")]
    pub verification_key: Option<String>,
}

/// Item represents an item in the Croissant API.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Item {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub owner: String,
    #[serde(rename = "showInStore")]
    pub show_in_store: bool,
    #[serde(rename = "iconHash")]
    pub icon_hash: String,
    pub deleted: bool,
}

/// InventoryItem represents an item in a user's inventory.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InventoryItem {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub name: String,
    pub description: String,
    pub amount: i32,
    #[serde(rename = "iconHash")]
    pub icon_hash: Option<String>,
}

/// LobbyUser represents a user in a lobby.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LobbyUser {
    pub username: String,
    pub user_id: String,
    pub verified: bool,
    pub steam_username: Option<String>,
    pub steam_avatar_url: Option<String>,
    pub steam_id: Option<String>,
}

/// Lobby represents a lobby.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Lobby {
    #[serde(rename = "lobbyId")]
    pub lobby_id: String,
    pub users: Vec<LobbyUser>,
}

/// StudioUser represents a user in a studio.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StudioUser {
    pub user_id: String,
    pub username: String,
    pub verified: bool,
    pub admin: bool,
}

/// Studio represents a studio.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Studio {
    pub user_id: String,
    pub username: String,
    pub verified: bool,
    pub admin_id: String,
    #[serde(rename = "isAdmin")]
    pub is_admin: Option<bool>,
    #[serde(rename = "apiKey")]
    pub api_key: Option<String>,
    pub users: Option<Vec<StudioUser>>,
}

/// TradeItem represents a trade item.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TradeItem {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub amount: i32,
}

/// TradeItemInfo represents enriched trade item information.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TradeItemInfo {
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub name: String,
    pub description: String,
    #[serde(rename = "iconHash")]
    pub icon_hash: String,
    pub amount: i32,
}

/// Trade represents a trade with enriched item information.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Trade {
    pub id: String,
    #[serde(rename = "fromUserId")]
    pub from_user_id: String,
    #[serde(rename = "toUserId")]
    pub to_user_id: String,
    #[serde(rename = "fromUserItems")]
    pub from_user_items: Vec<TradeItemInfo>,
    #[serde(rename = "toUserItems")]
    pub to_user_items: Vec<TradeItemInfo>,
    #[serde(rename = "approvedFromUser")]
    pub approved_from_user: bool,
    #[serde(rename = "approvedToUser")]
    pub approved_to_user: bool,
    pub status: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: String,
}

/// SearchResult represents global search results.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchResult {
    pub users: Vec<User>,
    pub items: Vec<Item>,
    pub games: Vec<Game>,
}

/// CroissantApi provides methods to interact with the Croissant API.
pub struct CroissantApi {
    client: Client,
    token: String,
}

impl CroissantApi {
    /// Create a new CroissantApi instance with the provided token.
    pub fn new(token: String) -> Result<Self, &'static str> {
        if token.is_empty() {
            return Err("Token is required");
        }
        Ok(Self {
            client: Client::new(),
            token,
        })
    }

    fn get_headers(&self, auth: bool) -> HeaderMap {
        let mut headers = HeaderMap::new();
        headers.insert(CONTENT_TYPE, "application/json".parse().unwrap());
        if auth {
            headers.insert(AUTHORIZATION, format!("Bearer {}", self.token).parse().unwrap());
        }
        headers
    }

    // --- USERS ---

    /// Get the current authenticated user's profile, including studios, roles, inventory, owned items, and created games.
    pub async fn get_me(&self) -> Result<User, Error> {
        let url = format!("{}/users/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<User>()
            .await?;
        Ok(res)
    }

    /// Get a user by userId. userId can be a Croissant ID, Discord ID, Google ID or Steam ID.
    pub async fn get_user(&self, user_id: &str) -> Result<User, Error> {
        let url = format!("{}/users/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<User>()
            .await?;
        Ok(res)
    }

    /// Search for users by username.
    pub async fn search_users(&self, query: &str) -> Result<Vec<User>, Error> {
        let url = format!("{}/users/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<User>>()
            .await?;
        Ok(res)
    }

    /// Check the verification key for the user.
    pub async fn verify_user(&self, user_id: &str, verification_key: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/users/auth-verification", CROISSANT_BASE_URL);
        let body = serde_json::json!({
            "userId": user_id,
            "verificationKey": verification_key
        });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(false))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Transfer credits from one user to another.
    pub async fn transfer_credits(&self, target_user_id: &str, amount: f64) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/users/transfer-credits", CROISSANT_BASE_URL);
        let body = serde_json::json!({
            "targetUserId": target_user_id,
            "amount": amount
        });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Change username (authenticated user only).
    pub async fn change_username(&self, username: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/users/change-username", CROISSANT_BASE_URL);
        let body = serde_json::json!({ "username": username });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Change password (authenticated user only).
    pub async fn change_password(&self, old_password: &str, new_password: &str, confirm_password: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/users/change-password", CROISSANT_BASE_URL);
        let body = serde_json::json!({
            "oldPassword": old_password,
            "newPassword": new_password,
            "confirmPassword": confirm_password
        });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- GAMES ---

    /// List all games visible in the store.
    pub async fn list_games(&self) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    /// Search for games by name, genre, or description.
    pub async fn search_games(&self, query: &str) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    /// Get a game by gameId.
    pub async fn get_game(&self, game_id: &str) -> Result<Game, Error> {
        let url = format!("{}/games/{}", CROISSANT_BASE_URL, game_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Game>()
            .await?;
        Ok(res)
    }

    /// Get all games created by the authenticated user.
    pub async fn get_my_created_games(&self) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games/@mine", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    /// Get all games owned by the authenticated user.
    pub async fn get_my_owned_games(&self) -> Result<Vec<Game>, Error> {
        let url = format!("{}/games/list/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Game>>()
            .await?;
        Ok(res)
    }

    /// Create a new game.
    pub async fn create_game(&self, game_data: &HashMap<String, serde_json::Value>) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/games", CROISSANT_BASE_URL);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(game_data)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Update an existing game.
    pub async fn update_game(&self, game_id: &str, game_data: &HashMap<String, serde_json::Value>) -> Result<Game, Error> {
        let url = format!("{}/games/{}", CROISSANT_BASE_URL, game_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .json(game_data)
            .send()
            .await?
            .json::<Game>()
            .await?;
        Ok(res)
    }

    /// Buy a game.
    pub async fn buy_game(&self, game_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/games/{}/buy", CROISSANT_BASE_URL, game_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- ITEMS ---

    /// Get all non-deleted items visible in store.
    pub async fn list_items(&self) -> Result<Vec<Item>, Error> {
        let url = format!("{}/items", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Item>>()
            .await?;
        Ok(res)
    }

    /// Get all items owned by the authenticated user.
    pub async fn get_my_items(&self) -> Result<Vec<Item>, Error> {
        let url = format!("{}/items/@mine", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Item>>()
            .await?;
        Ok(res)
    }

    /// Search for items by name (only those visible in store).
    pub async fn search_items(&self, query: &str) -> Result<Vec<Item>, Error> {
        let url = format!("{}/items/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<Item>>()
            .await?;
        Ok(res)
    }

    /// Get a single item by itemId.
    pub async fn get_item(&self, item_id: &str) -> Result<Item, Error> {
        let url = format!("{}/items/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Item>()
            .await?;
        Ok(res)
    }

    /// Create a new item.
    pub async fn create_item(&self, item_data: &HashMap<String, serde_json::Value>) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/create", CROISSANT_BASE_URL);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(item_data)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Update an existing item.
    pub async fn update_item(&self, item_id: &str, item_data: &HashMap<String, serde_json::Value>) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/update/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .json(item_data)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Delete an item.
    pub async fn delete_item(&self, item_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/delete/{}", CROISSANT_BASE_URL, item_id);
        let res = self.client
            .delete(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Buy an item.
    pub async fn buy_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/buy/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({ "amount": amount });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Sell an item.
    pub async fn sell_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/sell/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({ "amount": amount });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Give item occurrences to a user (owner only).
    pub async fn give_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/give/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({ "amount": amount });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Consume item occurrences from a user (owner only).
    pub async fn consume_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/consume/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({ "amount": amount });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Drop item occurrences from your inventory.
    pub async fn drop_item(&self, item_id: &str, amount: i32) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/items/drop/{}", CROISSANT_BASE_URL, item_id);
        let body = serde_json::json!({ "amount": amount });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- INVENTORY ---

    /// Get the inventory of the authenticated user.
    pub async fn get_my_inventory(&self) -> Result<Vec<InventoryItem>, Error> {
        let url = format!("{}/inventory/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<InventoryItem>>()
            .await?;
        Ok(res)
    }

    /// Get the inventory of a user.
    pub async fn get_inventory(&self, user_id: &str) -> Result<Vec<InventoryItem>, Error> {
        let url = format!("{}/inventory/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Vec<InventoryItem>>()
            .await?;
        Ok(res)
    }

    // --- LOBBIES ---

    /// Create a new lobby.
    pub async fn create_lobby(&self) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/lobbies", CROISSANT_BASE_URL);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Get a lobby by lobbyId.
    pub async fn get_lobby(&self, lobby_id: &str) -> Result<Lobby, Error> {
        let url = format!("{}/lobbies/{}", CROISSANT_BASE_URL, lobby_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Lobby>()
            .await?;
        Ok(res)
    }

    /// Get the lobby the authenticated user is in.
    pub async fn get_my_lobby(&self) -> Result<Lobby, Error> {
        let url = format!("{}/lobbies/user/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Lobby>()
            .await?;
        Ok(res)
    }

    /// Get the lobby a user is in.
    pub async fn get_user_lobby(&self, user_id: &str) -> Result<Lobby, Error> {
        let url = format!("{}/lobbies/user/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Lobby>()
            .await?;
        Ok(res)
    }

    /// Join a lobby.
    pub async fn join_lobby(&self, lobby_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/lobbies/{}/join", CROISSANT_BASE_URL, lobby_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Leave a lobby.
    pub async fn leave_lobby(&self, lobby_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/lobbies/{}/leave", CROISSANT_BASE_URL, lobby_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- STUDIOS ---

    /// Create a new studio.
    pub async fn create_studio(&self, studio_name: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/studios", CROISSANT_BASE_URL);
        let body = serde_json::json!({ "studioName": studio_name });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Get a studio by studioId.
    pub async fn get_studio(&self, studio_id: &str) -> Result<Studio, Error> {
        let url = format!("{}/studios/{}", CROISSANT_BASE_URL, studio_id);
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<Studio>()
            .await?;
        Ok(res)
    }

    /// Get all studios the authenticated user is part of.
    pub async fn get_my_studios(&self) -> Result<Vec<Studio>, Error> {
        let url = format!("{}/studios/user/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Studio>>()
            .await?;
        Ok(res)
    }

    /// Add a user to a studio.
    pub async fn add_user_to_studio(&self, studio_id: &str, user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/studios/{}/add-user", CROISSANT_BASE_URL, studio_id);
        let body = serde_json::json!({ "userId": user_id });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Remove a user from a studio.
    pub async fn remove_user_from_studio(&self, studio_id: &str, user_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/studios/{}/remove-user", CROISSANT_BASE_URL, studio_id);
        let body = serde_json::json!({ "userId": user_id });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- TRADES ---

    /// Start a new trade or get the latest pending trade with a user.
    pub async fn start_or_get_pending_trade(&self, user_id: &str) -> Result<Trade, Error> {
        let url = format!("{}/trades/start-or-latest/{}", CROISSANT_BASE_URL, user_id);
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Trade>()
            .await?;
        Ok(res)
    }

    /// Get a trade by ID with enriched item information.
    pub async fn get_trade(&self, trade_id: &str) -> Result<Trade, Error> {
        let url = format!("{}/trades/{}", CROISSANT_BASE_URL, trade_id);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Trade>()
            .await?;
        Ok(res)
    }

    /// Get all trades for a user with enriched item information.
    pub async fn get_my_trades(&self) -> Result<Vec<Trade>, Error> {
        let url = format!("{}/trades/user/@me", CROISSANT_BASE_URL);
        let res = self.client
            .get(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<Vec<Trade>>()
            .await?;
        Ok(res)
    }

    /// Add an item to a trade.
    pub async fn add_item_to_trade(&self, trade_id: &str, trade_item: &TradeItem) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/add-item", CROISSANT_BASE_URL, trade_id);
        let body = serde_json::json!({ "tradeItem": trade_item });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Remove an item from a trade.
    pub async fn remove_item_from_trade(&self, trade_id: &str, trade_item: &TradeItem) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/remove-item", CROISSANT_BASE_URL, trade_id);
        let body = serde_json::json!({ "tradeItem": trade_item });
        let res = self.client
            .post(&url)
            .headers(self.get_headers(true))
            .json(&body)
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Approve a trade.
    pub async fn approve_trade(&self, trade_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/approve", CROISSANT_BASE_URL, trade_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    /// Cancel a trade.
    pub async fn cancel_trade(&self, trade_id: &str) -> Result<HashMap<String, serde_json::Value>, Error> {
        let url = format!("{}/trades/{}/cancel", CROISSANT_BASE_URL, trade_id);
        let res = self.client
            .put(&url)
            .headers(self.get_headers(true))
            .send()
            .await?
            .json::<HashMap<String, serde_json::Value>>()
            .await?;
        Ok(res)
    }

    // --- SEARCH ---

    /// Global search across users, items, and games.
    pub async fn global_search(&self, query: &str) -> Result<SearchResult, Error> {
        let url = format!("{}/search?q={}", CROISSANT_BASE_URL, urlencoding::encode(query));
        let res = self.client
            .get(&url)
            .send()
            .await?
            .json::<SearchResult>()
            .await?;
        Ok(res)
    }
}
