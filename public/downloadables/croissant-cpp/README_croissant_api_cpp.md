# Croissant API C++ Library

Une librairie C++ moderne pour interagir avec l'API Croissant. Cette librairie a été entièrement recodée depuis zéro en se basant sur l'interface TypeScript pour fournir une expérience développeur cohérente et typée.

## Fonctionnalités

- **Interface moderne** : Utilise des namespaces pour organiser les méthodes par catégorie
- **Type safety** : Structures C++ fortement typées correspondant aux interfaces TypeScript
- **Gestion d'erreurs** : Exceptions appropriées et codes de retour clairs
- **Documentation complète** : Toutes les méthodes sont documentées avec leurs paramètres
- **Support complet de l'API** : Toutes les fonctionnalités de l'API Croissant sont supportées

## Dépendances

- **nlohmann/json** : Pour la sérialisation/désérialisation JSON
- **cpr** : Pour les requêtes HTTP
- **C++17** ou plus récent

## Installation

### Avec vcpkg (recommandé)

```bash
vcpkg install nlohmann-json cpr
```

### Avec CMake

```cmake
find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

target_link_libraries(your_target PRIVATE nlohmann_json::nlohmann_json cpr::cpr)
```

## Utilisation de base

```cpp
#include "croissant_api_new.hpp"
#include <iostream>

using namespace CroissantAPI;

int main() {
    // Créer un client avec un token d'authentification
    Client api("your_api_token_here");
    
    try {
        // Obtenir les informations de l'utilisateur authentifié
        auto user = api.users.getMe();
        if (user) {
            std::cout << "Connecté en tant que: " << user->username << std::endl;
            std::cout << "User ID: " << user->userId << std::endl;
            if (user->balance) {
                std::cout << "Solde: " << *user->balance << " crédits" << std::endl;
            }
        }
        
        // Lister tous les jeux disponibles
        auto games = api.games.list();
        std::cout << "Jeux disponibles: " << games.size() << std::endl;
        
        // Rechercher des utilisateurs
        auto users = api.users.search("john");
        for (const auto& foundUser : users) {
            std::cout << "Utilisateur trouvé: " << foundUser.username << std::endl;
        }
        
        // Obtenir l'inventaire
        auto [userId, inventory] = api.inventory.getMyInventory();
        std::cout << "Items dans l'inventaire: " << inventory.size() << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "Erreur: " << e.what() << std::endl;
    }
    
    return 0;
}
```

## Organisation par Namespaces

La librairie organise les méthodes en namespaces logiques :

### Users (`api.users`)
- `getMe()` - Obtenir le profil de l'utilisateur authentifié
- `search(query)` - Rechercher des utilisateurs
- `getUser(userId)` - Obtenir un utilisateur par ID
- `transferCredits(targetUserId, amount)` - Transférer des crédits
- `verify(userId, verificationKey)` - Vérifier un utilisateur
- `changeUsername(username)` - Changer le nom d'utilisateur
- `changePassword(oldPassword, newPassword, confirmPassword)` - Changer le mot de passe

### Games (`api.games`)
- `list()` - Lister tous les jeux
- `search(query)` - Rechercher des jeux
- `get(gameId)` - Obtenir un jeu par ID
- `getMyCreatedGames()` - Obtenir les jeux créés par l'utilisateur
- `getMyOwnedGames()` - Obtenir les jeux possédés par l'utilisateur
- `create(game)` - Créer un nouveau jeu
- `update(gameId, game)` - Mettre à jour un jeu
- `buy(gameId)` - Acheter un jeu

### Items (`api.items`)
- `list()` - Lister tous les items
- `search(query)` - Rechercher des items
- `get(itemId)` - Obtenir un item par ID
- `getMyItems()` - Obtenir les items créés par l'utilisateur
- `create(name, description, price, iconHash, showInStore)` - Créer un item
- `update(itemId, item)` - Mettre à jour un item
- `deleteItem(itemId)` - Supprimer un item
- `buy(itemId, amount)` - Acheter un item
- `sell(itemId, amount)` - Vendre un item
- `give(itemId, amount, userId, metadata)` - Donner un item à un utilisateur
- `consume(itemId, userId, amount, uniqueId)` - Consommer un item
- `updateMetadata(itemId, uniqueId, metadata)` - Mettre à jour les métadonnées
- `drop(itemId, amount, uniqueId)` - Jeter un item

