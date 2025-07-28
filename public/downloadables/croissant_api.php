<?php

/**
 * Croissant API Client for PHP
 * 
 * This client library provides access to the Croissant API endpoints.
 * It supports user management, game operations, item transactions, inventory management,
 * lobby operations, studio management, and OAuth2 authentication.
 */

// API Models as arrays (PHP doesn't have interfaces like TypeScript)

class CroissantAPI {
    private $token;
    private $baseUrl = 'https://croissant-api.fr/api';

    public function __construct($token = null) {
        $this->token = $token;
    }

    /**
     * Make HTTP request to API
     */
    private function request($method, $endpoint, $body = null, $auth = false) {
        $url = $this->baseUrl . $endpoint;
        $headers = [
            'Content-Type: application/json'
        ];
        
        if ($auth && $this->token) {
            $headers[] = 'Authorization: Bearer ' . $this->token;
        }
        
        $opts = [
            'http' => [
                'method' => $method,
                'header' => implode("\r\n", $headers),
                'ignore_errors' => true
            ]
        ];
        
        if ($body) {
            $opts['http']['content'] = json_encode($body);
        }
        
        $context = stream_context_create($opts);
        $result = file_get_contents($url, false, $context);
        
        if ($result === false) {
            throw new Exception('Failed to make API request');
        }
        
        $decoded = json_decode($result, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response: ' . json_last_error_msg());
        }
        
        return $decoded;
    }

    // === USER ENDPOINTS ===

    /**
     * Get current authenticated user
     */
    public function getMe() {
        return $this->request('GET', '/users/@me', null, true);
    }

    /**
     * Get user by ID
     */
    public function getUser($userId) {
        return $this->request('GET', "/users/$userId");
    }

    /**
     * Search users by query
     */
    public function searchUsers($query) {
        return $this->request('GET', '/users/search?q=' . urlencode($query));
    }

    /**
     * Verify user credentials
     */
    public function verifyUser($userId, $verificationKey) {
        return $this->request('GET', "/users/auth-verification?userId=$userId&verificationKey=" . urlencode($verificationKey));
    }

    /**
     * Transfer credits to another user
     */
    public function transferCredits($targetUserId, $amount) {
        return $this->request('POST', '/users/transfer-credits', [
            'targetUserId' => $targetUserId,
            'amount' => $amount
        ], true);
    }

    /**
     * Create a new user
     */
    public function createUser($userData) {
        return $this->request('POST', '/users/create', $userData, true);
    }

    /**
     * Get user by Steam ID
     */
    public function getUserBySteamId($steamId) {
        return $this->request('GET', '/users/getUserBySteamId?steamId=' . urlencode($steamId));
    }

    /**
     * Update user information
     */
    public function updateUser($userId, $userData) {
        return $this->request('PUT', "/users/$userId", $userData, true);
    }

    /**
     * Delete user
     */
    public function deleteUser($userId) {
        return $this->request('DELETE', "/users/$userId", null, true);
    }

    /**
     * Give credits to user
     */
    public function giveCredits($userId, $amount) {
        return $this->request('POST', '/users/give-credits', [
            'userId' => $userId,
            'amount' => $amount
        ], true);
    }

    // === GAME ENDPOINTS ===

    /**
     * List all games
     */
    public function listGames() {
        return $this->request('GET', '/games');
    }

    /**
     * Get game by ID
     */
    public function getGame($gameId) {
        return $this->request('GET', "/games/$gameId");
    }

    /**
     * List games owned by current user
     */
    public function listMine() {
        return $this->request('GET', '/games/@mine', null, true);
    }

    /**
     * List games owned by current user (alternative endpoint)
     */
    public function listOwned() {
        return $this->request('GET', '/games/list/@me', null, true);
    }

    /**
     * List games owned by specific user
     */
    public function listOwnedByUser($userId) {
        return $this->request('GET', "/games/list/$userId");
    }

    /**
     * Create new game
     */
    public function createGame($gameData) {
        return $this->request('POST', '/games', $gameData, true);
    }

    /**
     * Update existing game
     */
    public function updateGame($gameId, $gameData) {
        return $this->request('PUT', "/games/$gameId", $gameData, true);
    }

    /**
     * Delete game
     */
    public function deleteGame($gameId) {
        return $this->request('DELETE', "/games/$gameId", null, true);
    }

    // === ITEM ENDPOINTS ===

    /**
     * List all items
     */
    public function listItems() {
        return $this->request('GET', '/items');
    }

    /**
     * List items created by current user
     */
    public function listMineItems() {
        return $this->request('GET', '/items/@mine', null, true);
    }

    /**
     * Get item by ID
     */
    public function getItem($itemId) {
        return $this->request('GET', "/items/$itemId");
    }

    /**
     * Create new item
     */
    public function createItem($itemData) {
        return $this->request('POST', '/items/create', $itemData, true);
    }

    /**
     * Update existing item
     */
    public function updateItem($itemId, $itemData) {
        return $this->request('PUT', "/items/$itemId", $itemData, true);
    }

