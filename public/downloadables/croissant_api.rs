use serde::{Deserialize, Serialize};
use reqwest::{Client, Error};

const CROISSANT_BASE_URL: &str = "https://croissant-api.fr/api";

#[derive(Debug, Serialize, Deserialize)]
pub struct Game {
    pub game_id: String,
    pub name: String,
    pub description: String,
    pub owner_id: String,
    pub download_link: Option<String>,
    pub price: f64,
    pub show_in_store: bool,
    pub icon_hash: Option<String>,
    pub splash_hash: Option<String>,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub user_id: String,
    pub username: String,
    pub avatar: String,
    pub discriminator: String,
    pub public_flags: i32,
    pub flags: i32,
    pub banner: String,
    pub accent_color: Option<i32>,
    pub global_name: String,
    pub balance: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    pub item_id: String,
    pub name: String,
    pub description: String,
    pub price: f64,
    pub owner: String,
    pub show_in_store: bool,
    pub icon_hash: String,
    pub deleted: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryItem {
    pub name: String,
    pub description: String,
    pub item_id: String,
    pub amount: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Inventory {
    pub user_id: String,
    pub inventory: Vec<InventoryItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Lobby {
    pub lobby_id: String,
    pub users: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Studio {
    pub studio_id: String,
    pub name: String,
    pub admin_id: String,
    pub users: Vec<User>,
}

pub struct CroissantApi {
    client: Client,
    token: Option<String>,
}

impl CroissantApi {
    pub fn new(token: Option<String>) -> Self {
        Self {
            client: Client::new(),
            token,
        }
    }

    pub async fn get_me(&self) -> Result<User, Error> {
        let req = self.client
            .get(format!("{}/users/@me", CROISSANT_BASE_URL));
        let req = if let Some(token) = &self.token {
            req.bearer_auth(token)
        } else {
            req
        };
        let res = req.send().await?.json::<User>().await?;
        Ok(res)
    }

    pub async fn list_games(&self) -> Result<Vec<Game>, Error> {
        let res = self.client
            .get(format!("{}/games", CROISSANT_BASE_URL))
            .send().await?
            .json::<Vec<Game>>().await?;
        Ok(res)
    }

    // --- USERS ---
    pub async fn get_user(&self, user_id: &str) -> Result<User, Error> {
        let res = self.client
            .get(format!("{}/users/{}", CROISSANT_BASE_URL, user_id))
            .send().await?
            .json::<User>().await?;
        Ok(res)
    }

    pub async fn search_users(&self, query: &str) -> Result<Vec<User>, Error> {
        let res = self.client
            .get(format!("{}/users/search?q={}", CROISSANT_BASE_URL, query))
            .send().await?
            .json::<Vec<User>>().await?;
        Ok(res)
    }

    pub async fn verify_user(&self, user_id: &str, verification_key: &str) -> Result<bool, Error> {
        let res = self.client
            .get(format!("{}/users/auth-verification?userId={}&verificationKey={}", CROISSANT_BASE_URL, user_id, verification_key))
            .send().await?;
        Ok(res.status().is_success())
    }

    pub async fn transfer_credits(&self, target_user_id: &str, amount: f64) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/users/transfer-credits", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"targetUserId": target_user_id, "amount": amount}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn create_user(&self, user: &User) -> Result<User, Error> {
        let req = self.client
            .post(format!("{}/users/create", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(user);
        let res = req.send().await?.json::<User>().await?;
        Ok(res)
    }

    pub async fn get_user_by_steam_id(&self, steam_id: &str) -> Result<User, Error> {
        let res = self.client
            .get(format!("{}/users/getUserBySteamId?steamId={}", CROISSANT_BASE_URL, steam_id))
            .send().await?
            .json::<User>().await?;
        Ok(res)
    }

    // --- GAMES ---
    pub async fn get_game(&self, game_id: &str) -> Result<Game, Error> {
        let res = self.client
            .get(format!("{}/games/{}", CROISSANT_BASE_URL, game_id))
            .send().await?
            .json::<Game>().await?;
        Ok(res)
    }

    pub async fn list_my_games(&self) -> Result<Vec<Game>, Error> {
        let req = self.client
            .get(format!("{}/games/@mine", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap());
        let res = req.send().await?.json::<Vec<Game>>().await?;
        Ok(res)
    }

    pub async fn list_owned_games(&self) -> Result<Vec<Game>, Error> {
        let req = self.client
            .get(format!("{}/games/list/@me", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap());
        let res = req.send().await?.json::<Vec<Game>>().await?;
        Ok(res)
    }

    pub async fn list_owned_games_by_user(&self, user_id: &str) -> Result<Vec<Game>, Error> {
        let res = self.client
            .get(format!("{}/games/list/{}", CROISSANT_BASE_URL, user_id))
            .send().await?
            .json::<Vec<Game>>().await?;
        Ok(res)
    }

    pub async fn create_game(&self, game: &Game) -> Result<Game, Error> {
        let req = self.client
            .post(format!("{}/games", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(game);
        let res = req.send().await?.json::<Game>().await?;
        Ok(res)
    }

    pub async fn update_game(&self, game_id: &str, game: &Game) -> Result<Game, Error> {
        let req = self.client
            .put(format!("{}/games/{}", CROISSANT_BASE_URL, game_id))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(game);
        let res = req.send().await?.json::<Game>().await?;
        Ok(res)
    }

    pub async fn delete_game(&self, game_id: &str) -> Result<String, Error> {
        let req = self.client
            .delete(format!("{}/games/{}", CROISSANT_BASE_URL, game_id))
            .bearer_auth(self.token.as_ref().unwrap());
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    // --- ITEMS ---
    pub async fn list_items(&self) -> Result<Vec<Item>, Error> {
        let res = self.client
            .get(format!("{}/items", CROISSANT_BASE_URL))
            .send().await?
            .json::<Vec<Item>>().await?;
        Ok(res)
    }

    pub async fn list_my_items(&self) -> Result<Vec<Item>, Error> {
        let req = self.client
            .get(format!("{}/items/@mine", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap());
        let res = req.send().await?.json::<Vec<Item>>().await?;
        Ok(res)
    }

    pub async fn get_item(&self, item_id: &str) -> Result<Item, Error> {
        let res = self.client
            .get(format!("{}/items/{}", CROISSANT_BASE_URL, item_id))
            .send().await?
            .json::<Item>().await?;
        Ok(res)
    }

    pub async fn create_item(&self, item: &Item) -> Result<Item, Error> {
        let req = self.client
            .post(format!("{}/items/create", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(item);
        let res = req.send().await?.json::<Item>().await?;
        Ok(res)
    }

    pub async fn update_item(&self, item_id: &str, item: &Item) -> Result<Item, Error> {
        let req = self.client
            .put(format!("{}/items/{}", CROISSANT_BASE_URL, item_id))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(item);
        let res = req.send().await?.json::<Item>().await?;
        Ok(res)
    }

    pub async fn delete_item(&self, item_id: &str) -> Result<String, Error> {
        let req = self.client
            .delete(format!("{}/items/{}", CROISSANT_BASE_URL, item_id))
            .bearer_auth(self.token.as_ref().unwrap());
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn buy_item(&self, item_id: &str, amount: i32) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/items/buy", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"itemId": item_id, "amount": amount}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn sell_item(&self, item_id: &str, amount: i32) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/items/sell", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"itemId": item_id, "amount": amount}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn give_item(&self, item_id: &str, amount: i32) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/items/give", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"itemId": item_id, "amount": amount}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn consume_item(&self, item_id: &str, amount: i32) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/items/consume", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"itemId": item_id, "amount": amount}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn drop_item(&self, item_id: &str, amount: i32) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/items/drop", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"itemId": item_id, "amount": amount}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn transfer_item(&self, item_id: &str, amount: i32, target_user_id: &str) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/items/transfer", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"itemId": item_id, "amount": amount, "targetUserId": target_user_id}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    // --- INVENTORY ---
    pub async fn get_inventory(&self, user_id: &str) -> Result<Vec<InventoryItem>, Error> {
        let res = self.client
            .get(format!("{}/inventory/{}", CROISSANT_BASE_URL, user_id))
            .send().await?
            .json::<Vec<InventoryItem>>().await?;
        Ok(res)
    }

    // --- LOBBIES ---
    pub async fn get_lobby(&self, lobby_id: &str) -> Result<Lobby, Error> {
        let res = self.client
            .get(format!("{}/lobbies/{}", CROISSANT_BASE_URL, lobby_id))
            .send().await?
            .json::<Lobby>().await?;
        Ok(res)
    }

    pub async fn get_user_lobby(&self, user_id: &str) -> Result<Lobby, Error> {
        let res = self.client
            .get(format!("{}/lobbies/user/{}", CROISSANT_BASE_URL, user_id))
            .send().await?
            .json::<Lobby>().await?;
        Ok(res)
    }

    pub async fn get_my_lobby(&self) -> Result<Lobby, Error> {
        let req = self.client
            .get(format!("{}/lobbies/@me", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap());
        let res = req.send().await?.json::<Lobby>().await?;
        Ok(res)
    }

    pub async fn create_lobby(&self, lobby: &Lobby) -> Result<Lobby, Error> {
        let req = self.client
            .post(format!("{}/lobbies", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(lobby);
        let res = req.send().await?.json::<Lobby>().await?;
        Ok(res)
    }

    pub async fn join_lobby(&self, lobby_id: &str) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/lobbies/join", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"lobbyId": lobby_id}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    pub async fn leave_lobby(&self, lobby_id: &str) -> Result<String, Error> {
        let req = self.client
            .post(format!("{}/lobbies/leave", CROISSANT_BASE_URL))
            .bearer_auth(self.token.as_ref().unwrap())
            .json(&serde_json::json!({"lobbyId": lobby_id}));
        let res = req.send().await?.text().await?;
        Ok(res)
    }

    // --- STUDIOS ---
    pub async fn get_studio(&self, studio_id: &str) -> Result<Studio, Error> {
        let res = self.client
            .get(format!("{}/studios/{}", CROISSANT_BASE_URL, studio_id))
            .send().await?
            .json::<Studio>().await?;
        Ok(res)
    }

    // --- OAUTH2 ---
    pub async fn get_user_by_code(&self, code: &str, client_id: &str, client_secret: &str, redirect_uri: &str) -> Result<User, Error> {
        let res = self.client
            .post(format!("{}/oauth2/token", CROISSANT_BASE_URL))
            .json(&serde_json::json!({
                "code": code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code"
            }))
            .send().await?
            .json::<User>().await?;
        Ok(res)
    }
}
