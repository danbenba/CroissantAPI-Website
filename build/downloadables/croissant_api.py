"""
Croissant API for Python

This module provides functions to interact with the Croissant API.

Usage:
    Import this module to use the Croissant API functions.

    Example:
        from croissant_api import get_items, buy_item

Base URL:
    The base URL for the Croissant API is set to 'https://croissant-api.fr'.

Functions:
    - create_user(user_id, username, balance) -> dict:
        Create a new user.

    - get_user(user_id) -> dict or None:
        Fetch a user by ID.

    - get_items(item_id=None) -> list or dict:
        Fetch items from the Croissant API.

    - get_inventory(user_id) -> dict:
        Fetch the inventory of a user.

    - buy_item(item_id, amount, token) -> dict:
        Purchase an item.

    - give_item(user_id, item_id, amount, token) -> dict:
        Give an item to a user.

    - consume_item(user_id, item_id, amount, token) -> dict:
        Consume an item for a user.

    - open_bundle(user_id, bundle_id, amount, token) -> dict:
        Open a bundle for a user.

    - has_item(user_id, item_id) -> dict:
        Check if a user owns a specific item.

    - list_games() -> list:
        List all games.

    - get_game(game_id) -> dict or None:
        Fetch a game by ID.

    - create_game(name, description, price, show_in_store, token) -> dict:
        Create a new game.

    - update_game(game_id, name=None, description=None, price=None, show_in_store=None) -> dict:
        Update a game.

    - delete_game(game_id) -> dict:
        Delete a game.

    - get_lobby(lobby_id) -> dict or None:
        Fetch a lobby by ID.

    - get_user_lobby(user_id) -> dict or None:
        Fetch the lobby of a user.

    - create_lobby(users) -> dict:
        Create a new lobby.

    - join_lobby(lobby_id, user_id) -> dict:
        Join a lobby.

    - leave_lobby(lobby_id, user_id) -> dict:
        Leave a lobby.
"""

import requests

CROISSANT_BASE_URL = 'https://croissant-api.fr'

# --- Utilisateurs ---
def create_user(user_id, username, balance):
    """Create a new user."""
    res = requests.post(
        f"{CROISSANT_BASE_URL}/users/create",
        json={"userId": user_id, "username": username, "balance": balance}
    )
    return res.json()

def get_user(user_id):
    """Fetch a user by ID."""
    res = requests.get(f"{CROISSANT_BASE_URL}/users/{user_id}")
    if not res.ok:
        return None
    return res.json()

# --- Items ---
def get_items(item_id=None):
    """
    Fetch items from the Croissant API.

    Parameters:
    - item_id (str, optional): The ID of the specific item to fetch. If not provided, all items will be fetched.

    Returns:
    - list or dict: A list of items if item_id is None, otherwise a single item dictionary.

    Raises:
    - ValueError: If the item_id is provided but not found.
    - Exception: If the request fails.
    """
    url = f"{CROISSANT_BASE_URL}/items"
    if item_id:
        url += f"/{item_id}"
    response = requests.get(url)
    if not response.ok:
        raise Exception(f"Failed to fetch items: {response.status_code} {response.reason}")
    return response.json()

def buy_item(item_id, amount, token):
    """
    Purchase an item through the Croissant API.

    Parameters:
    - item_id (str): The ID of the item to purchase.
    - amount (int): The quantity of the item to purchase.
    - token (str): The authentication token for the user.

    Returns:
    - dict: The response from the API after the purchase.

    Raises:
    - ValueError: If any required parameters are missing.
    - Exception: If the request fails.
    """
    if not all([item_id, amount, token]):
        raise ValueError("Missing required parameters: item_id, amount, and token are required")
    response = requests.post(
        f"{CROISSANT_BASE_URL}/api/buy",
        json={"itemId": item_id, "amount": amount, "token": token}
    )
    if not response.ok:
        raise Exception(f"Failed to buy item: {response.status_code} {response.reason}")
    return response.json()

def has_item(user_id, item_id):
    """
    Check if a user owns a specific item.

    Parameters:
    - user_id (str): The ID of the user.
    - item_id (str): The ID of the item to check.

    Returns:
    - dict: The response from the API indicating ownership.

    Raises:
    - ValueError: If any required parameters are missing.
    - Exception: If the request fails.
    """
    if not all([user_id, item_id]):
        raise ValueError("Missing required parameters: user_id and item_id are required")
    response = requests.get(
        f"{CROISSANT_BASE_URL}/api/hasItem",
        params={"userId": user_id, "itemId": item_id}
    )
    if not response.ok:
        raise Exception(f"Failed to check item ownership: {response.status_code} {response.reason}")
    return response.json()

