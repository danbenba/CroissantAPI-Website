from croissant_api import CroissantAPI

ITEM_ID = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce"
USER_ID = "724847846897221642"
TOKEN = "your_token_here"  # Remplacez par un vrai token

api = CroissantAPI(token=TOKEN)

def check_premium_access(user_id: str):
    inventory = api.inventory.get(user_id)
    # Utiliser 'itemId' (nouveau SDK)
    has_item = any(item.get('itemId') == ITEM_ID for item in inventory.get('inventory', []))
    
    if has_item:
        return {
            "color": "#00ff00",
            "title": "Premium Commands",
            "description": "You have access to premium commands!",
            "timestamp": True
        }
    else:
        return {
            "color": "#ff0000",
            "title": "Premium Access Required",
            "description": "To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.",
            "timestamp": True
        }

if __name__ == "__main__":
    result = check_premium_access(USER_ID)
    print(result)
