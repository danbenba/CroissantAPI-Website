const fetch = require('node-fetch');

const croissantBaseUrl = 'https://croissant-api.fr';

/**
 * Fetch items from the Croissant API.
 * 
 * @param {Object} [options] - Options for fetching items.
 * @param {string|null} [options.itemId=null] - The ID of the specific item to fetch. If not provided, all items will be fetched.
 * @returns {Promise<Object|Array>} - A promise that resolves to a list of items if itemId is null, otherwise a single item object.
 * @throws {Error} - Throws an error if the itemId is provided but not found or if the fetch fails.
 */
async function getItems({ itemId = null } = {}) {
    const resource = '/api/items';
    const response = await fetch(`${croissantBaseUrl}${resource}`);
    
    if (!response.ok) {
        throw new Error('Failed to fetch items');
    }

    const data = await response.json();

    if (itemId) {
        const item = data.find(item => item.id === itemId);
        if (!item) {
            throw new Error(`Item with id ${itemId} not found`);
        }
        return item;
    }

    return data;
}

/**
 * Purchase an item through the Croissant API.
 * 
 * @param {Object} options - Options for purchasing an item.
 * @param {string} options.itemId - The ID of the item to purchase.
 * @param {number} options.amount - The quantity of the item to purchase.
 * @param {string} options.token - The authentication token for the user.
 * @returns {Promise<Object>} - A promise that resolves to the response from the API after the purchase.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function buyItem({ itemId, amount, token }) {
    const errors = [];
    if (!itemId) {
        errors.push('itemId is required');
    }
    if (!amount) {
        errors.push('amount is required');
    }
    if (!token) {
        errors.push('token is required');
    }
    if (errors.length > 0) {
        throw new Error('Missing required parameters: ' + errors.join(', '));
    }

    const response = await fetch(`${croissantBaseUrl}/api/buy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, amount, token })
    });

    if (!response.ok) {
        throw new Error('Failed to buy item');
    }

    return await response.json();
}

/**
 * Check if a user has a specific item.
 * 
 * @param {Object} options - Options for checking item ownership.
 * @param {string} options.userId - The ID of the user to check.
 * @param {string} options.itemId - The ID of the item to check.
 * @returns {Promise<Object>} - A promise that resolves to the response indicating item ownership.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function hasItem({ userId, itemId }) {
    const errors = [];
    if (!userId) {
        errors.push('userId is required');
    }
    if (!itemId) {
        errors.push('itemId is required');
    }
    if (errors.length > 0) {
        throw new Error('Missing required parameters: ' + errors.join(', '));
    }

    const response = await fetch(`${croissantBaseUrl}/api/hasItem?userId=${userId}&itemId=${itemId}`);

    if (!response.ok) {
        throw new Error('Failed to check item ownership');
    }

    return await response.json();
}

/**
 * Fetch the inventory of a user.
 * 
 * @param {Object} options - Options for fetching inventory.
 * @param {string} options.userId - The ID of the user whose inventory is to be fetched.
 * @returns {Promise<Object>} - A promise that resolves to the user's inventory.
 * @throws {Error} - Throws an error if the userId is missing or if the fetch fails.
 */
async function getInventory({ userId }) {
    const errors = [];
    if (!userId) {
        errors.push('userId is required');
    }
    if (errors.length > 0) {
        throw new Error('Missing required parameters: ' + errors.join(', '));
    }

    const response = await fetch(`${croissantBaseUrl}/api/inventory?userId=${userId}`);

    if (!response.ok) {
        throw new Error('Failed to fetch inventory');
    }

    return await response.json();
}

/**
 * Give an item to a user.
 * 
 * @param {Object} options - Options for giving an item.
 * @param {string} options.userId - The ID of the user to give the item to.
 * @param {string} options.itemId - The ID of the item to give.
 * @param {number} options.amount - The quantity of the item to give.
 * @param {string} options.token - The authentication token for the user.
 * @returns {Promise<Object>} - A promise that resolves to the response from the API after giving the item.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function giveItem({ userId, itemId, amount, token }) {
    const errors = [];
    if (!userId) {
        errors.push('userId is required');
    }
    if (!itemId) {
        errors.push('itemId is required');
    }
    if (!amount) {
        errors.push('amount is required');
    }
    if (!token) {
        errors.push('token is required');
    }

    const response = await fetch(`${croissantBaseUrl}/api/giveItem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, itemId, amount, token })
    });

    if (!response.ok) {
        throw new Error('Failed to give item');
    }

    return await response.json();
}

/**
 * Consume an item from a user's inventory.
 * 
 * @param {Object} options - Options for consuming an item.
 * @param {string} options.userId - The ID of the user consuming the item.
 * @param {string} options.itemId - The ID of the item to consume.
 * @param {number} options.amount - The quantity of the item to consume.
 * @param {string} options.token - The authentication token for the user.
 * @returns {Promise<Object>} - A promise that resolves to the response from the API after consuming the item.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function consumeItem({ userId, itemId, amount, token }) {
    if (!userId || !itemId || !amount || !token) {
        throw new Error('Missing required parameters: userId, itemId, amount, and token are required');
    }

    const response = await fetch(`${croissantBaseUrl}/api/consumeItem`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, itemId, amount, token })
    });

    if (!response.ok) {
        throw new Error('Failed to consume item');
    }

    return await response.json();
}

/**
 * Open a bundle for a user.
 * 
 * @param {Object} options - Options for opening a bundle.
 * @param {string} options.userId - The ID of the user opening the bundle.
 * @param {string} options.bundleId - The ID of the bundle to open.
 * @param {number} options.amount - The quantity of the bundle to open.
 * @param {string} options.token - The authentication token for the user.
 * @returns {Promise<Object>} - A promise that resolves to the response from the API after opening the bundle.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function openBundle({ userId, bundleId, amount, token }) {
    if (!userId || !bundleId || !amount || !token) {
        throw new Error('Missing required parameters: userId, bundleId, amount, and token are required');
    }

    const response = await fetch(`${croissantBaseUrl}/api/openBundle`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, bundleId, amount, token })
    });

    if (!response.ok) {
        throw new Error('Failed to open bundle');
    }

    return await response.json();
}


module.exports = {
    getItems,
    buyItem,
    hasItem,
    getInventory,
    giveItem,
    consumeItem
}