### Inventory (`api.inventory`)
- `getMyInventory()` - Obtenir l'inventaire de l'utilisateur authentifié
- `get(userId)` - Obtenir l'inventaire d'un utilisateur

### Lobbies (`api.lobbies`)
- `create()` - Créer un lobby
- `get(lobbyId)` - Obtenir un lobby par ID
- `getMyLobby()` - Obtenir le lobby de l'utilisateur
- `getUserLobby(userId)` - Obtenir le lobby d'un utilisateur
- `join(lobbyId)` - Rejoindre un lobby
- `leave(lobbyId)` - Quitter un lobby

### Studios (`api.studios`)
- `create(studioName)` - Créer un studio
- `get(studioId)` - Obtenir un studio par ID
- `getMyStudios()` - Obtenir les studios de l'utilisateur
- `addUser(studioId, userId)` - Ajouter un utilisateur au studio
- `removeUser(studioId, userId)` - Retirer un utilisateur du studio

### Trades (`api.trades`)
- `startOrGetPending(userId)` - Démarrer ou obtenir un échange en cours
- `get(tradeId)` - Obtenir un échange par ID
- `getUserTrades(userId)` - Obtenir les échanges d'un utilisateur
- `addItem(tradeId, tradeItem)` - Ajouter un item à l'échange
- `removeItem(tradeId, tradeItem)` - Retirer un item de l'échange
- `approve(tradeId)` - Approuver un échange
- `cancel(tradeId)` - Annuler un échange

### OAuth2 (`api.oauth2`)
- `getApp(client_id)` - Obtenir une app OAuth2
- `createApp(name, redirect_urls)` - Créer une app OAuth2
- `getMyApps()` - Obtenir les apps OAuth2 de l'utilisateur
- `updateApp(client_id, name, redirect_urls)` - Mettre à jour une app
- `deleteApp(client_id)` - Supprimer une app
- `authorize(client_id, redirect_uri)` - Autoriser un utilisateur
- `getUserByCode(code, client_id)` - Obtenir un utilisateur par code

## Gestion des erreurs

La librairie utilise plusieurs mécanismes pour la gestion d'erreurs :

- **std::optional** : Pour les méthodes qui peuvent ne pas retourner de résultat
- **std::runtime_error** : Pour les erreurs nécessitant un token manquant
- **APIResponse** : Pour les opérations qui retournent un statut et un message

```cpp
// Utilisation avec std::optional
auto user = api.users.getUser("user_id");
if (user) {
    std::cout << "Utilisateur trouvé: " << user->username << std::endl;
} else {
    std::cout << "Utilisateur non trouvé" << std::endl;
}

// Utilisation avec APIResponse
auto response = api.items.create("Mon Item", "Description", 10.0);
if (response.success) {
    std::cout << "Item créé: " << response.message << std::endl;
} else {
    std::cout << "Erreur: " << response.message << std::endl;
}

// Gestion des exceptions
try {
    auto inventory = api.inventory.getMyInventory();
} catch (const std::runtime_error& e) {
    std::cout << "Token requis: " << e.what() << std::endl;
}
```

## Structures de données

Toutes les structures correspondent aux interfaces TypeScript :

```cpp
// Exemple d'utilisation des structures
Game newGame;
newGame.name = "Mon Jeu";
newGame.description = "Description du jeu";
newGame.price = 19.99;
newGame.multiplayer = true;
newGame.genre = "Action";

auto createdGame = api.games.create(newGame);
if (createdGame) {
    std::cout << "Jeu créé avec l'ID: " << createdGame->gameId << std::endl;
}
```

## Compilation

```bash
# Avec g++
g++ -std=c++17 main.cpp croissant_api_new.cpp -lnlohmann_json -lcpr -o my_app

# Avec CMake
cmake_minimum_required(VERSION 3.10)
project(MyApp)

set(CMAKE_CXX_STANDARD 17)

find_package(nlohmann_json CONFIG REQUIRED)
find_package(cpr CONFIG REQUIRED)

add_executable(my_app main.cpp croissant_api_new.cpp)
target_link_libraries(my_app PRIVATE nlohmann_json::nlohmann_json cpr::cpr)
```

## Migration depuis l'ancienne version

La nouvelle librairie utilise une approche différente avec des namespaces :

```cpp
// Ancienne version
CroissantAPI api("token");
auto user = api.getMe();
auto games = api.listGames();

// Nouvelle version
CroissantAPI::Client api("token");
auto user = api.users.getMe();
auto games = api.games.list();
```

## Licence

Cette librairie suit la licence du projet Croissant.
