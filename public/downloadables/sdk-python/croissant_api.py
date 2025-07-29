import requests
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Any

CROISSANT_BASE_URL = 'https://croissant-api.fr/api'

@dataclass
class Game:
    gameId: str
    name: str
    description: str
    price: float
    owner_id: str
    showInStore: bool
    iconHash: Optional[str] = None
    splashHash: Optional[str] = None
    bannerHash: Optional[str] = None
    genre: Optional[str] = None
    release_date: Optional[str] = None
    developer: Optional[str] = None
    publisher: Optional[str] = None
    platforms: Optional[List[str]] = None
    rating: float = 0.0
    website: Optional[str] = None
    trailer_link: Optional[str] = None
    multiplayer: bool = False
    download_link: Optional[str] = None

@dataclass
class User:
    userId: str
    username: str
    email: Optional[str] = None
    verified: bool = False
    studios: Optional[List[dict]] = None
    roles: Optional[List[str]] = None
    inventory: Optional[List[dict]] = None
    ownedItems: Optional[List[dict]] = None
    createdGames: Optional[List[Game]] = None
    verificationKey: Optional[str] = None
    steam_id: Optional[str] = None
    steam_username: Optional[str] = None
    steam_avatar_url: Optional[str] = None
    isStudio: Optional[bool] = None
    admin: Optional[bool] = None
    disabled: Optional[bool] = None
    google_id: Optional[str] = None
    discord_id: Optional[str] = None
    balance: Optional[float] = None
    haveAuthenticator: Optional[bool] = None

@dataclass
class Item:
    itemId: str
    name: str
    description: str
    owner: str
    price: float
    iconHash: str
    showInStore: Optional[bool] = None
    deleted: Optional[bool] = None

@dataclass
class InventoryItem:
    user_id: Optional[str] = None
    item_id: Optional[str] = None
    amount: int = 0
    metadata: Optional[Dict[str, Any]] = None
    itemId: str = ''
    name: str = ''
    description: str = ''
    iconHash: str = ''
    price: float = 0.0
    owner: str = ''
    showInStore: bool = False

@dataclass
class Studio:
    user_id: str
    username: str
    verified: bool
    admin_id: str
    isAdmin: Optional[bool] = None
    apiKey: Optional[str] = None
    users: Optional[List[dict]] = None

@dataclass
class Lobby:
    lobbyId: str
    users: List[dict]

@dataclass
class TradeItem:
    itemId: str
    amount: int
    metadata: Optional[Dict[str, Any]] = None

@dataclass
class Trade:
    id: str
    fromUserId: str
    toUserId: str
    fromUserItems: List[dict]
    toUserItems: List[dict]
    approvedFromUser: bool
    approvedToUser: bool
    status: str
    createdAt: str
    updatedAt: str

@dataclass
class OAuth2App:
    client_id: str
    client_secret: str
    name: str
    redirect_urls: List[str]

