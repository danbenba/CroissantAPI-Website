import fetch from 'node-fetch';

const croissantBaseUrl = 'https://croissant-api.fr';

interface IFetchOptions {
    itemId?: string | null;
}

interface IBuyOptions {
    itemId: string;
    amount: number;
    token: string;
}

interface IItemOwnershipOptions {
    userId: string;
    itemId: string;
}

interface IInventoryOptions {
    userId: string;
}

interface IGiveOptions {
    userId: string;
    itemId: string;
    amount: number;
    token: string;
}

interface IConsumeOptions {
    userId: string;
    itemId: string;
    amount: number;
    token: string;
}

interface IOpenBundleOptions {
    userId: string;
    bundleId: string;
    amount: number;
    token: string;
}

interface IInventoryResponse {
    user: {
        id: string;
        name: string;
    };
    inventory: Array<{
        type: string;
        id: string;
        name: string;
        amount: number;
    }>;
}

interface IItemResponse {
    id: string;
    name: string;
    emoji: string;
}

interface IBuyResponse {
    success: boolean;
    message: string;
    newBalance: number;
}

interface IHasItemResponse {
    hasItem: boolean;
    amount: number;
    itemDetails: IItemResponse;
}

interface IInventoryResponse {
    user: {
        id: string;
        name: string;
    };
    inventory: Array<{
        type: string;
        id: string;
        name: string;
        amount: number;
    }>;
}

interface IGiveResponse {
    success: boolean;
    message: string;
    amount: number;
}

interface IConsumeResponse {
    success: boolean;
    message: string;
    amount: number;
}

interface IOpenBundleResponse {
    success: boolean;
    message: string;
    amount: number;
}

/**
 * Fetch items from the Croissant API.
 * 
 * @param {IFetchOptions} [options] - Options for fetching items.
 * @returns {Promise<IItemResponse[]|IItemResponse>} - A promise that resolves to a list of items if itemId is null, otherwise a single item object.
 * @throws {Error} - Throws an error if the itemId is provided but not found or if the fetch fails.
 */
async function getItems({ itemId = null }: IFetchOptions = {}): Promise<IItemResponse[]|IItemResponse> {
    const response = await fetch(`${croissantBaseUrl}/api/items`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`Failed to fetch items: ${res.status} ${res.statusText}`);
            }
            return res.json();
        });

    if (itemId) {
        const item = response.find((item: { id: string }) => item.id === itemId);
        if (!item) {
            throw new Error(`Item with id ${itemId} not found in the response`);
        }
        return item;
    }

    return response;
}

/**
 * Purchase an item through the Croissant API.
 * 
 * @param {IBuyOptions} options - Options for purchasing an item.
 * @returns {Promise<IBuyResponse>} - A promise that resolves to the response from the API after the purchase.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function buyItem({ itemId, amount, token }: IBuyOptions): Promise<IBuyResponse> {
    const errors: string[] = [];
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

    return fetch(`${croissantBaseUrl}/api/buy`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId, amount, token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to buy item: ${response.status} ${response.statusText}`);
        }
        return response.json();
    });
}

/**
 * Check if a user has a specific item.
 * 
 * @param {IItemOwnershipOptions} options - Options for checking item ownership.
 * @returns {Promise<IHasItemResponse>} - A promise that resolves to the response indicating item ownership.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function hasItem({ userId, itemId }: IItemOwnershipOptions): Promise<IHasItemResponse> {
    if (!userId || !itemId) {
        throw new Error('Missing required parameters: userId and itemId are required');
    }

    return fetch(`${croissantBaseUrl}/api/hasItem?userId=${userId}&itemId=${itemId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to check item ownership: ${response.status} ${response.statusText}`);
        }
        return response.json();
    });
}

/**
 * Fetch the inventory of a user.
 * 
 * @param {IInventoryOptions} options - Options for fetching inventory.
 * @returns {Promise<IInventoryResponse>} - A promise that resolves to the user's inventory.
 * @throws {Error} - Throws an error if the userId is missing or if the fetch fails.
 */
async function getInventory({ userId }: IInventoryOptions): Promise<IInventoryResponse> {
    if (!userId) {
        throw new Error('Missing required parameter: userId is required');
    }

    return fetch(`${croissantBaseUrl}/api/inventory?userId=${userId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to fetch inventory: ${response.status} ${response.statusText}`);
        }
        return response.json();
    });
}

/**
 * Give an item to a user.
 * 
 * @param {IGiveOptions} options - Options for giving an item.
 * @returns {Promise<IGiveResponse>} - A promise that resolves to the response from the API after giving the item.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function giveItem({ userId, itemId, amount, token }: IGiveOptions): Promise<IGiveResponse> {
    const errors: string[] = [];
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
    if (errors.length > 0) {
        throw new Error('Missing required parameters: ' + errors.join(', '));
    }

    return fetch(`${croissantBaseUrl}/api/giveItem`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, itemId, amount, token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to give item: ${response.status} ${response.statusText}`);
        }
        return response.json();
    });
}

/**
 * Consume an item from a user's inventory.
 * 
 * @param {IConsumeOptions} options - Options for consuming an item.
 * @returns {Promise<IConsumeResponse>} - A promise that resolves to the response from the API after consuming the item.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function consumeItem({ userId, itemId, amount, token }: IConsumeOptions): Promise<IConsumeResponse> {
    const errors: string[] = [];
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

    return fetch(`${croissantBaseUrl}/api/consumeItem`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, itemId, amount, token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to consume item: ${response.status} ${response.statusText}`);
        }
        return response.json();
    });
}

/**
 * Open a bundle for a user.
 * 
 * @param {IOpenBundleOptions} options - Options for opening a bundle.
 * @returns {Promise<IOpenBundleResponse>} - A promise that resolves to the response from the API after opening the bundle.
 * @throws {Error} - Throws an error if any required parameters are missing or if the fetch fails.
 */
async function openBundle({ userId, bundleId, amount, token }: IOpenBundleOptions): Promise<IOpenBundleResponse> {
    const errors: string[] = [];
    if (!userId) {
        errors.push('userId is required');
    }
    if (!bundleId) {
        errors.push('bundleId is required');
    }
    if (!amount) {
        errors.push('amount is required');
    }
    if (!token) {
        errors.push('token is required');
    }

    if (errors.length > 0) {
        throw new Error(`Missing required parameters: ${errors.join(', ')}`);
    }

    return fetch(`${croissantBaseUrl}/api/openBundle`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, bundleId, amount, token })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Failed to open bundle: ${response.status} ${response.statusText}`);
        }
        return response.json();
    });
}


export {
    getItems,
    buyItem,
    hasItem,
    getInventory,
    giveItem,
    consumeItem
};
