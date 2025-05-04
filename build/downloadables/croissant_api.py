"""
Croissant API for Python

This module provides functions to interact with the Croissant API.

Usage:
    Import this module to use the Croissant API functions.

    Example:
        from croissant_api import CroissantAPI

Base URL:
    The base URL for the Croissant API is set to 'https://croissant-api.fr/api'.

Classes:
    - Users:
        - create(user_id, username, balance) -> dict:
            Create a new user.

        - get(user_id) -> dict or None:
            Fetch a user by ID.

        - verify(user_id, verification_key) -> dict:
            Verify a user with a verification key.

    - Items:
        - get(item_id=None) -> list or dict:
            Fetch items from the Croissant API.

        - buy(item_id, amount, token) -> dict:
            Purchase an item.

        - has_item(user_id, item_id) -> dict:
            Check if a user owns a specific item.

    - Inventory:
        - get(user_id) -> dict:
            Fetch the inventory of a user.

        - give(user_id, item_id, amount, token) -> dict:
            Give an item to a user.

        - consume(user_id, item_id, amount, token) -> dict:
            Consume an item for a user.

        - open_bundle(user_id, bundle_id, amount, token) -> dict:
            Open a bundle for a user.

    - Games:
        - list() -> list:
            List all games.

        - get(game_id) -> dict or None:
            Fetch a game by ID.

        - create(name, description, price, show_in_store, token) -> dict:
            Create a new game.

        - update(game_id, name=None, description=None, price=None, show_in_store=None) -> dict:
            Update a game.

        - delete(game_id) -> dict:
            Delete a game.

    - Lobbies:
        - get(lobby_id) -> dict or None:
            Fetch a lobby by ID.

        - get_user_lobby(user_id) -> dict or None:
            Fetch the lobby of a user.

        - create(users) -> dict:
            Create a new lobby.

        - join(lobby_id, user_id) -> dict:
            Join a lobby.

        - leave(lobby_id, user_id) -> dict:
            Leave a lobby.

    - CroissantAPI:
        A grouped API interface for all the above classes.
"""

import requests

CROISSANT_BASE_URL = 'https://croissant-api.fr/api'

class Users:
    @staticmethod
    def create(user_id, username, balance):
        """Create a new user."""
        res = requests.post(
            f"{CROISSANT_BASE_URL}/users/create",
            json={"userId": user_id, "username": username, "balance": balance}
        )
        return res.json()

    @staticmethod
    def get(user_id):
        """Fetch a user by ID."""
        res = requests.get(f"{CROISSANT_BASE_URL}/users/{user_id}")
        if not res.ok:
            return None
        return res.json()

    @staticmethod
    def verify(user_id, verification_key):
        """Verify a user with a verification key."""
        res = requests.post(
            f"{CROISSANT_BASE_URL}/users/auth-verification",
            params={"userId": user_id, "verificationKey": verification_key}
        )
        if not res.ok:
            raise Exception('Failed to verify user')
        return res.json()

class Items:
    @staticmethod
    def get(item_id=None):
        url = f"{CROISSANT_BASE_URL}/items"
        if item_id:
            url += f"/{item_id}"
        response = requests.get(url)
        if not response.ok:
            raise Exception(f"Failed to fetch items: {response.status_code} {response.reason}")
        return response.json()

    @staticmethod
    def buy(item_id, amount, token):
        if not all([item_id, amount, token]):
            raise ValueError("Missing required parameters: item_id, amount, and token are required")
        response = requests.post(
            f"{CROISSANT_BASE_URL}/api/buy",
            json={"itemId": item_id, "amount": amount, "token": token}
        )
        if not response.ok:
            raise Exception(f"Failed to buy item: {response.status_code} {response.reason}")
        return response.json()

    @staticmethod
    def has_item(user_id, item_id):
        if not all([user_id, item_id]):
            raise ValueError("Missing required parameters: user_id and item_id are required")
        response = requests.get(
            f"{CROISSANT_BASE_URL}/api/hasItem",
            params={"userId": user_id, "itemId": item_id}
        )
        if not response.ok:
            raise Exception(f"Failed to check item ownership: {response.status_code} {response.reason}")
        return response.json()

