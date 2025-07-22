<?php

class CroissantAPI {
    private $token;
    private $baseUrl = 'https://croissant-api.fr/api';

    public function __construct($token = null) {
        $this->token = $token;
    }

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
        return json_decode($result, true);
    }

    // --- USERS ---
    public function getMe() {
        return $this->request('GET', '/users/@me', null, true);
    }
    public function getUser($userId) {
        return $this->request('GET', "/users/$userId");
    }
    public function searchUsers($query) {
        return $this->request('GET', '/users/search?q=' . urlencode($query));
    }
    public function verifyUser($userId, $verificationKey) {
        return $this->request('GET', "/users/auth-verification?userId=$userId&verificationKey=$verificationKey");
    }
    public function transferCredits($targetUserId, $amount) {
        return $this->request('POST', '/users/transfer-credits', [
            'targetUserId' => $targetUserId,
            'amount' => $amount
        ], true);
    }
    public function createUser($userArr) {
        return $this->request('POST', '/users/create', $userArr, true);
    }
    public function getUserBySteamId($steamId) {
        return $this->request('GET', '/users/getUserBySteamId?steamId=' . urlencode($steamId));
    }

    // --- GAMES ---
    public function listGames() {
        return $this->request('GET', '/games');
    }
    public function getGame($gameId) {
        return $this->request('GET', "/games/$gameId");
    }
    public function listMine() {
        return $this->request('GET', '/games/@mine', null, true);
    }
    public function listOwned() {
        return $this->request('GET', '/games/list/@me', null, true);
    }
    public function listOwnedByUser($userId) {
        return $this->request('GET', "/games/list/$userId");
    }
    public function createGame($gameArr) {
        return $this->request('POST', '/games', $gameArr, true);
    }
    public function updateGame($gameId, $gameArr) {
        return $this->request('PUT', "/games/$gameId", $gameArr, true);
    }
    public function deleteGame($gameId) {
        return $this->request('DELETE', "/games/$gameId", null, true);
    }

    // --- ITEMS ---
    public function listItems() {
        return $this->request('GET', '/items');
    }
    public function listMineItems() {
        return $this->request('GET', '/items/@mine', null, true);
    }
    public function getItem($itemId) {
        return $this->request('GET', "/items/$itemId");
    }
    public function createItem($itemArr) {
        return $this->request('POST', '/items/create', $itemArr, true);
    }
    public function updateItem($itemId, $itemArr) {
        return $this->request('PUT', "/items/$itemId", $itemArr, true);
    }
    public function deleteItem($itemId) {
        return $this->request('DELETE', "/items/$itemId", null, true);
    }
    public function buyItem($itemId, $amount) {
        return $this->request('POST', '/items/buy', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }
    public function sellItem($itemId, $amount) {
        return $this->request('POST', '/items/sell', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }
    public function giveItem($itemId, $amount) {
        return $this->request('POST', '/items/give', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }
    public function consumeItem($itemId, $amount) {
        return $this->request('POST', '/items/consume', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }
    public function dropItem($itemId, $amount) {
        return $this->request('POST', '/items/drop', [
            'itemId' => $itemId,
            'amount' => $amount
        ], true);
    }
    public function transferItem($itemId, $amount, $targetUserId) {
        return $this->request('POST', '/items/transfer', [
            'itemId' => $itemId,
            'amount' => $amount,
            'targetUserId' => $targetUserId
        ], true);
    }

    // --- INVENTORY ---
    public function getInventory($userId) {
        return $this->request('GET', "/inventory/$userId");
    }

    // --- LOBBIES ---
    public function getLobby($lobbyId) {
        return $this->request('GET', "/lobbies/$lobbyId");
    }
    public function getUserLobby($userId) {
        return $this->request('GET', "/lobbies/user/$userId");
    }
    public function getMineLobby() {
        return $this->request('GET', '/lobbies/@me', null, true);
    }
    public function createLobby($lobbyArr) {
        return $this->request('POST', '/lobbies', $lobbyArr, true);
    }
    public function joinLobby($lobbyId) {
        return $this->request('POST', '/lobbies/join', [ 'lobbyId' => $lobbyId ], true);
    }
    public function leaveLobby($lobbyId) {
        return $this->request('POST', '/lobbies/leave', [ 'lobbyId' => $lobbyId ], true);
    }

    // --- STUDIOS ---
    public function getStudio($studioId) {
        return $this->request('GET', "/studios/$studioId");
    }

    // --- OAUTH2 ---
    public function getUserByCode($code, $client_id, $client_secret, $redirect_uri) {
        return $this->request('POST', '/oauth2/token', [
            'code' => $code,
            'client_id' => $client_id,
            'client_secret' => $client_secret,
            'redirect_uri' => $redirect_uri,
            'grant_type' => 'authorization_code'
        ]);
    }
}