    /**
     * Delete item
     */
    public function deleteItem($itemId) {
        return $this->request('DELETE', "/items/$itemId", null, true);
    }

    /**
     * Buy item from shop
     */
    public function buyItem($itemId, $amount) {
        return $this->request('POST', '/items/buy', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }

    /**
     * Sell item back to shop
     */
    public function sellItem($itemId, $amount) {
        return $this->request('POST', '/items/sell', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }

    /**
     * Give item to user (admin only)
     */
    public function giveItem($itemId, $amount) {
        return $this->request('POST', '/items/give', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }

    /**
     * Consume item from inventory
     */
    public function consumeItem($itemId, $amount) {
        return $this->request('POST', '/items/consume', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }

    /**
     * Drop item from inventory
     */
    public function dropItem($itemId, $amount) {
        return $this->request('POST', '/items/drop', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }

    /**
     * Transfer item to another user
     */
    public function transferItem($itemId, $amount, $targetUserId) {
        return $this->request('POST', '/items/transfer', [
            'itemId' => $itemId,
            'amount' => $amount,
            'targetUserId' => $targetUserId
        ], true);
    }

    // === INVENTORY ENDPOINTS ===

    /**
     * Get user's inventory
     */
    public function getInventory($userId) {
        return $this->request('GET', "/inventory/$userId");
    }

    /**
     * Get current user's inventory
     */
    public function getMyInventory() {
        return $this->request('GET', '/inventory/@me', null, true);
    }

    // === LOBBY ENDPOINTS ===

    /**
     * Get lobby by ID
     */
    public function getLobby($lobbyId) {
        return $this->request('GET', "/lobbies/$lobbyId");
    }

    /**
     * Get user's current lobby
     */
    public function getUserLobby($userId) {
        return $this->request('GET', "/lobbies/user/$userId");
    }

    /**
     * Get current user's lobby
     */
    public function getMyLobby() {
        return $this->request('GET', '/lobbies/@me', null, true);
    }

    /**
     * Create new lobby
     */
    public function createLobby($lobbyData) {
        return $this->request('POST', '/lobbies', $lobbyData, true);
    }

    /**
     * Join a lobby
     */
    public function joinLobby($lobbyId) {
        return $this->request('POST', '/lobbies/join', ['lobbyId' => $lobbyId], true);
    }

    /**
     * Leave current lobby
     */
    public function leaveLobby($lobbyId) {
        return $this->request('POST', '/lobbies/leave', ['lobbyId' => $lobbyId], true);
    }

    /**
     * Update lobby
     */
    public function updateLobby($lobbyId, $lobbyData) {
        return $this->request('PUT', "/lobbies/$lobbyId", $lobbyData, true);
    }

    /**
     * Delete lobby
     */
    public function deleteLobby($lobbyId) {
        return $this->request('DELETE', "/lobbies/$lobbyId", null, true);
    }

    // === STUDIO ENDPOINTS ===

    /**
     * Get studio by ID
     */
    public function getStudio($studioId) {
        return $this->request('GET', "/studios/$studioId");
    }

    /**
     * List all studios
     */
    public function listStudios() {
        return $this->request('GET', '/studios');
    }

    /**
     * Create new studio
     */
    public function createStudio($studioData) {
        return $this->request('POST', '/studios', $studioData, true);
    }

    /**
     * Update studio
     */
    public function updateStudio($studioId, $studioData) {
        return $this->request('PUT', "/studios/$studioId", $studioData, true);
    }

    /**
     * Delete studio
     */
    public function deleteStudio($studioId) {
        return $this->request('DELETE', "/studios/$studioId", null, true);
    }

    // === OAUTH2 ENDPOINTS ===

    /**
     * Exchange authorization code for access token
     */
    public function getUserByCode($code, $clientId, $clientSecret, $redirectUri) {
        return $this->request('POST', '/oauth2/token', [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code'
        ]);
    }

    /**
     * Refresh access token
     */
    public function refreshToken($refreshToken, $clientId, $clientSecret) {
        return $this->request('POST', '/oauth2/token', [
            'refresh_token' => $refreshToken,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'grant_type' => 'refresh_token'
        ]);
    }

    /**
     * Revoke access token
     */
    public function revokeToken($token, $clientId, $clientSecret) {
        return $this->request('POST', '/oauth2/revoke', [
            'token' => $token,
            'client_id' => $clientId,
            'client_secret' => $clientSecret
        ]);
    }

    // === UTILITY METHODS ===

    /**
     * Set authentication token
     */
    public function setToken($token) {
        $this->token = $token;
    }

    /**
     * Get current authentication token
     */
    public function getToken() {
        return $this->token;
    }

    /**
     * Set base URL for API requests
     */
    public function setBaseUrl($baseUrl) {
        $this->baseUrl = rtrim($baseUrl, '/');
    }

    /**
     * Get current base URL
     */
    public function getBaseUrl() {
        return $this->baseUrl;
    }
}

?>
