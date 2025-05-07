import requests

CROISSANT_BASE_URL = 'https://croissant-api.fr/api'

class CroissantAPI:
    def __init__(self, token: str):
        if not token:
            raise ValueError("Token is required")
        self.token = token

    # --- USERS ---
    class Users:
        def __init__(self, api):
            self.api = api

        def get_me(self):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.get(f"{CROISSANT_BASE_URL}/users/@me", headers=headers)
            res.raise_for_status()
            return res.json()

        def get_user(self, user_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/users/{user_id}")
            res.raise_for_status()
            return res.json()

        def search(self, query: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/users/search", params={'q': query})
            res.raise_for_status()
            return res.json()

        def verify(self, user_id: str, verification_key: str):
            res = requests.get(
                f"{CROISSANT_BASE_URL}/users/auth-verification",
                params={'userId': user_id, 'verificationKey': verification_key}
            )
            res.raise_for_status()
            return res.json()

        def transfer_credits(self, target_user_id: str, amount: int):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/users/transfer-credits",
                headers=headers,
                json={'targetUserId': target_user_id, 'amount': amount}
            )
            res.raise_for_status()
            return res.json()

    # --- GAMES ---
    class Games:
        def __init__(self, api):
            self.api = api

        def list(self):
            res = requests.get(f"{CROISSANT_BASE_URL}/games")
            res.raise_for_status()
            return res.json()

        def get(self, game_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/games/{game_id}")
            res.raise_for_status()
            return res.json()

        def list_mine(self):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.get(f"{CROISSANT_BASE_URL}/games/@mine", headers=headers)
            res.raise_for_status()
            return res.json()

        def list_owned(self):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.get(f"{CROISSANT_BASE_URL}/games/list/@me", headers=headers)
            res.raise_for_status()
            return res.json()

        def list_owned_by_user(self, user_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/games/list/{user_id}")
            res.raise_for_status()
            return res.json()

        def create(self, options: dict):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(f"{CROISSANT_BASE_URL}/games", headers=headers, json=options)
            res.raise_for_status()
            return res.json()

        def update(self, game_id: str, options: dict):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.put(f"{CROISSANT_BASE_URL}/games/{game_id}", headers=headers, json=options)
            res.raise_for_status()
            return res.json()

        def delete(self, game_id: str):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.delete(f"{CROISSANT_BASE_URL}/games/{game_id}", headers=headers)
            res.raise_for_status()
            return res.json()

    # --- ITEMS ---
    class Items:
        def __init__(self, api):
            self.api = api

        def list(self):
            res = requests.get(f"{CROISSANT_BASE_URL}/items")
            res.raise_for_status()
            return res.json()

        def list_mine(self):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.get(f"{CROISSANT_BASE_URL}/items/@mine", headers=headers)
            res.raise_for_status()
            return res.json()

        def get(self, item_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/items/{item_id}")
            res.raise_for_status()
            return res.json()

        def create(self, options: dict):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(f"{CROISSANT_BASE_URL}/items/create", headers=headers, json=options)
            res.raise_for_status()
            return res.json()

        def update(self, item_id: str, options: dict):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.put(f"{CROISSANT_BASE_URL}/items/update/{item_id}", headers=headers, json=options)
            res.raise_for_status()
            return res.json()

        def delete(self, item_id: str):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.delete(f"{CROISSANT_BASE_URL}/items/delete/{item_id}", headers=headers)
            res.raise_for_status()
            return res.json()

        def buy(self, item_id: str, amount: int):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/items/buy/{item_id}",
                headers=headers,
                json={'amount': amount}
            )
            res.raise_for_status()
            return res.json()

        def sell(self, item_id: str, amount: int):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/items/sell/{item_id}",
                headers=headers,
                json={'amount': amount}
            )
            res.raise_for_status()
            return res.json()

        def give(self, item_id: str, amount: int):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/items/give/{item_id}",
                headers=headers,
                json={'amount': amount}
            )
            res.raise_for_status()
            return res.json()

        def consume(self, item_id: str, amount: int):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/items/consume/{item_id}",
                headers=headers,
                json={'amount': amount}
            )
            res.raise_for_status()
            return res.json()

        def drop(self, item_id: str, amount: int):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/items/drop/{item_id}",
                headers=headers,
                json={'amount': amount}
            )
            res.raise_for_status()
            return res.json()

        def transfer(self, item_id: str, amount: int, target_user_id: str):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(
                f"{CROISSANT_BASE_URL}/items/transfer/{item_id}",
                headers=headers,
                json={'amount': amount, 'targetUserId': target_user_id}
            )
            res.raise_for_status()
            return res.json()

    # --- INVENTORY ---
    class Inventory:
        def __init__(self, api):
            self.api = api

        def get(self, user_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/inventory/{user_id}")
            res.raise_for_status()
            return res.json()

    # --- LOBBIES ---
    class Lobbies:
        def __init__(self, api):
            self.api = api

        def get(self, lobby_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}")
            res.raise_for_status()
            return res.json()

        def get_user_lobby(self, user_id: str):
            res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/user/{user_id}")
            res.raise_for_status()
            return res.json()

        def get_mine(self):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/user/@me", headers=headers)
            res.raise_for_status()
            return res.json()

        def create(self, options: dict):
            headers = {
                'Authorization': f'Bearer {self.api.token}',
                'Content-Type': 'application/json'
            }
            res = requests.post(f"{CROISSANT_BASE_URL}/lobbies", headers=headers, json=options)
            res.raise_for_status()
            return res.json()

        def join(self, lobby_id: str):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.post(f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}/join", headers=headers)
            res.raise_for_status()
            return res.json()

        def leave(self, lobby_id: str):
            headers = {'Authorization': f'Bearer {self.api.token}'}
            res = requests.post(f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}/leave", headers=headers)
            res.raise_for_status()
            return res.json()

    def __post_init__(self):
        self.users = CroissantAPI.Users(self)
        self.games = CroissantAPI.Games(self)
        self.items = CroissantAPI.Items(self)
        self.inventory = CroissantAPI.Inventory(self)
        self.lobbies = CroissantAPI.Lobbies(self)

    # For compatibility with __init__:
    def __getattr__(self, name):
        if name in ['users', 'games', 'items', 'inventory', 'lobbies']:
            self.__post_init__()
            return getattr(self, name)
        raise AttributeError(f"'CroissantAPI' object has no attribute '{name}'")
    
# croissant = CroissantAPI(token='your_token_here')
# croissant.users.get_me()  # Example usage