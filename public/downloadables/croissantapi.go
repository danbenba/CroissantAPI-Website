package croissantapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
)

const croissantBaseURL = "https://croissant-api.fr/api"

// --- DATA STRUCTURES ---

// Game represents a game in the Croissant API.
type Game struct {
	GameId       string  `json:"gameId"`
	Name         string  `json:"name"`
	Description  string  `json:"description"`
	OwnerId      string  `json:"owner_id"`
	DownloadLink *string `json:"download_link"`
	Price        float64 `json:"price"`
	ShowInStore  bool    `json:"showInStore"`
	IconHash     *string `json:"iconHash"`
	SplashHash   *string `json:"splashHash"`
	BannerHash   *string `json:"bannerHash"`
	Genre        *string `json:"genre"`
	ReleaseDate  *string `json:"release_date"`
	Developer    *string `json:"developer"`
	Publisher    *string `json:"publisher"`
	Platforms    *string `json:"platforms"`
	Rating       float64 `json:"rating"`
	Website      *string `json:"website"`
	TrailerLink  *string `json:"trailer_link"`
	Multiplayer  bool    `json:"multiplayer"`
}

// User represents a user in the Croissant API.
type User struct {
	UserId            string           `json:"userId"`
	Username          string           `json:"username"`
	Email             string           `json:"email"`
	Balance           *float64         `json:"balance"`
	Verified          bool             `json:"verified"`
	SteamId           *string          `json:"steam_id"`
	SteamUsername     *string          `json:"steam_username"`
	SteamAvatarUrl    *string          `json:"steam_avatar_url"`
	IsStudio          bool             `json:"isStudio"`
	Admin             bool             `json:"admin"`
	Disabled          *bool            `json:"disabled"`
	GoogleId          *string          `json:"google_id"`
	DiscordId         *string          `json:"discord_id"`
	Studios           []Studio         `json:"studios"`
	Roles             []string         `json:"roles"`
	Inventory         []InventoryItem  `json:"inventory"`
	OwnedItems        []Item           `json:"ownedItems"`
	CreatedGames      []Game           `json:"createdGames"`
	HaveAuthenticator *bool            `json:"haveAuthenticator"`
	VerificationKey   *string          `json:"verificationKey"`
}

// Item represents an item in the Croissant API.
type Item struct {
	ItemId      string  `json:"itemId"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Owner       string  `json:"owner"`
	ShowInStore bool    `json:"showInStore"`
	IconHash    string  `json:"iconHash"`
	Deleted     bool    `json:"deleted"`
}

// InventoryItem represents an item in a user's inventory.
type InventoryItem struct {
	ItemId      string  `json:"itemId"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Amount      int     `json:"amount"`
	IconHash    *string `json:"iconHash"`
}

// LobbyUser represents a user in a lobby.
type LobbyUser struct {
	Username        string  `json:"username"`
	UserId          string  `json:"user_id"`
	Verified        bool    `json:"verified"`
	SteamUsername   *string `json:"steam_username"`
	SteamAvatarUrl  *string `json:"steam_avatar_url"`
	SteamId         *string `json:"steam_id"`
}

// Lobby represents a lobby.
type Lobby struct {
	LobbyId string      `json:"lobbyId"`
	Users   []LobbyUser `json:"users"`
}

// StudioUser represents a user in a studio.
type StudioUser struct {
	UserId   string `json:"user_id"`
	Username string `json:"username"`
	Verified bool   `json:"verified"`
	Admin    bool   `json:"admin"`
}

// Studio represents a studio.
type Studio struct {
	UserId   string       `json:"user_id"`
	Username string       `json:"username"`
	Verified bool         `json:"verified"`
	AdminId  string       `json:"admin_id"`
	IsAdmin  *bool        `json:"isAdmin"`
	ApiKey   *string      `json:"apiKey"`
	Users    []StudioUser `json:"users"`
}