class Inventory:
    @staticmethod
    def get(user_id):
        if not user_id:
            raise ValueError("Missing required parameter: user_id is required")
        response = requests.get(
            f"{CROISSANT_BASE_URL}/inventory/{user_id}"
        )
        if not response.ok:
            raise Exception(f"Failed to fetch inventory: {response.status_code} {response.reason}")
        return response.json()

    @staticmethod
    def give(user_id, item_id, amount, token):
        if not all([user_id, item_id, amount, token]):
            raise ValueError("Missing required parameters: user_id, item_id, amount, and token are required")
        response = requests.post(
            f"{CROISSANT_BASE_URL}/api/giveItem",
            json={"userId": user_id, "itemId": item_id, "amount": amount, "token": token}
        )
        if not response.ok:
            raise Exception(f"Failed to give item: {response.status_code} {response.reason}")
        return response.json()

    @staticmethod
    def consume(user_id, item_id, amount, token):
        if not all([user_id, item_id, amount, token]):
            raise ValueError("Missing required parameters: user_id, item_id, amount, and token are required")
        response = requests.delete(
            f"{CROISSANT_BASE_URL}/api/consumeItem",
            json={"userId": user_id, "itemId": item_id, "amount": amount, "token": token}
        )
        if not response.ok:
            raise Exception(f"Failed to consume item: {response.status_code} {response.reason}")
        return response.json()

    @staticmethod
    def open_bundle(user_id, bundle_id, amount, token):
        if not all([user_id, bundle_id, amount, token]):
            raise ValueError("Missing required parameters: user_id, bundle_id, amount, and token are required")
        response = requests.put(
            f"{CROISSANT_BASE_URL}/api/openBundle",
            json={"userId": user_id, "bundleId": bundle_id, "amount": amount, "token": token}
        )
        if not response.ok:
            raise Exception(f"Failed to open bundle: {response.status_code} {response.reason}")
        return response.json()

class Games:
    @staticmethod
    def list():
        res = requests.get(f"{CROISSANT_BASE_URL}/games")
        if not res.ok:
            raise Exception('Failed to fetch games')
        return res.json()

    @staticmethod
    def get(game_id):
        res = requests.get(f"{CROISSANT_BASE_URL}/games/{game_id}")
        if not res.ok:
            return None
        return res.json()

    @staticmethod
    def create(name, description, price, show_in_store, token):
        res = requests.post(
            f"{CROISSANT_BASE_URL}/games",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "name": name,
                "description": description,
                "price": price,
                "showInStore": show_in_store
            }
        )
        return res.json()

    @staticmethod
    def update(game_id, name=None, description=None, price=None, show_in_store=None):
        data = {}
        if name is not None: data["name"] = name
        if description is not None: data["description"] = description
        if price is not None: data["price"] = price
        if show_in_store is not None: data["showInStore"] = show_in_store
        res = requests.put(
            f"{CROISSANT_BASE_URL}/games/{game_id}",
            json=data
        )
        return res.json()

    @staticmethod
    def delete(game_id):
        res = requests.delete(f"{CROISSANT_BASE_URL}/games/{game_id}")
        return res.json()

class Lobbies:
    @staticmethod
    def get(lobby_id):
        res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}")
        if not res.ok:
            return None
        return res.json()

    @staticmethod
    def get_user_lobby(user_id):
        res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/user/{user_id}")
        if not res.ok:
            return None
        return res.json()

    @staticmethod
    def create(users):
        res = requests.post(
            f"{CROISSANT_BASE_URL}/lobbies",
            json={"users": users}
        )
        return res.json()

    @staticmethod
    def join(lobby_id, user_id):
        res = requests.post(
            f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}/join",
            json={"userId": user_id}
        )
        return res.json()

    @staticmethod
    def leave(lobby_id, user_id):
        res = requests.post(
            f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}/leave",
            json={"userId": user_id}
        )
        return res.json()

# Export grouped API
class CroissantAPI:
    users = Users
    items = Items
    inventory = Inventory
    games = Games
    lobbies = Lobbies