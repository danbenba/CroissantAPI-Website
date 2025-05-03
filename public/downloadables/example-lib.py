from croissant_api import get_inventory

item_id = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce"

def check_premium_access(user_id):
    inventory = get_inventory(user_id)
    has_item = any(item['id'] == item_id for item in inventory)
    
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
