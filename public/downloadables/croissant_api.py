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

    @dataclass
    class Users:
        api: 'CroissantAPI'

        def get_me(self):
            return self.api._request("GET", "users/@me", auth=True)

        def get_user(self, user_id: str):
            return self.api._request("GET", f"users/{user_id}")

        def search(self, query: str):
            return self.api._request("GET", "users/search", params={'q': query})

        def verify(self, user_id: str, verification_key: str):
            return self.api._request("GET", "users/auth-verification", params={
                'userId': user_id, 'verificationKey': verification_key
            })

        def transfer_credits(self, target_user_id: str, amount: int):
            return self.api._request("POST", "users/transfer-credits", auth=True, json={
                'targetUserId': target_user_id, 'amount': amount
            })

        def create(self, options: dict):
            """Create a new user.
            Example: api.users.create({"username": "CroissantFan"})
            """
            return self.api._request("POST", "users/create", auth=True, json=options)

    @dataclass
    class Games:
        api: 'CroissantAPI'

        def list(self):
            return self.api._request("GET", "games")

        def get(self, game_id: str):
            return self.api._request("GET", f"games/{game_id}")

        def list_mine(self):
            return self.api._request("GET", "games/@mine", auth=True)

        def list_owned(self):
            return self.api._request("GET", "games/list/@me", auth=True)

        def list_owned_by_user(self, user_id: str):
            return self.api._request("GET", f"games/list/{user_id}")

        def create(self, options: dict):
            return self.api._request("POST", "games", auth=True, json=options)

        def update(self, game_id: str, options: dict):
            return self.api._request("PUT", f"games/{game_id}", auth=True, json=options)

        def delete(self, game_id: str):
            return self.api._request("DELETE", f"games/{game_id}", auth=True)

    @dataclass
    class Items:
        api: 'CroissantAPI'

        def list(self):
            return self.api._request("GET", "items")

        def list_mine(self):
            return self.api._request("GET", "items/@mine", auth=True)

        def get(self, item_id: str):
            return self.api._request("GET", f"items/{item_id}")

        def create(self, options: dict):
            return self.api._request("POST", "items/create", auth=True, json=options)

        def update(self, item_id: str, options: dict):
            return self.api._request("PUT", f"items/update/{item_id}", auth=True, json=options)

        def delete(self, item_id: str):
            return self.api._request("DELETE", f"items/delete/{item_id}", auth=True)

        def buy(self, item_id: str, amount: int):
            return self.api._request("POST", f"items/buy/{item_id}", auth=True, json={"amount": amount})

        def sell(self, item_id: str, amount: int):
            return self.api._request("POST", f"items/sell/{item_id}", auth=True, json={"amount": amount})

        def give(self, item_id: str, amount: int):
            return self.api._request("POST", f"items/give/{item_id}", auth=True, json={"amount": amount})

        def consume(self, item_id: str, amount: int):
            return self.api._request("POST", f"items/consume/{item_id}", auth=True, json={"amount": amount})

        def drop(self, item_id: str, amount: int):
            return self.api._request("POST", f"items/drop/{item_id}", auth=True, json={"amount": amount})

        def transfer(self, item_id: str, amount: int, target_user_id: str):
            return self.api._request("POST", f"items/transfer/{item_id}", auth=True, json={
                "amount": amount,
                "targetUserId": target_user_id
            })

    @dataclass
    class Inventory:
        api: 'CroissantAPI'

        def get(self, user_id: str):
            return self.api._request("GET", f"inventory/{user_id}")

    @dataclass
    class Lobbies:
        api: 'CroissantAPI'

        def get(self, lobby_id: str):
            return self.api._request("GET", f"lobbies/{lobby_id}")

        def get_user_lobby(self, user_id: str):
            return self.api._request("GET", f"lobbies/user/{user_id}")

        def get_mine(self):
            return self.api._request("GET", "lobbies/user/@me", auth=True)

        def create(self, options: dict):
            return self.api._request("POST", "lobbies", auth=True, json=options)

        def join(self, lobby_id: str):
            return self.api._request("POST", f"lobbies/{lobby_id}/join", auth=True)

        def leave(self, lobby_id: str):
            return self.api._request("POST", f"lobbies/{lobby_id}/leave", auth=True)

    def __post_init__(self):
        if not self.token:
            raise ValueError("Token is required")

        self.users = CroissantAPI.Users(self)
        self.games = CroissantAPI.Games(self)
        self.items = CroissantAPI.Items(self)
        self.inventory = CroissantAPI.Inventory(self)
        self.lobbies = CroissantAPI.Lobbies(self)

    def _request(self, method: str, path: str, *, auth: bool = False, json: dict = None, params: dict = None):
        headers = {'Content-Type': 'application/json'} if json else {}
        if auth:
            headers['Authorization'] = f'Bearer {self.token}'
        res = requests.request(method, f"{CROISSANT_BASE_URL}/{path.lstrip('/')}", headers=headers, json=json,
                               params=params)
        res.raise_for_status()
        return res.json()

    def __getattr__(self, name):
        if name in ['users', 'games', 'items', 'inventory', 'lobbies']:
            self.__post_init__()
            return getattr(self, name)
        raise AttributeError(f"'CroissantAPI' object has no attribute '{name}'")

# croissant = CroissantAPI(token='your_token_here')
# croissant.users.get_me()  # Example usage