# --- Inventaire ---
def get_inventory(user_id):
    """
    Fetch the inventory of a user.

    Parameters:
    - user_id (str): The ID of the user whose inventory is to be fetched.

    Returns:
    - dict: The user's inventory.

    Raises:
    - ValueError: If the user_id is missing.
    - Exception: If the request fails.
    """
    if not user_id:
        raise ValueError("Missing required parameter: user_id is required")
    response = requests.get(
        f"{CROISSANT_BASE_URL}/inventory/{user_id}"
    )
    if not response.ok:
        raise Exception(f"Failed to fetch inventory: {response.status_code} {response.reason}")
    return response.json()

def give_item(user_id, item_id, amount, token):
    """
    Give an item to a user.

    Parameters:
    - user_id (str): The ID of the user to whom the item is given.
    - item_id (str): The ID of the item to give.
    - amount (int): The quantity of the item to give.
    - token (str): The authentication token for the user.

    Returns:
    - dict: The response from the API after giving the item.

    Raises:
    - ValueError: If any required parameters are missing.
    - Exception: If the request fails.
    """
    if not all([user_id, item_id, amount, token]):
        raise ValueError("Missing required parameters: user_id, item_id, amount, and token are required")
    response = requests.post(
        f"{CROISSANT_BASE_URL}/api/giveItem",
        json={"userId": user_id, "itemId": item_id, "amount": amount, "token": token}
    )
    if not response.ok:
        raise Exception(f"Failed to give item: {response.status_code} {response.reason}")
    return response.json()

def consume_item(user_id, item_id, amount, token):
    """
    Consume an item for a user.

    Parameters:
    - user_id (str): The ID of the user consuming the item.
    - item_id (str): The ID of the item to consume.
    - amount (int): The quantity of the item to consume.
    - token (str): The authentication token for the user.

    Returns:
    - dict: The response from the API after consuming the item.

    Raises:
    - ValueError: If any required parameters are missing.
    - Exception: If the request fails.
    """
    if not all([user_id, item_id, amount, token]):
        raise ValueError("Missing required parameters: user_id, item_id, amount, and token are required")
    response = requests.delete(
        f"{CROISSANT_BASE_URL}/api/consumeItem",
        json={"userId": user_id, "itemId": item_id, "amount": amount, "token": token}
    )
    if not response.ok:
        raise Exception(f"Failed to consume item: {response.status_code} {response.reason}")
    return response.json()

def open_bundle(user_id, bundle_id, amount, token):
    """
    Open a bundle for a user.

    Parameters:
    - user_id (str): The ID of the user opening the bundle.
    - bundle_id (str): The ID of the bundle to open.
    - amount (int): The quantity of the bundle to open.
    - token (str): The authentication token for the user.

    Returns:
    - dict: The response from the API after opening the bundle.

    Raises:
    - ValueError: If any required parameters are missing.
    - Exception: If the request fails.
    """
    if not all([user_id, bundle_id, amount, token]):
        raise ValueError("Missing required parameters: user_id, bundle_id, amount, and token are required")
    response = requests.put(
        f"{CROISSANT_BASE_URL}/api/openBundle",
        json={"userId": user_id, "bundleId": bundle_id, "amount": amount, "token": token}
    )
    if not response.ok:
        raise Exception(f"Failed to open bundle: {response.status_code} {response.reason}")
    return response.json()

# --- Games ---
def list_games():
    """List all games."""
    res = requests.get(f"{CROISSANT_BASE_URL}/games")
    if not res.ok:
        raise Exception('Failed to fetch games')
    return res.json()

def get_game(game_id):
    """Fetch a game by ID."""
    res = requests.get(f"{CROISSANT_BASE_URL}/games/{game_id}")
    if not res.ok:
        return None
    return res.json()

def create_game(name, description, price, show_in_store, token):
    """Create a new game."""
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

def update_game(game_id, name=None, description=None, price=None, show_in_store=None):
    """Update a game."""
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

def delete_game(game_id):
    """Delete a game."""
    res = requests.delete(f"{CROISSANT_BASE_URL}/games/{game_id}")
    return res.json()

# --- Lobbies ---
def get_lobby(lobby_id):
    """Fetch a lobby by ID."""
    res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}")
    if not res.ok:
        return None
    return res.json()

def get_user_lobby(user_id):
    """Fetch the lobby of a user."""
    res = requests.get(f"{CROISSANT_BASE_URL}/lobbies/user/{user_id}")
    if not res.ok:
        return None
    return res.json()

def create_lobby(users):
    """Create a new lobby."""
    res = requests.post(
        f"{CROISSANT_BASE_URL}/lobbies",
        json={"users": users}
    )
    return res.json()

def join_lobby(lobby_id, user_id):
    """Join a lobby."""
    res = requests.post(
        f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}/join",
        json={"userId": user_id}
    )
    return res.json()

def leave_lobby(lobby_id, user_id):
    """Leave a lobby."""
    res = requests.post(
        f"{CROISSANT_BASE_URL}/lobbies/{lobby_id}/leave",
        json={"userId": user_id}
    )
    return res.json()