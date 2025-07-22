import requests
from dataclasses import dataclass, field

CROISSANT_BASE_URL = 'https://croissant-api.fr/api'


@dataclass
class CroissantAPI:
    token: str

    users: object = field(init=False)
    games: object = field(init=False)
    items: object = field(init=False)
    inventory: object = field(init=False)
    lobbies: object = field(init=False)
    studios: object = field(init=False)
    oauth2: object = field(init=False)

    @dataclass
    class Users:
        api: 'CroissantAPI'

        def get_me(self):
            """Get the current authenticated user."""
            return self.api._request("GET", "users/@me", auth=True)

        def get_user(self, user_id: str):
            """Get a user by their ID."""
            return self.api._request("GET", f"users/{user_id}")

        def search(self, query: str):
            """Search for users by query."""
            return self.api._request("GET", "users/search", params={'q': query})

        def verify(self, user_id: str, verification_key: str):
            """Verify a user with a verification key."""
            return self.api._request("GET", "users/auth-verification", params={
                'userId': user_id, 'verificationKey': verification_key
            })

        def transfer_credits(self, target_user_id: str, amount: int):
            """Transfer credits to another user."""
            return self.api._request("POST", "users/transfer-credits", auth=True, json={
                'targetUserId': target_user_id, 'amount': amount
            })

        def get_user_by_steam_id(self, steam_id: str):
            """Get a user by their Steam ID."""
            return self.api._request("GET", "users/getUserBySteamId", params={'steamId': steam_id})

    @dataclass
    class Games:
        api: 'CroissantAPI'

        def list(self):
            """List all games."""
            return self.api._request("GET", "games")

        def get(self, game_id: str):
            """Get a game by its ID."""
            return self.api._request("GET", f"games/{game_id}")

        def list_mine(self):
            """List games created by the authenticated user."""
            return self.api._request("GET", "games/@mine", auth=True)

        def list_owned(self):
            """List games owned by the authenticated user."""
            return self.api._request("GET", "games/list/@me", auth=True)

        def list_owned_by_user(self, user_id: str):
            """List games owned by a specific user."""
            return self.api._request("GET", f"games/list/{user_id}")

    @dataclass
    class Items:
        api: 'CroissantAPI'

        def list(self):
            """List all items."""
            return self.api._request("GET", "items")

        def list_mine(self):
            """List items owned by the authenticated user."""
            return self.api._request("GET", "items/@mine", auth=True)

        def get(self, item_id: str):
            """Get an item by its ID."""
            return self.api._request("GET", f"items/{item_id}")

        def create(self, options: dict):
            """Create a new item."""
            return self.api._request("POST", "items/create", auth=True, json=options)

        def update(self, item_id: str, options: dict):
            """Update an existing item."""
            return self.api._request("PUT", f"items/update/{item_id}", auth=True, json=options)

        def delete(self, item_id: str):
            """Delete an item."""
            return self.api._request("DELETE", f"items/delete/{item_id}", auth=True)

        def buy(self, item_id: str, amount: int):
            """Buy an item."""
            return self.api._request("POST", f"items/buy/{item_id}", auth=True, json={"amount": amount})

        def sell(self, item_id: str, amount: int):
            """Sell an item."""
            return self.api._request("POST", f"items/sell/{item_id}", auth=True, json={"amount": amount})

        def give(self, item_id: str, amount: int):
            """Give an item to another user."""
            return self.api._request("POST", f"items/give/{item_id}", auth=True, json={"amount": amount})

        def consume(self, item_id: str, amount: int):
            """Consume an item."""
            return self.api._request("POST", f"items/consume/{item_id}", auth=True, json={"amount": amount})

        def drop(self, item_id: str, amount: int):
            """Drop an item from your inventory."""
            return self.api._request("POST", f"items/drop/{item_id}", auth=True, json={"amount": amount})

        def transfer(self, item_id: str, amount: int, target_user_id: str):
            """Transfer an item to another user."""
            return self.api._request("POST", f"items/transfer/{item_id}", auth=True, json={
                "amount": amount,
                "targetUserId": target_user_id
            })

    @dataclass
    class Inventory:
        api: 'CroissantAPI'

        def get(self, user_id: str):
            """Get a user's inventory."""
            return self.api._request("GET", f"inventory/{user_id}")

    @dataclass
    class Lobbies:
        api: 'CroissantAPI'

        def get(self, lobby_id: str):
            """Get a lobby by its ID."""
            return self.api._request("GET", f"lobbies/{lobby_id}")

        def get_user_lobby(self, user_id: str):
            """Get the lobby a user is in."""
            return self.api._request("GET", f"lobbies/user/{user_id}")

        def get_mine(self):
            """Get the current user's lobby."""
            return self.api._request("GET", "lobbies/user/@me", auth=True)

        def create(self, options: dict):
            """Create a new lobby."""
            return self.api._request("POST", "lobbies", auth=True, json=options)

        def join(self, lobby_id: str):
            """Join a lobby."""
            return self.api._request("POST", f"lobbies/{lobby_id}/join", auth=True)

        def leave(self, lobby_id: str):
            """Leave a lobby."""
            return self.api._request("POST", f"lobbies/{lobby_id}/leave", auth=True)

    @dataclass
    class Studios:
        api: 'CroissantAPI'

        def get_studio(self, studio_id: str):
            """Get a studio by its ID."""
            return self.api._request("GET", f"studios/{studio_id}")

    @dataclass
    class OAuth2:
        api: 'CroissantAPI'

        def get_user_by_code(self, code: str, client_id: str, client_secret: str, redirect_uri: str):
            """Get a user by OAuth2 code."""
            params = {
                'code': code,
                'client_id': client_id,
                'client_secret': client_secret,
                'redirect_uri': redirect_uri
            }
            return self.api._request("GET", "oauth2/user", params=params)

    def __post_init__(self):
        if not self.token:
            raise ValueError("Token is required")
        self.users = CroissantAPI.Users(self)
        self.games = CroissantAPI.Games(self)
        self.items = CroissantAPI.Items(self)
        self.inventory = CroissantAPI.Inventory(self)
        self.lobbies = CroissantAPI.Lobbies(self)
        self.studios = CroissantAPI.Studios(self)
        self.oauth2 = CroissantAPI.OAuth2(self)

    def _request(self, method: str, path: str, *, auth: bool = False, json: dict = None, params: dict = None):
        headers = {'Content-Type': 'application/json'} if json else {}
        if auth:
            headers['Authorization'] = f'Bearer {self.token}'
        res = requests.request(method, f"{CROISSANT_BASE_URL}/{path.lstrip('/')}" , headers=headers, json=json, params=params)
        res.raise_for_status()
        return res.json()

    def __getattr__(self, name):
        if name in ['users', 'games', 'items', 'inventory', 'lobbies', 'studios', 'oauth2']:
            self.__post_init__()
            return getattr(self, name)
        raise AttributeError(f"'CroissantAPI' object has no attribute '{name}'")

# croissant = CroissantAPI(token='your_token_here')
# croissant.users.get_me()  # Example usage
