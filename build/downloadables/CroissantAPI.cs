using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using Newtonsoft.Json;

public class CroissantAPI
{
    private static readonly string CROISSANT_BASE_URL = "https://croissant-api.fr/api";
    private readonly string token;
    private readonly HttpClient http;

    public CroissantAPI(string token)
    {
        if (string.IsNullOrEmpty(token)) throw new ArgumentException("Token is required");
        this.token = token;
        this.http = new HttpClient();
    }

    // --- USERS ---
    public class Users
    {
        private readonly CroissantAPI api;
        public Users(CroissantAPI api) { this.api = api; }

        public async Task<User> GetMe()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/users/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(json);
        }

        public async Task<User> GetUser(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/users/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<User>(json);
        }

        public async Task<List<User>> Search(string query)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/users/search?q={Uri.EscapeDataString(query)}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<User>>(json);
        }

        public async Task<dynamic> Verify(string userId, string verificationKey)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/users/auth-verification?userId={Uri.EscapeDataString(userId)}&verificationKey={Uri.EscapeDataString(verificationKey)}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> TransferCredits(string targetUserId, int amount)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/users/transfer-credits");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { targetUserId, amount }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Users users => new Users(this);

    // --- GAMES ---
    public class Games
    {
        private readonly CroissantAPI api;
        public Games(CroissantAPI api) { this.api = api; }

        public async Task<List<Game>> List()
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/games");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        public async Task<Game> Get(string gameId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/games/{gameId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Game>(json);
        }

        public async Task<List<Game>> ListMine()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/games/@mine");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        public async Task<List<Game>> ListOwned()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/games/list/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        public async Task<List<Game>> ListOwnedByUser(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/games/list/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Game>>(json);
        }

        public async Task<Game> Create(object options)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/games");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(options), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Game>(json);
        }

        public async Task<Game> Update(string gameId, object options)
        {
            var req = new HttpRequestMessage(HttpMethod.Put, $"{CROISSANT_BASE_URL}/games/{gameId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(options), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Game>(json);
        }

        public async Task<dynamic> Delete(string gameId)
        {
            var req = new HttpRequestMessage(HttpMethod.Delete, $"{CROISSANT_BASE_URL}/games/{gameId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Games games => new Games(this);

    // --- ITEMS ---
    public class Items
    {
        private readonly CroissantAPI api;
        public Items(CroissantAPI api) { this.api = api; }

        public async Task<List<Item>> List()
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/items");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Item>>(json);
        }

        public async Task<List<Item>> ListMine()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/items/@mine");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<List<Item>>(json);
        }

        public async Task<Item> Get(string itemId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/items/{itemId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Item>(json);
        }

        public async Task<Item> Create(object options)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/create");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(options), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Item>(json);
        }

        public async Task<Item> Update(string itemId, object options)
        {
            var req = new HttpRequestMessage(HttpMethod.Put, $"{CROISSANT_BASE_URL}/items/update/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(options), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<Item>(json);
        }

        public async Task<dynamic> Delete(string itemId)
        {
            var req = new HttpRequestMessage(HttpMethod.Delete, $"{CROISSANT_BASE_URL}/items/delete/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Buy(string itemId, int amount)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/buy/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { amount }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Sell(string itemId, int amount)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/sell/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { amount }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Give(string itemId, int amount)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/give/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { amount }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Consume(string itemId, int amount)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/consume/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { amount }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Drop(string itemId, int amount)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/drop/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { amount }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Transfer(string itemId, int amount, string targetUserId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/items/transfer/{itemId}");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(new { amount, targetUserId }), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Items items => new Items(this);

    // --- INVENTORY ---
    public class Inventory
    {
        private readonly CroissantAPI api;
        public Inventory(CroissantAPI api) { this.api = api; }

        public async Task<dynamic> Get(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/inventory/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Inventory inventory => new Inventory(this);

    // --- LOBBIES ---
    public class Lobbies
    {
        private readonly CroissantAPI api;
        public Lobbies(CroissantAPI api) { this.api = api; }

        public async Task<dynamic> Get(string lobbyId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/lobbies/{lobbyId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> GetUserLobby(string userId)
        {
            var res = await api.http.GetAsync($"{CROISSANT_BASE_URL}/lobbies/user/{userId}");
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> GetMine()
        {
            var req = new HttpRequestMessage(HttpMethod.Get, $"{CROISSANT_BASE_URL}/lobbies/user/@me");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Create(object options)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/lobbies");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            req.Content = new StringContent(JsonConvert.SerializeObject(options), Encoding.UTF8, "application/json");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Join(string lobbyId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/lobbies/{lobbyId}/join");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }

        public async Task<dynamic> Leave(string lobbyId)
        {
            var req = new HttpRequestMessage(HttpMethod.Post, $"{CROISSANT_BASE_URL}/lobbies/{lobbyId}/leave");
            req.Headers.Add("Authorization", $"Bearer {api.token}");
            var res = await api.http.SendAsync(req);
            res.EnsureSuccessStatusCode();
            var json = await res.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject(json);
        }
    }
    public Lobbies lobbies => new Lobbies(this);
}

// --- Models ---
public class Game
{
    public string gameId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public string owner_id { get; set; }
    public string download_link { get; set; }
    public double price { get; set; }
    public bool showInStore { get; set; }
    public string iconHash { get; set; }
    public string splashHash { get; set; }
    public string bannerHash { get; set; }
    public string genre { get; set; }
    public string release_date { get; set; }
    public string developer { get; set; }
    public string publisher { get; set; }
    public string platforms { get; set; }
    public double rating { get; set; }
    public string website { get; set; }
    public string trailer_link { get; set; }
    public bool multiplayer { get; set; }
}

public class Item
{
    public string itemId { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public double price { get; set; }
    public string owner { get; set; }
    public bool showInStore { get; set; }
    public string iconHash { get; set; }
    public bool deleted { get; set; }
}

public class User
{
    public string username { get; set; }
    public string avatar { get; set; }
    public string discriminator { get; set; }
    public int public_flags { get; set; }
    public int flags { get; set; }
    public string banner { get; set; }
    public int? accent_color { get; set; }
    public string global_name { get; set; }
    public double balance { get; set; }
}