class CroissantAPI:
    def __init__(self, token: Optional[str] = None):
        self.token = token

    def _headers(self, content_type: bool = False):
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        if content_type:
            headers['Content-Type'] = 'application/json'
        return headers

    # --- USERS ---
    def get_me(self) -> User:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/users/@me', headers=self._headers())
        r.raise_for_status()
        return User(**r.json())

    def search_users(self, query: str) -> List[User]:
        r = requests.get(f'{CROISSANT_BASE_URL}/users/search', params={'q': query})
        if not r.ok:
            return []
        return [User(**u) for u in r.json()]

    def get_user(self, user_id: str) -> User:
        r = requests.get(f'{CROISSANT_BASE_URL}/users/{user_id}')
        r.raise_for_status()
        return User(**r.json())

    def transfer_credits(self, target_user_id: str, amount: float) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/users/transfer-credits',
                         headers=self._headers(True),
                         json={'targetUserId': target_user_id, 'amount': amount})
        r.raise_for_status()
        return r.json()

    def verify_user(self, user_id: str, verification_key: str) -> dict:
        r = requests.post(f'{CROISSANT_BASE_URL}/users/auth-verification',
                         headers=self._headers(True),
                         json={'userId': user_id, 'verificationKey': verification_key})
        if not r.ok:
            return {'success': False}
        return r.json()

    # --- GAMES ---
    def list_games(self) -> List[Game]:
        r = requests.get(f'{CROISSANT_BASE_URL}/games')
        if not r.ok:
            return []
        return [Game(**g) for g in r.json()]

    def search_games(self, query: str) -> List[Game]:
        r = requests.get(f'{CROISSANT_BASE_URL}/games/search', params={'q': query})
        if not r.ok:
            return []
        return [Game(**g) for g in r.json()]

    def get_my_created_games(self) -> List[Game]:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/games/@mine', headers=self._headers())
        if not r.ok:
            return []
        return [Game(**g) for g in r.json()]

    def get_my_owned_games(self) -> List[Game]:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/games/list/@me', headers=self._headers())
        if not r.ok:
            return []
        return [Game(**g) for g in r.json()]

    def get_game(self, game_id: str) -> Game:
        r = requests.get(f'{CROISSANT_BASE_URL}/games/{game_id}')
        r.raise_for_status()
        return Game(**r.json())

    # --- INVENTORY ---
    def get_my_inventory(self) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/inventory/@me', headers=self._headers())
        r.raise_for_status()
        return r.json()

    def get_inventory(self, user_id: str) -> dict:
        r = requests.get(f'{CROISSANT_BASE_URL}/inventory/{user_id}')
        r.raise_for_status()
        return r.json()

    # --- ITEMS ---
    def list_items(self) -> List[Item]:
        r = requests.get(f'{CROISSANT_BASE_URL}/items')
        if not r.ok:
            return []
        return [Item(**i) for i in r.json()]

    def get_my_items(self) -> List[Item]:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/items/@mine', headers=self._headers())
        if not r.ok:
            return []
        return [Item(**i) for i in r.json()]

    def search_items(self, query: str) -> List[Item]:
        r = requests.get(f'{CROISSANT_BASE_URL}/items/search', params={'q': query})
        if not r.ok:
            return []
        return [Item(**i) for i in r.json()]

    def get_item(self, item_id: str) -> Item:
        r = requests.get(f'{CROISSANT_BASE_URL}/items/{item_id}')
        r.raise_for_status()
        return Item(**r.json())

    def create_item(self, item_data: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/items/create', headers=self._headers(True), json=item_data)
        r.raise_for_status()
        return r.json()

    def update_item(self, item_id: str, item_data: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.put(f'{CROISSANT_BASE_URL}/items/update/{item_id}', headers=self._headers(True), json=item_data)
        r.raise_for_status()
        return r.json()

    def delete_item(self, item_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.delete(f'{CROISSANT_BASE_URL}/items/delete/{item_id}', headers=self._headers())
        r.raise_for_status()
        return r.json()

    def buy_item(self, item_id: str, amount: int) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/items/buy/{item_id}', headers=self._headers(True), json={'amount': amount})
        r.raise_for_status()
        return r.json()

    def sell_item(self, item_id: str, amount: int) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/items/sell/{item_id}', headers=self._headers(True), json={'amount': amount})
        r.raise_for_status()
        return r.json()

    def give_item(self, item_id: str, amount: int, user_id: str, metadata: Optional[dict] = None) -> dict:
        if not self.token:
            raise Exception('Token is required')
        body = {'amount': amount, 'userId': user_id}
        if metadata:
            body['metadata'] = metadata
        r = requests.post(f'{CROISSANT_BASE_URL}/items/give/{item_id}', headers=self._headers(True), json=body)
        r.raise_for_status()
        return r.json()

    def consume_item(self, item_id: str, params: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/items/consume/{item_id}', headers=self._headers(True), json=params)
        r.raise_for_status()
        return r.json()

    def update_item_metadata(self, item_id: str, unique_id: str, metadata: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.put(f'{CROISSANT_BASE_URL}/items/update-metadata/{item_id}', headers=self._headers(True), json={'uniqueId': unique_id, 'metadata': metadata})
        r.raise_for_status()
        return r.json()

    def drop_item(self, item_id: str, params: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/items/drop/{item_id}', headers=self._headers(True), json=params)
        r.raise_for_status()
        return r.json()

    # --- LOBBIES ---
    def create_lobby(self) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/lobbies', headers=self._headers())
        r.raise_for_status()
        return r.json()

    def get_lobby(self, lobby_id: str) -> Lobby:
        r = requests.get(f'{CROISSANT_BASE_URL}/lobbies/{lobby_id}')
        r.raise_for_status()
        return Lobby(**r.json())

    def get_my_lobby(self) -> Lobby:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/lobbies/user/@me', headers=self._headers())
        r.raise_for_status()
        return Lobby(**r.json())

    def get_user_lobby(self, user_id: str) -> Lobby:
        r = requests.get(f'{CROISSANT_BASE_URL}/lobbies/user/{user_id}')
        r.raise_for_status()
        return Lobby(**r.json())

    def join_lobby(self, lobby_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/lobbies/{lobby_id}/join', headers=self._headers())
        r.raise_for_status()
        return r.json()

    def leave_lobby(self, lobby_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/lobbies/{lobby_id}/leave', headers=self._headers())
        r.raise_for_status()
        return r.json()

    # --- STUDIOS ---
    def create_studio(self, studio_name: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/studios', headers=self._headers(True), json={'studioName': studio_name})
        r.raise_for_status()
        return r.json()

    def get_studio(self, studio_id: str) -> Studio:
        r = requests.get(f'{CROISSANT_BASE_URL}/studios/{studio_id}')
        r.raise_for_status()
        return Studio(**r.json())

    def get_my_studios(self) -> List[Studio]:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/studios/user/@me', headers=self._headers())
        r.raise_for_status()
        return [Studio(**s) for s in r.json()]

    def add_user_to_studio(self, studio_id: str, user_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/studios/{studio_id}/add-user', headers=self._headers(True), json={'userId': user_id})
        r.raise_for_status()
        return r.json()

    def remove_user_from_studio(self, studio_id: str, user_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/studios/{studio_id}/remove-user', headers=self._headers(True), json={'userId': user_id})
        r.raise_for_status()
        return r.json()

    # --- TRADES ---
    def start_or_get_pending_trade(self, user_id: str) -> Trade:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/trades/start-or-latest/{user_id}', headers=self._headers())
        r.raise_for_status()
        return Trade(**r.json())

    def get_trade(self, trade_id: str) -> Trade:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/trades/{trade_id}', headers=self._headers())
        r.raise_for_status()
        return Trade(**r.json())

    def get_user_trades(self, user_id: str) -> List[Trade]:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/trades/user/{user_id}', headers=self._headers())
        r.raise_for_status()
        return [Trade(**t) for t in r.json()]

    def add_item_to_trade(self, trade_id: str, trade_item: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/trades/{trade_id}/add-item', headers=self._headers(True), json={'tradeItem': trade_item})
        r.raise_for_status()
        return r.json()

    def remove_item_from_trade(self, trade_id: str, trade_item: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/trades/{trade_id}/remove-item', headers=self._headers(True), json={'tradeItem': trade_item})
        r.raise_for_status()
        return r.json()

    def approve_trade(self, trade_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.put(f'{CROISSANT_BASE_URL}/trades/{trade_id}/approve', headers=self._headers())
        r.raise_for_status()
        return r.json()

    def cancel_trade(self, trade_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.put(f'{CROISSANT_BASE_URL}/trades/{trade_id}/cancel', headers=self._headers())
        r.raise_for_status()
        return r.json()

    # --- OAUTH2 ---
    def get_oauth2_app(self, client_id: str) -> OAuth2App:
        r = requests.get(f'{CROISSANT_BASE_URL}/oauth2/app/{client_id}')
        r.raise_for_status()
        return OAuth2App(**r.json())

    def create_oauth2_app(self, name: str, redirect_urls: List[str]) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.post(f'{CROISSANT_BASE_URL}/oauth2/app', headers=self._headers(True), json={'name': name, 'redirect_urls': redirect_urls})
        r.raise_for_status()
        return r.json()

    def get_my_oauth2_apps(self) -> List[OAuth2App]:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/oauth2/apps', headers=self._headers())
        r.raise_for_status()
        return [OAuth2App(**a) for a in r.json()]

    def update_oauth2_app(self, client_id: str, data: dict) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.patch(f'{CROISSANT_BASE_URL}/oauth2/app/{client_id}', headers=self._headers(True), json=data)
        r.raise_for_status()
        return r.json()

    def delete_oauth2_app(self, client_id: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.delete(f'{CROISSANT_BASE_URL}/oauth2/app/{client_id}', headers=self._headers())
        r.raise_for_status()
        return r.json()

    def authorize(self, client_id: str, redirect_uri: str) -> dict:
        if not self.token:
            raise Exception('Token is required')
        r = requests.get(f'{CROISSANT_BASE_URL}/oauth2/authorize', headers=self._headers(), params={'client_id': client_id, 'redirect_uri': redirect_uri})
        r.raise_for_status()
        return r.json()

    def get_user_by_code(self, code: str, client_id: str) -> User:
        r = requests.get(f'{CROISSANT_BASE_URL}/oauth2/user', params={'code': code, 'client_id': client_id})
        r.raise_for_status()
        return User(**r.json())
