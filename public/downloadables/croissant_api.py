import requests
from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any

CROISSANT_BASE_URL = 'https://croissant-api.fr/api'


@dataclass
class Game:
    gameId: str = ""
    name: str = ""
    description: str = ""
    owner_id: str = ""
    download_link: Optional[str] = None
    price: float = 0.0
    showInStore: bool = False
    iconHash: Optional[str] = None
    splashHash: Optional[str] = None
    bannerHash: Optional[str] = None
    genre: Optional[str] = None
    release_date: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    platforms: Optional[str] = None
    rating: float = 0.0
    website: Optional[str] = None
    trailer_link: Optional[str] = None
    multiplayer: bool = False


@dataclass
class User:
    userId: str = ""
    username: str = ""
    email: str = ""
    balance: Optional[float] = None
    verified: bool = False
    steam_id: Optional[str] = None
    steam_username: Optional[str] = None
    steam_avatar_url: Optional[str] = None
    isStudio: bool = False
    admin: bool = False
    disabled: Optional[bool] = None
    google_id: Optional[str] = None
    discord_id: Optional[str] = None
    haveAuthenticator: Optional[bool] = None
    verificationKey: Optional[str] = None


@dataclass
class Item:
    itemId: str = ""
    name: str = ""
    description: str = ""
    price: float = 0.0
    owner: str = ""
    showInStore: bool = False
    iconHash: str = ""
    deleted: bool = False


@dataclass
class InventoryItem:
    itemId: str = ""
    name: str = ""
    description: str = ""
    amount: int = 0
    iconHash: Optional[str] = None


@dataclass
class LobbyUser:
    username: str = ""
    user_id: str = ""
    verified: bool = False
    steam_username: Optional[str] = None
    steam_avatar_url: Optional[str] = None
    steam_id: Optional[str] = None


@dataclass
class Lobby:
    lobbyId: str = ""
    users: List[LobbyUser] = field(default_factory=list)


@dataclass
class StudioUser:
    user_id: str = ""
    username: str = ""
    verified: bool = False
    admin: bool = False


@dataclass
class Studio:
    user_id: str = ""
    username: str = ""
    verified: bool = False
    admin_id: str = ""
    isAdmin: Optional[bool] = None
    apiKey: Optional[str] = None
    users: Optional[List[StudioUser]] = None


@dataclass
class TradeItem:
    itemId: str = ""
    amount: int = 0


@dataclass
class TradeItemDetail:
    itemId: str = ""
    name: str = ""
    description: str = ""
    iconHash: str = ""
    amount: int = 0


@dataclass
class Trade:
    id: str = ""
    fromUserId: str = ""
    toUserId: str = ""
    fromUserItems: List[TradeItemDetail] = field(default_factory=list)
    toUserItems: List[TradeItemDetail] = field(default_factory=list)
    approvedFromUser: bool = False
    approvedToUser: bool = False
    status: str = ""
    createdAt: str = ""
    updatedAt: str = ""


@dataclass
class OAuth2App:
    client_id: str = ""
    client_secret: str = ""
    name: str = ""
    redirect_urls: List[str] = field(default_factory=list)


