from croissant_api import CroissantAPI

item_id = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce"
user_id = "724847846897221642"

def check_premium_access(user_id):
    inventory = CroissantAPI.inventory.get(user_id)
    has_item = any(item['id'] == item_id for item in inventory.get('inventory', []))
    
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

def verify_user(user_id, verification_key):
    return CroissantAPI.users.verify(user_id, verification_key)

# Example usage:
check_premium_access(user_id)
# verify_user(user_id, "your_verification_key")