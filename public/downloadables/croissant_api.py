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
    - get_items(item_id=None) -> list or dict:
        Fetch items from the Croissant API.
        
        Parameters:
            item_id (str, optional): The ID of the specific item to fetch. If not provided, all items will be fetched.

        Returns:
            list or dict: A list of items if item_id is None, otherwise a single item dictionary.

        Raises:
            ValueError: If the item_id is provided but not found.
            Exception: If the request fails.

    - buy_item(item_id: str, amount: int, token: str) -> dict:
        Purchase an item through the Croissant API.

        Parameters:
            item_id (str): The ID of the item to purchase.
            amount (int): The quantity of the item to purchase.
            token (str): The authentication token for the user.

        Returns:
            dict: The response from the API after the purchase.

        Raises:
            ValueError: If any required parameters are missing.
            Exception: If the request fails.

    - has_item(user_id: str, item_id: str) -> dict:
        Check if a user owns a specific item.

        Parameters:
            user_id (str): The ID of the user.
            item_id (str): The ID of the item to check.

        Returns:
            dict: The response from the API indicating ownership.

        Raises:
            ValueError: If any required parameters are missing.
            Exception: If the request fails.

    - get_inventory(user_id: str) -> dict:
        Fetch the inventory of a user.

        Parameters:
            user_id (str): The ID of the user whose inventory is to be fetched.

        Returns:
            dict: The user's inventory.

        Raises:
            ValueError: If the user_id is missing.
            Exception: If the request fails.

    - give_item(user_id: str, item_id: str, amount: int, token: str) -> dict:
        Give an item to a user.

        Parameters:
            user_id (str): The ID of the user to whom the item is given.
            item_id (str): The ID of the item to give.
            amount (int): The quantity of the item to give.
            token (str): The authentication token for the user.

        Returns:
            dict: The response from the API after giving the item.

        Raises:
            ValueError: If any required parameters are missing.
            Exception: If the request fails.

    - consume_item(user_id: str, item_id: str, amount: int, token: str) -> dict:
        Consume an item for a user.

        Parameters:
            user_id (str): The ID of the user consuming the item.
            item_id (str): The ID of the item to consume.
            amount (int): The quantity of the item to consume.
            token (str): The authentication token for the user.

        Returns:
            dict: The response from the API after consuming the item.

        Raises:
            ValueError: If any required parameters are missing.
            Exception: If the request fails.

    - open_bundle(user_id: str, bundle_id: str, amount: int, token: str) -> dict:
        Open a bundle for a user.

        Parameters:
            user_id (str): The ID of the user opening the bundle.
            bundle_id (str): The ID of the bundle to open.
            amount (int): The quantity of the bundle to open.
            token (str): The authentication token for the user.

        Returns:
            dict: The response from the API after opening the bundle.

        Raises:
            ValueError: If any required parameters are missing.
            Exception: If the request fails.
"""

import requests

CROISSANT_BASE_URL = 'https://croissant-api.fr'

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
    resource = '/api/items'
    response = requests.get(f"{CROISSANT_BASE_URL}{resource}")
    
    if not response.ok:
        raise Exception(f"Failed to fetch items: {response.status_code} {response.reason}")

    items = response.json()
    
    if item_id:
        item = next((item for item in items if item['id'] == item_id), None)
        if not item:
            raise ValueError(f"Item with id {item_id} not found")
        return item
    return items

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
        f"{CROISSANT_BASE_URL}/api/inventory",
        params={"userId": user_id}
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