package croissantapi

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

const croissantBaseURL = "https://croissant-api.fr/api"

// --- DATA STRUCTURES ---
type User struct {
	UserId   string  `json:"userId"`
	Username string  `json:"username"`
	Balance  float64 `json:"balance"`
	// Ajoutez d'autres champs selon vos besoins
}

type InventoryItem struct {
	ItemId string `json:"itemId"`
	Name   string `json:"name"`
	Amount int    `json:"amount"`
}

type Inventory struct {
	UserId    string          `json:"user_id"`
	Inventory []InventoryItem `json:"inventory"`
}

type Game struct {
	GameId      string  `json:"gameId"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	OwnerId     string  `json:"owner_id"`
	Price       float64 `json:"price"`
	// Ajoutez d'autres champs selon vos besoins
}

type Item struct {
	ItemId     string  `json:"itemId"`
	Name       string  `json:"name"`
	Description string `json:"description"`
	Price      float64 `json:"price"`
	Owner      string  `json:"owner"`
	ShowInStore bool   `json:"showInStore"`
	IconHash   string  `json:"iconHash"`
	Deleted    bool    `json:"deleted"`
}

type Lobby struct {
	LobbyId string   `json:"lobbyId"`
	Users   []string `json:"users"`
}

type Studio struct {
	StudioId string `json:"studio_id"`
	Name     string `json:"name"`
	AdminId  string `json:"admin_id"`
	Users    []User `json:"users"`
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
	OAuth2   *OAuth2Service
}

func NewCroissantAPI(token string) *CroissantAPI {
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
	api.OAuth2 = &OAuth2Service{api: api}
	return api
}

// --- HTTP HELPERS ---
func (api *CroissantAPI) get(path string, auth bool, result interface{}) error {
	url := fmt.Sprintf("%s/%s", croissantBaseURL, path)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return err
	}
	if auth {
		req.Header.Set("Authorization", "Bearer "+api.Token)
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API error: %s", string(body))
	}
	return json.Unmarshal(body, result)
}

func (api *CroissantAPI) post(path string, auth bool, payload interface{}, result interface{}) error {
	url := fmt.Sprintf("%s/%s", croissantBaseURL, path)
	b, _ := json.Marshal(payload)
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth {
		req.Header.Set("Authorization", "Bearer "+api.Token)
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API error: %s", string(body))
	}
	if result != nil {
		return json.Unmarshal(body, result)
	}
	return nil
}

func (api *CroissantAPI) put(path string, auth bool, payload interface{}, result interface{}) error {
	url := fmt.Sprintf("%s/%s", croissantBaseURL, path)
	b, _ := json.Marshal(payload)
	req, err := http.NewRequest("PUT", url, bytes.NewBuffer(b))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth {
		req.Header.Set("Authorization", "Bearer "+api.Token)
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API error: %s", string(body))
	}
	if result != nil {
		return json.Unmarshal(body, result)
	}
	return nil
}

func (api *CroissantAPI) delete(path string, auth bool, result interface{}) error {
	url := fmt.Sprintf("%s/%s", croissantBaseURL, path)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		return err
	}
	if auth {
		req.Header.Set("Authorization", "Bearer "+api.Token)
	}
	resp, err := api.client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	body, _ := ioutil.ReadAll(resp.Body)
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("API error: %s", string(body))
	}
	if result != nil {
		return json.Unmarshal(body, result)
	}
	return nil
}

// --- USERS SERVICE ---
type UsersService struct { api *CroissantAPI }

func (u *UsersService) GetMe() (*User, error) {
	var user User
	err := u.api.get("users/@me", true, &user)
	return &user, err
}
func (u *UsersService) GetUser(userId string) (*User, error) {
	var user User
	err := u.api.get("users/"+userId, false, &user)
	return &user, err
}
func (u *UsersService) Search(query string) ([]User, error) {
	var users []User
	path := fmt.Sprintf("users/search?q=%s", query)
	err := u.api.get(path, false, &users)
	return users, err
}
func (u *UsersService) Verify(userId, verificationKey string) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("users/auth-verification?userId=%s&verificationKey=%s", userId, verificationKey)
	err := u.api.get(path, false, &res)
	return res, err
}
func (u *UsersService) TransferCredits(targetUserId string, amount int) (map[string]interface{}, error) {
	payload := map[string]interface{}{"targetUserId": targetUserId, "amount": amount}
	var res map[string]interface{}
	err := u.api.post("users/transfer-credits", true, payload, &res)
	return res, err
}
func (u *UsersService) GetUserBySteamId(steamId string) (*User, error) {
	var user User
	path := fmt.Sprintf("users/getUserBySteamId?steamId=%s", steamId)
	err := u.api.get(path, false, &user)
	return &user, err
}

// --- GAMES SERVICE ---
type GamesService struct { api *CroissantAPI }

func (g *GamesService) List() ([]Game, error) {
	var games []Game
	err := g.api.get("games", false, &games)
	return games, err
}
func (g *GamesService) Get(gameId string) (*Game, error) {
	var game Game
	err := g.api.get("games/"+gameId, false, &game)
	return &game, err
}
func (g *GamesService) ListMine() ([]Game, error) {
	var games []Game
	err := g.api.get("games/@mine", true, &games)
	return games, err
}
func (g *GamesService) ListOwned() ([]Game, error) {
	var games []Game
	err := g.api.get("games/list/@me", true, &games)
	return games, err
}
func (g *GamesService) ListOwnedByUser(userId string) ([]Game, error) {
	var games []Game
	err := g.api.get("games/list/"+userId, false, &games)
	return games, err
}

// --- ITEMS SERVICE ---
type ItemsService struct { api *CroissantAPI }

func (i *ItemsService) List() ([]Item, error) {
	var items []Item
	err := i.api.get("items", false, &items)
	return items, err
}
func (i *ItemsService) ListMine() ([]Item, error) {
	var items []Item
	err := i.api.get("items/@mine", true, &items)
	return items, err
}
func (i *ItemsService) Get(itemId string) (*Item, error) {
	var item Item
	err := i.api.get("items/"+itemId, false, &item)
	return &item, err
}
func (i *ItemsService) Create(options map[string]interface{}) (*Item, error) {
	var item Item
	err := i.api.post("items/create", true, options, &item)
	return &item, err
}
func (i *ItemsService) Update(itemId string, options map[string]interface{}) (*Item, error) {
	var item Item
	path := fmt.Sprintf("items/update/%s", itemId)
	err := i.api.put(path, true, options, &item)
	return &item, err
}
func (i *ItemsService) Delete(itemId string) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/delete/%s", itemId)
	err := i.api.delete(path, true, &res)
	return res, err
}
func (i *ItemsService) Buy(itemId string, amount int) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/buy/%s", itemId)
	err := i.api.post(path, true, map[string]interface{}{"amount": amount}, &res)
	return res, err
}
func (i *ItemsService) Sell(itemId string, amount int) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/sell/%s", itemId)
	err := i.api.post(path, true, map[string]interface{}{"amount": amount}, &res)
	return res, err
}
func (i *ItemsService) Give(itemId string, amount int) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/give/%s", itemId)
	err := i.api.post(path, true, map[string]interface{}{"amount": amount}, &res)
	return res, err
}
func (i *ItemsService) Consume(itemId string, amount int) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/consume/%s", itemId)
	err := i.api.post(path, true, map[string]interface{}{"amount": amount}, &res)
	return res, err
}
func (i *ItemsService) Drop(itemId string, amount int) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/drop/%s", itemId)
	err := i.api.post(path, true, map[string]interface{}{"amount": amount}, &res)
	return res, err
}
func (i *ItemsService) Transfer(itemId string, amount int, targetUserId string) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("items/transfer/%s", itemId)
	payload := map[string]interface{}{"amount": amount, "targetUserId": targetUserId}
	err := i.api.post(path, true, payload, &res)
	return res, err
}

// --- INVENTORY SERVICE ---
type InventoryService struct { api *CroissantAPI }

func (inv *InventoryService) Get(userId string) (*Inventory, error) {
	var inventory Inventory
	err := inv.api.get("inventory/"+userId, false, &inventory)
	return &inventory, err
}

// --- LOBBIES SERVICE ---
type LobbiesService struct { api *CroissantAPI }

func (l *LobbiesService) Get(lobbyId string) (*Lobby, error) {
	var lobby Lobby
	err := l.api.get("lobbies/"+lobbyId, false, &lobby)
	return &lobby, err
}
func (l *LobbiesService) GetUserLobby(userId string) (*Lobby, error) {
	var lobby Lobby
	err := l.api.get("lobbies/user/"+userId, false, &lobby)
	return &lobby, err
}
func (l *LobbiesService) GetMine() (*Lobby, error) {
	var lobby Lobby
	err := l.api.get("lobbies/user/@me", true, &lobby)
	return &lobby, err
}
func (l *LobbiesService) Create(options map[string]interface{}) (*Lobby, error) {
	var lobby Lobby
	err := l.api.post("lobbies", true, options, &lobby)
	return &lobby, err
}
func (l *LobbiesService) Join(lobbyId string) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("lobbies/%s/join", lobbyId)
	err := l.api.post(path, true, nil, &res)
	return res, err
}
func (l *LobbiesService) Leave(lobbyId string) (map[string]interface{}, error) {
	var res map[string]interface{}
	path := fmt.Sprintf("lobbies/%s/leave", lobbyId)
	err := l.api.post(path, true, nil, &res)
	return res, err
}

// --- STUDIOS SERVICE ---
type StudiosService struct { api *CroissantAPI }

func (s *StudiosService) GetStudio(studioId string) (*Studio, error) {
	var studio Studio
	err := s.api.get("studios/"+studioId, false, &studio)
	return &studio, err
}

// --- OAUTH2 SERVICE ---
type OAuth2Service struct { api *CroissantAPI }

func (o *OAuth2Service) GetUserByCode(code, clientId, clientSecret, redirectUri string) (map[string]interface{}, error) {
	params := fmt.Sprintf("code=%s&client_id=%s&client_secret=%s&redirect_uri=%s", code, clientId, clientSecret, redirectUri)
	var res map[string]interface{}
	path := fmt.Sprintf("oauth2/user?%s", params)
	err := o.api.get(path, false, &res)
	return res, err
}

// --- END ---