@dataclass
class CroissantAPI:
    token: str

    users: object = field(init=False)
    games: object = field(init=False)
    items: object = field(init=False)
    inventory: object = field(init=False)
    lobbies: object = field(init=False)
    studios: object = field(init=False)
    trades: object = field(init=False)
    search: object = field(init=False)

    @dataclass
    class Users:
        api: 'CroissantAPI'

        def get_me(self) -> Dict[str, Any]:
            """Get the current authenticated user."""
            if not self.api.token:
                raise ValueError("Token is required")
            return self.api._request("GET", "users/@me", auth=True)

        def get_user(self, user_id: str) -> Dict[str, Any]:
            """Get a user by their ID."""
            return self.api._request("GET", f"users/{user_id}")

        def search(self, query: str) -> List[Dict[str, Any]]:
            """Search for users by query."""
            return self.api._request("GET", "users/search", params={'q': query})

        def verify(self, user_id: str, verification_key: str) -> Dict[str, Any]:
            """Verify a user with a verification key."""
            return self.api._request("POST", "users/auth-verification", json={
                'userId': user_id, 'verificationKey': verification_key
            })

        def transfer_credits(self, target_user_id: str, amount: float) -> Dict[str, Any]:
            """Transfer credits to another user."""
            return self.api._request("POST", "users/transfer-credits", json={
                'targetUserId': target_user_id, 'amount': amount
            }, auth=True)

        def change_username(self, username: str) -> Dict[str, Any]:
            """Change username (authenticated user only)."""
            return self.api._request("POST", "users/change-username", json={
                'username': username
            }, auth=True)

        def change_password(self, old_password: str, new_password: str, confirm_password: str) -> Dict[str, Any]:
            """Change password (authenticated user only)."""
            return self.api._request("POST", "users/change-password", json={
                'oldPassword': old_password,
                'newPassword': new_password,
                'confirmPassword': confirm_password
            }, auth=True)

    @dataclass
    class Games:
        api: 'CroissantAPI'

        def list(self) -> List[Dict[str, Any]]:
            """List all games visible in the store."""
            return self.api._request("GET", "games")

        def search(self, query: str) -> List[Dict[str, Any]]:
            """Search for games by name, genre, or description."""
            return self.api._request("GET", "games/search", params={'q': query})

        def get_my_created_games(self) -> List[Dict[str, Any]]:
            """Get all games created by the authenticated user."""
            return self.api._request("GET", "games/@mine", auth=True)

        def get_my_owned_games(self) -> List[Dict[str, Any]]:
            """Get all games owned by the authenticated user."""
            return self.api._request("GET", "games/list/@me", auth=True)

        def get(self, game_id: str) -> Dict[str, Any]:
            """Get a game by gameId."""
            return self.api._request("GET", f"games/{game_id}")

        def create(self, game_data: Dict[str, Any]) -> Dict[str, Any]:
            """Create a new game."""
            return self.api._request("POST", "games", json=game_data, auth=True)

        def update(self, game_id: str, game_data: Dict[str, Any]) -> Dict[str, Any]:
            """Update an existing game."""
            return self.api._request("PUT", f"games/{game_id}", json=game_data, auth=True)

        def buy(self, game_id: str) -> Dict[str, Any]:
            """Buy a game."""
            return self.api._request("POST", f"games/{game_id}/buy", auth=True)

    @dataclass
    class Items:
        api: 'CroissantAPI'

        def list(self) -> List[Dict[str, Any]]:
            """Get all non-deleted items visible in store."""
            return self.api._request("GET", "items")

        def get_my_items(self) -> List[Dict[str, Any]]:
            """Get all items owned by the authenticated user."""
            return self.api._request("GET", "items/@mine", auth=True)

        def search(self, query: str) -> List[Dict[str, Any]]:
            """Search for items by name (only those visible in store)."""
            return self.api._request("GET", "items/search", params={'q': query})

        def get(self, item_id: str) -> Dict[str, Any]:
            """Get a single item by itemId."""
            return self.api._request("GET", f"items/{item_id}")

        def create(self, item_data: Dict[str, Any]) -> Dict[str, Any]:
            """Create a new item."""
            return self.api._request("POST", "items/create", json=item_data, auth=True)

        def update(self, item_id: str, item_data: Dict[str, Any]) -> Dict[str, Any]:
            """Update an existing item."""
            return self.api._request("PUT", f"items/update/{item_id}", json=item_data, auth=True)

        def delete(self, item_id: str) -> Dict[str, Any]:
            """Delete an item."""
            return self.api._request("DELETE", f"items/delete/{item_id}", auth=True)

        def buy(self, item_id: str, amount: int) -> Dict[str, Any]:
            """Buy an item."""
            return self.api._request("POST", f"items/buy/{item_id}", json={'amount': amount}, auth=True)

        def sell(self, item_id: str, amount: int) -> Dict[str, Any]:
            """Sell an item."""
            return self.api._request("POST", f"items/sell/{item_id}", json={'amount': amount}, auth=True)

        def give(self, item_id: str, amount: int) -> Dict[str, Any]:
            """Give item occurrences to a user (owner only)."""
            return self.api._request("POST", f"items/give/{item_id}", json={'amount': amount}, auth=True)

        def consume(self, item_id: str, amount: int) -> Dict[str, Any]:
            """Consume item occurrences from a user (owner only)."""
            return self.api._request("POST", f"items/consume/{item_id}", json={'amount': amount}, auth=True)

        def drop(self, item_id: str, amount: int) -> Dict[str, Any]:
            """Drop item occurrences from your inventory."""
            return self.api._request("POST", f"items/drop/{item_id}", json={'amount': amount}, auth=True)

    @dataclass
    class Inventory:
        api: 'CroissantAPI'

        def get_my_inventory(self) -> List[Dict[str, Any]]:
            """Get the inventory of the authenticated user."""
            return self.api._request("GET", "inventory/@me", auth=True)

        def get(self, user_id: str) -> List[Dict[str, Any]]:
            """Get the inventory of a user."""
            return self.api._request("GET", f"inventory/{user_id}")

    @dataclass
    class Lobbies:
        api: 'CroissantAPI'

        def create(self) -> Dict[str, Any]:
            """Create a new lobby."""
            return self.api._request("POST", "lobbies", auth=True)

        def get(self, lobby_id: str) -> Dict[str, Any]:
            """Get a lobby by lobbyId."""
            return self.api._request("GET", f"lobbies/{lobby_id}")

        def get_my_lobby(self) -> Dict[str, Any]:
            """Get the lobby the authenticated user is in."""
            return self.api._request("GET", "lobbies/user/@me", auth=True)

        def get_user_lobby(self, user_id: str) -> Dict[str, Any]:
            """Get the lobby a user is in."""
            return self.api._request("GET", f"lobbies/user/{user_id}")

        def join(self, lobby_id: str) -> Dict[str, Any]:
            """Join a lobby."""
            return self.api._request("POST", f"lobbies/{lobby_id}/join", auth=True)

        def leave(self, lobby_id: str) -> Dict[str, Any]:
            """Leave a lobby."""
            return self.api._request("POST", f"lobbies/{lobby_id}/leave", auth=True)

    @dataclass
    class Studios:
        api: 'CroissantAPI'

        def create(self, studio_name: str) -> Dict[str, Any]:
            """Create a new studio."""
            return self.api._request("POST", "studios", json={'studioName': studio_name}, auth=True)

        def get(self, studio_id: str) -> Dict[str, Any]:
            """Get a studio by studioId."""
            return self.api._request("GET", f"studios/{studio_id}")

        def get_my_studios(self) -> List[Dict[str, Any]]:
            """Get all studios the authenticated user is part of."""
            return self.api._request("GET", "studios/user/@me", auth=True)

        def add_user(self, studio_id: str, user_id: str) -> Dict[str, Any]:
            """Add a user to a studio."""
            return self.api._request("POST", f"studios/{studio_id}/add-user", json={'userId': user_id}, auth=True)

        def remove_user(self, studio_id: str, user_id: str) -> Dict[str, Any]:
            """Remove a user from a studio."""
            return self.api._request("POST", f"studios/{studio_id}/remove-user", json={'userId': user_id}, auth=True)

    @dataclass
    class Trades:
        api: 'CroissantAPI'

        def start_or_get_pending(self, user_id: str) -> Dict[str, Any]:
            """Start a new trade or get the latest pending trade with a user."""
            return self.api._request("POST", f"trades/start-or-latest/{user_id}", auth=True)

        def get(self, trade_id: str) -> Dict[str, Any]:
            """Get a trade by ID with enriched item information."""
            return self.api._request("GET", f"trades/{trade_id}", auth=True)

        def get_my_trades(self) -> List[Dict[str, Any]]:
            """Get all trades for a user with enriched item information."""
            return self.api._request("GET", "trades/user/@me", auth=True)

        def add_item(self, trade_id: str, trade_item: TradeItem) -> Dict[str, Any]:
            """Add an item to a trade."""
            return self.api._request("POST", f"trades/{trade_id}/add-item", json={
                'tradeItem': {'itemId': trade_item.itemId, 'amount': trade_item.amount}
            }, auth=True)

        def remove_item(self, trade_id: str, trade_item: TradeItem) -> Dict[str, Any]:
            """Remove an item from a trade."""
            return self.api._request("POST", f"trades/{trade_id}/remove-item", json={
                'tradeItem': {'itemId': trade_item.itemId, 'amount': trade_item.amount}
            }, auth=True)

        def approve(self, trade_id: str) -> Dict[str, Any]:
            """Approve a trade."""
            return self.api._request("PUT", f"trades/{trade_id}/approve", auth=True)

        def cancel(self, trade_id: str) -> Dict[str, Any]:
            """Cancel a trade."""
            return self.api._request("PUT", f"trades/{trade_id}/cancel", auth=True)

    @dataclass
    class Search:
        api: 'CroissantAPI'

        def global_search(self, query: str) -> Dict[str, Any]:
            """Global search across users, items, and games."""
            return self.api._request("GET", "search", params={'q': query})

    def __post_init__(self):
        if not self.token:
            raise ValueError("Token is required")
        self.users = CroissantAPI.Users(self)
        self.games = CroissantAPI.Games(self)
        self.items = CroissantAPI.Items(self)
        self.inventory = CroissantAPI.Inventory(self)
        self.lobbies = CroissantAPI.Lobbies(self)
        self.studios = CroissantAPI.Studios(self)
        self.trades = CroissantAPI.Trades(self)
        self.search = CroissantAPI.Search(self)

    def _request(self, method: str, path: str, *, auth: bool = False, json: Dict[str, Any] = None, params: Dict[str, Any] = None) -> Any:
        headers = {'Content-Type': 'application/json'} if json else {}
        if auth:
            headers['Authorization'] = f'Bearer {self.token}'
        
        url = f"{CROISSANT_BASE_URL}/{path.lstrip('/')}"
        res = requests.request(method, url, headers=headers, json=json, params=params)
        res.raise_for_status()
        return res.json()

    def __getattr__(self, name):
        if name in ['users', 'games', 'items', 'inventory', 'lobbies', 'studios', 'trades', 'search']:
            self.__post_init__()
            return getattr(self, name)
        raise AttributeError(f"'CroissantAPI' object has no attribute '{name}'")


# Example usage:
# croissant = CroissantAPI(token='your_token_here')
# me = croissant.users.get_me()
# games = croissant.games.list()