// TradeItem represents a trade item.
type TradeItem struct {
	ItemId string `json:"itemId"`
	Amount int    `json:"amount"`
}

// TradeItemInfo represents enriched trade item information.
type TradeItemInfo struct {
	ItemId      string `json:"itemId"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IconHash    string `json:"iconHash"`
	Amount      int    `json:"amount"`
}

// Trade represents a trade with enriched item information.
type Trade struct {
	Id                string          `json:"id"`
	FromUserId        string          `json:"fromUserId"`
	ToUserId          string          `json:"toUserId"`
	FromUserItems     []TradeItemInfo `json:"fromUserItems"`
	ToUserItems       []TradeItemInfo `json:"toUserItems"`
	ApprovedFromUser  bool            `json:"approvedFromUser"`
	ApprovedToUser    bool            `json:"approvedToUser"`
	Status            string          `json:"status"`
	CreatedAt         string          `json:"createdAt"`
	UpdatedAt         string          `json:"updatedAt"`
}

// SearchResult represents global search results.
type SearchResult struct {
	Users []User `json:"users"`
	Items []Item `json:"items"`
	Games []Game `json:"games"`
}

// --- MAIN API STRUCT ---
type CroissantAPI struct {
	Token    string
	client   *http.Client
	Users    *UsersService
	Games    *GamesService
	Items    *ItemsService
	Inventory *InventoryService
	Lobbies  *LobbiesService
	Studios  *StudiosService
	Trades   *TradesService
	Search   *SearchService
}

func NewCroissantAPI(token string) *CroissantAPI {
	if token == "" {
		panic("Token is required")
	}
	api := &CroissantAPI{
		Token:  token,
		client: &http.Client{},
	}
	api.Users = &UsersService{api: api}
	api.Games = &GamesService{api: api}
	api.Items = &ItemsService{api: api}
	api.Inventory = &InventoryService{api: api}
	api.Lobbies = &LobbiesService{api: api}
	api.Studios = &StudiosService{api: api}
	api.Trades = &TradesService{api: api}
	api.Search = &SearchService{api: api}
	return api
}

// --- HTTP HELPERS ---
func (api *CroissantAPI) get(path string, auth bool, result interface{}) error {
	url := fmt.Sprintf("%s%s", croissantBaseURL, path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	if auth {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", api.Token))
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	return json.Unmarshal(body, result)
}

func (api *CroissantAPI) post(path string, auth bool, payload interface{}, result interface{}) error {
	url := fmt.Sprintf("%s%s", croissantBaseURL, path)
	b, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", api.Token))
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	if result != nil {
		return json.Unmarshal(body, result)
	}
	return nil
}

func (api *CroissantAPI) put(path string, auth bool, payload interface{}, result interface{}) error {
	url := fmt.Sprintf("%s%s", croissantBaseURL, path)
	b, _ := json.Marshal(payload)
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", api.Token))
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	if result != nil {
		return json.Unmarshal(body, result)
	}
	return nil
}

func (api *CroissantAPI) delete(path string, auth bool, result interface{}) error {
	url := fmt.Sprintf("%s%s", croissantBaseURL, path)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}
	if auth {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", api.Token))
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}
	if result != nil {
		return json.Unmarshal(body, result)
	}
	return nil
}

// --- USERS SERVICE ---
type UsersService struct { api *CroissantAPI }

// GetMe gets the current authenticated user's profile.
func (u *UsersService) GetMe() (*User, error) {
	var user User
	err := u.api.get("/users/@me", true, &user)
	return &user, err
}

// GetUser gets a user by userId.
func (u *UsersService) GetUser(userId string) (*User, error) {
	var user User
	err := u.api.get(fmt.Sprintf("/users/%s", userId), false, &user)
	return &user, err
}

// Search searches for users by username.
func (u *UsersService) Search(query string) ([]User, error) {
	var users []User
	err := u.api.get(fmt.Sprintf("/users/search?q=%s", url.QueryEscape(query)), false, &users)
	return users, err
}

// Verify checks the verification key for the user.
func (u *UsersService) Verify(userId, verificationKey string) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]string{"userId": userId, "verificationKey": verificationKey}
	err := u.api.post("/users/auth-verification", false, payload, &result)
	return result, err
}

// TransferCredits transfers credits from one user to another.
func (u *UsersService) TransferCredits(targetUserId string, amount int) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]interface{}{"targetUserId": targetUserId, "amount": amount}
	err := u.api.post("/users/transfer-credits", true, payload, &result)
	return result, err
}

// ChangeUsername changes the username of the authenticated user.
func (u *UsersService) ChangeUsername(username string) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]string{"username": username}
	err := u.api.post("/users/change-username", true, payload, &result)
	return result, err
}

// ChangePassword changes the password of the authenticated user.
func (u *UsersService) ChangePassword(oldPassword, newPassword, confirmPassword string) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]string{
		"oldPassword":     oldPassword,
		"newPassword":     newPassword,
		"confirmPassword": confirmPassword,
	}
	err := u.api.post("/users/change-password", true, payload, &result)
	return result, err
}

// --- GAMES SERVICE ---
type GamesService struct { api *CroissantAPI }

// List gets all games visible in the store.
func (g *GamesService) List() ([]Game, error) {
	var games []Game
	err := g.api.get("/games", false, &games)
	return games, err
}

// Search searches for games by name, genre, or description.
func (g *GamesService) Search(query string) ([]Game, error) {
	var games []Game
	err := g.api.get(fmt.Sprintf("/games/search?q=%s", url.QueryEscape(query)), false, &games)
	return games, err
}

// Get gets a game by gameId.
func (g *GamesService) Get(gameId string) (*Game, error) {
	var game Game
	err := g.api.get(fmt.Sprintf("/games/%s", gameId), false, &game)
	return &game, err
}

// GetMyCreatedGames gets all games created by the authenticated user.
func (g *GamesService) GetMyCreatedGames() ([]Game, error) {
	var games []Game
	err := g.api.get("/games/@mine", true, &games)
	return games, err
}

// GetMyOwnedGames gets all games owned by the authenticated user.
func (g *GamesService) GetMyOwnedGames() ([]Game, error) {
	var games []Game
	err := g.api.get("/games/list/@me", true, &games)
	return games, err
}

// Create creates a new game.
func (g *GamesService) Create(gameData map[string]interface{}) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := g.api.post("/games", true, gameData, &result)
	return result, err
}

// Update updates an existing game.
func (g *GamesService) Update(gameId string, gameData map[string]interface{}) (*Game, error) {
	var game Game
	err := g.api.put(fmt.Sprintf("/games/%s", gameId), true, gameData, &game)
	return &game, err
}

// Buy buys a game.
func (g *GamesService) Buy(gameId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := g.api.post(fmt.Sprintf("/games/%s/buy", gameId), true, nil, &result)
	return result, err
}

// --- ITEMS SERVICE ---
type ItemsService struct { api *CroissantAPI }

// List gets all non-deleted items visible in store.
func (i *ItemsService) List() ([]Item, error) {
	var items []Item
	err := i.api.get("/items", false, &items)
	return items, err
}

// GetMyItems gets all items owned by the authenticated user.
func (i *ItemsService) GetMyItems() ([]Item, error) {
	var items []Item
	err := i.api.get("/items/@mine", true, &items)
	return items, err
}

// Search searches for items by name.
func (i *ItemsService) Search(query string) ([]Item, error) {
	var items []Item
	err := i.api.get(fmt.Sprintf("/items/search?q=%s", url.QueryEscape(query)), false, &items)
	return items, err
}

// Get gets a single item by itemId.
func (i *ItemsService) Get(itemId string) (*Item, error) {
	var item Item
	err := i.api.get(fmt.Sprintf("/items/%s", itemId), false, &item)
	return &item, err
}

// Create creates a new item.
func (i *ItemsService) Create(itemData map[string]interface{}) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := i.api.post("/items/create", true, itemData, &result)
	return result, err
}

// Update updates an existing item.
func (i *ItemsService) Update(itemId string, itemData map[string]interface{}) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := i.api.put(fmt.Sprintf("/items/update/%s", itemId), true, itemData, &result)
	return result, err
}

// Delete deletes an item.
func (i *ItemsService) Delete(itemId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := i.api.delete(fmt.Sprintf("/items/delete/%s", itemId), true, &result)
	return result, err
}

// Buy buys an item.
func (i *ItemsService) Buy(itemId string, amount int) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]int{"amount": amount}
	err := i.api.post(fmt.Sprintf("/items/buy/%s", itemId), true, payload, &result)
	return result, err
}

// Sell sells an item.
func (i *ItemsService) Sell(itemId string, amount int) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]int{"amount": amount}
	err := i.api.post(fmt.Sprintf("/items/sell/%s", itemId), true, payload, &result)
	return result, err
}

// Give gives item occurrences to a user.
func (i *ItemsService) Give(itemId string, amount int) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]int{"amount": amount}
	err := i.api.post(fmt.Sprintf("/items/give/%s", itemId), true, payload, &result)
	return result, err
}

// Consume consumes item occurrences from a user.
func (i *ItemsService) Consume(itemId string, amount int) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]int{"amount": amount}
	err := i.api.post(fmt.Sprintf("/items/consume/%s", itemId), true, payload, &result)
	return result, err
}

// Drop drops item occurrences from your inventory.
func (i *ItemsService) Drop(itemId string, amount int) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]int{"amount": amount}
	err := i.api.post(fmt.Sprintf("/items/drop/%s", itemId), true, payload, &result)
	return result, err
}

// --- INVENTORY SERVICE ---
type InventoryService struct { api *CroissantAPI }

// GetMyInventory gets the inventory of the authenticated user.
func (inv *InventoryService) GetMyInventory() ([]InventoryItem, error) {
	var inventory []InventoryItem
	err := inv.api.get("/inventory/@me", true, &inventory)
	return inventory, err
}

// Get gets the inventory of a user.
func (inv *InventoryService) Get(userId string) ([]InventoryItem, error) {
	var inventory []InventoryItem
	err := inv.api.get(fmt.Sprintf("/inventory/%s", userId), false, &inventory)
	return inventory, err
}

// --- LOBBIES SERVICE ---
type LobbiesService struct { api *CroissantAPI }

// Create creates a new lobby.
func (l *LobbiesService) Create() (map[string]interface{}, error) {
	var result map[string]interface{}
	err := l.api.post("/lobbies", true, nil, &result)
	return result, err
}

// Get gets a lobby by lobbyId.
func (l *LobbiesService) Get(lobbyId string) (*Lobby, error) {
	var lobby Lobby
	err := l.api.get(fmt.Sprintf("/lobbies/%s", lobbyId), false, &lobby)
	return &lobby, err
}

// GetMyLobby gets the lobby the authenticated user is in.
func (l *LobbiesService) GetMyLobby() (*Lobby, error) {
	var lobby Lobby
	err := l.api.get("/lobbies/user/@me", true, &lobby)
	return &lobby, err
}

// GetUserLobby gets the lobby a user is in.
func (l *LobbiesService) GetUserLobby(userId string) (*Lobby, error) {
	var lobby Lobby
	err := l.api.get(fmt.Sprintf("/lobbies/user/%s", userId), false, &lobby)
	return &lobby, err
}

// Join joins a lobby.
func (l *LobbiesService) Join(lobbyId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := l.api.post(fmt.Sprintf("/lobbies/%s/join", lobbyId), true, nil, &result)
	return result, err
}

// Leave leaves a lobby.
func (l *LobbiesService) Leave(lobbyId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := l.api.post(fmt.Sprintf("/lobbies/%s/leave", lobbyId), true, nil, &result)
	return result, err
}

// --- STUDIOS SERVICE ---
type StudiosService struct { api *CroissantAPI }

// Create creates a new studio.
func (s *StudiosService) Create(studioName string) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]string{"studioName": studioName}
	err := s.api.post("/studios", true, payload, &result)
	return result, err
}

// Get gets a studio by studioId.
func (s *StudiosService) Get(studioId string) (*Studio, error) {
	var studio Studio
	err := s.api.get(fmt.Sprintf("/studios/%s", studioId), false, &studio)
	return &studio, err
}

// GetMyStudios gets all studios the authenticated user is part of.
func (s *StudiosService) GetMyStudios() ([]Studio, error) {
	var studios []Studio
	err := s.api.get("/studios/user/@me", true, &studios)
	return studios, err
}

// AddUser adds a user to a studio.
func (s *StudiosService) AddUser(studioId, userId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]string{"userId": userId}
	err := s.api.post(fmt.Sprintf("/studios/%s/add-user", studioId), true, payload, &result)
	return result, err
}

// RemoveUser removes a user from a studio.
func (s *StudiosService) RemoveUser(studioId, userId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]string{"userId": userId}
	err := s.api.post(fmt.Sprintf("/studios/%s/remove-user", studioId), true, payload, &result)
	return result, err
}

// --- TRADES SERVICE ---
type TradesService struct { api *CroissantAPI }

// StartOrGetPending starts a new trade or gets the latest pending trade with a user.
func (t *TradesService) StartOrGetPending(userId string) (*Trade, error) {
	var trade Trade
	err := t.api.post(fmt.Sprintf("/trades/start-or-latest/%s", userId), true, nil, &trade)
	return &trade, err
}

// Get gets a trade by ID with enriched item information.
func (t *TradesService) Get(tradeId string) (*Trade, error) {
	var trade Trade
	err := t.api.get(fmt.Sprintf("/trades/%s", tradeId), true, &trade)
	return &trade, err
}

// GetMyTrades gets all trades for a user with enriched item information.
func (t *TradesService) GetMyTrades() ([]Trade, error) {
	var trades []Trade
	err := t.api.get("/trades/user/@me", true, &trades)
	return trades, err
}

// AddItem adds an item to a trade.
func (t *TradesService) AddItem(tradeId string, tradeItem TradeItem) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]TradeItem{"tradeItem": tradeItem}
	err := t.api.post(fmt.Sprintf("/trades/%s/add-item", tradeId), true, payload, &result)
	return result, err
}

// RemoveItem removes an item from a trade.
func (t *TradesService) RemoveItem(tradeId string, tradeItem TradeItem) (map[string]interface{}, error) {
	var result map[string]interface{}
	payload := map[string]TradeItem{"tradeItem": tradeItem}
	err := t.api.post(fmt.Sprintf("/trades/%s/remove-item", tradeId), true, payload, &result)
	return result, err
}

// Approve approves a trade.
func (t *TradesService) Approve(tradeId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := t.api.put(fmt.Sprintf("/trades/%s/approve", tradeId), true, nil, &result)
	return result, err
}

// Cancel cancels a trade.
func (t *TradesService) Cancel(tradeId string) (map[string]interface{}, error) {
	var result map[string]interface{}
	err := t.api.put(fmt.Sprintf("/trades/%s/cancel", tradeId), true, nil, &result)
	return result, err
}

// --- SEARCH SERVICE ---
type SearchService struct { api *CroissantAPI }

// Global performs a global search across users, items, and games.
func (s *SearchService) Global(query string) (*SearchResult, error) {
	var result SearchResult
	err := s.api.get(fmt.Sprintf("/search?q=%s", url.QueryEscape(query)), false, &result)
	return &result, err
}
