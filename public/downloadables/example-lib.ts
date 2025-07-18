import { CroissantAPI, InventoryItem } from './croissant-api';

const croissantApi = new CroissantAPI({
    token: process.env.CROISSANT_API_TOKEN || "",
})

const itemId = "6ef3f681-a8b3-4480-804e-7c6168e7f0ce";
const userId = "724847846897221642";

async function checkPremiumAccess(userId: string) {
    const inventory = await croissantApi.inventory.get(userId) as InventoryItem[];
    const hasItem = inventory.some(item => item.itemId === itemId);
    
    if (hasItem) {
        return {
            color: "#00ff00",
            title: "Premium Commands",
            description: "You have access to premium commands!",
            timestamp: new Date().toISOString()
        };
    } else {
        return {
            color: "#ff0000",
            title: "Premium Access Required",
            description: "To access premium commands, you must own a **Weathley Crab**!\n\nYou can obtain one via the `/shop` command of the Croissant bot.",
            timestamp: new Date().toISOString()
        };
    }
}

checkPremiumAccess(userId).then(console.log);
