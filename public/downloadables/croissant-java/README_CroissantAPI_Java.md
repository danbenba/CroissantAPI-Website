# CroissantAPI Java Client

Client Java pour l'API Croissant, permettant d'interagir avec tous les endpoints de l'écosystème Croissant.

## Installation

### Option 1: Téléchargement direct

1. Téléchargez les fichiers suivants :
   - `CroissantAPI.java` (classe principale)
   - `CroissantAPIExample.java` (exemple d'utilisation)
   - `pom.xml` ou `build.gradle` (selon votre système de build)

2. Ajoutez la dépendance Gson à votre projet

### Option 2: Avec Maven

Copiez le fichier `pom.xml` fourni dans votre projet et exécutez :

```bash
mvn clean compile
mvn exec:java -Dexec.mainClass="CroissantAPIExample"
```

### Option 3: Avec Gradle

Copiez le fichier `build.gradle` fourni dans votre projet et exécutez :

```bash
./gradlew build
./gradlew runExample
```

### Dépendances

#### Maven
```xml
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

#### Gradle
```gradle
implementation 'com.google.code.gson:gson:2.10.1'
```

## Utilisation de base

### Initialisation

```java
// Avec token d'authentification
CroissantAPI api = new CroissantAPI("votre_token_auth");

// Sans authentification (pour les endpoints publics)
CroissantAPI api = new CroissantAPI();
```

### Gestion des utilisateurs

```java
// Obtenir l'utilisateur actuel
User me = api.users.getMe();

// Rechercher des utilisateurs
List<User> users = api.users.search("nom_utilisateur");

// Obtenir un utilisateur par ID
User user = api.users.getUser("user_id");

// Transférer des crédits
Map<String, Object> result = api.users.transferCredits("target_user_id", 100);
```

### Gestion des jeux

```java
// Lister tous les jeux
List<Game> games = api.games.list();

// Rechercher des jeux
List<Game> adventureGames = api.games.search("adventure");

// Obtenir un jeu par ID
Game game = api.games.get("game_id");

// Acheter un jeu
Map<String, Object> purchase = api.games.buy("game_id");
```

### Gestion des objets

```java
// Lister tous les objets
List<Item> items = api.items.list();

// Acheter un objet
Map<String, Object> purchase = api.items.buy("item_id", 5);

// Vendre un objet
Map<String, Object> sale = api.items.sell("item_id", 2);

// Donner un objet à un utilisateur
Map<String, Object> gift = api.items.give("item_id", 1, "user_id");

// Donner un objet avec métadonnées
Map<String, Object> metadata = new HashMap<>();
metadata.put("custom_data", "valeur");
api.items.give("item_id", 1, "user_id", metadata);
```

### Gestion de l'inventaire

```java
// Obtenir l'inventaire de l'utilisateur actuel
CroissantAPI.Inventory.InventoryResponse myInventory = api.inventory.getMyInventory();

// Obtenir l'inventaire d'un autre utilisateur
CroissantAPI.Inventory.InventoryResponse userInventory = api.inventory.get("user_id");

// Accéder aux objets de l'inventaire
for (InventoryItem item : myInventory.inventory) {
    System.out.println("Objet: " + item.name + ", Quantité: " + item.amount);
}
```

### Gestion des échanges

```java
// Démarrer ou obtenir un échange en cours
Trade trade = api.trades.startOrGetPending("user_id");

// Ajouter un objet à l'échange
TradeItem tradeItem = new TradeItem("item_id", 2);
api.trades.addItem(trade.id, tradeItem);

// Approuver l'échange
api.trades.approve(trade.id);

// Annuler l'échange
api.trades.cancel(trade.id);
```

### Gestion des lobbies

```java
// Créer un lobby
Map<String, Object> newLobby = api.lobbies.create();

// Rejoindre un lobby
api.lobbies.join("lobby_id");

// Obtenir le lobby de l'utilisateur actuel
Lobby myLobby = api.lobbies.getMyLobby();

// Quitter un lobby
api.lobbies.leave("lobby_id");
```

### OAuth2

```java
// Créer une application OAuth2
List<String> redirectUrls = Arrays.asList("https://example.com/callback");
Map<String, String> app = api.oauth2.createApp("Mon App", redirectUrls);

// Obtenir les applications de l'utilisateur
List<OAuth2App> myApps = api.oauth2.getMyApps();

// Autoriser une application
Map<String, String> auth = api.oauth2.authorize("client_id", "redirect_uri");

// Obtenir un utilisateur par code d'autorisation
User user = api.oauth2.getUserByCode("auth_code", "client_id");
```

## Gestion des erreurs

```java
try {
    User me = api.users.getMe();
    System.out.println("Utilisateur: " + me.username);
} catch (Exception e) {
    System.err.println("Erreur API: " + e.getMessage());
}
```

## Structure des données

### User
```java
public class User {
    public String userId;
    public String username;
    public String email;
    public Double balance;
    public boolean verified;
    // ... autres propriétés
}
```

### Game
```java
public class Game {
    public String gameId;
    public String name;
    public String description;
    public double price;
    public String owner_id;
    // ... autres propriétés
}
```

### Item
```java
public class Item {
    public String itemId;
    public String name;
    public String description;
    public double price;
    public String owner;
    // ... autres propriétés
}
```

## Notes importantes

- Toutes les méthodes qui nécessitent une authentification lèveront une exception si aucun token n'est fourni
- Les réponses API sont automatiquement désérialisées en objets Java typés
- La gestion des erreurs HTTP est intégrée avec des messages d'erreur détaillés
- Certaines méthodes ont plusieurs surcharges pour supporter différents paramètres optionnels

## Dépendances

- Java 8 ou supérieur
- Gson 2.10.1 ou supérieur pour la sérialisation JSON

## Fichiers inclus

- **CroissantAPI.java** - Classe principale du client API
- **CroissantAPIExample.java** - Exemples d'utilisation complets
- **README_CroissantAPI_Java.md** - Documentation détaillée
- **pom.xml** - Configuration Maven
- **build.gradle** - Configuration Gradle
- **croissant-api-java.json** - Métadonnées du projet

## Exemple rapide

```java
// Initialisation
CroissantAPI api = new CroissantAPI("votre_token");

// Obtenir l'utilisateur actuel
User me = api.users.getMe();
System.out.println("Bonjour " + me.username);

// Lister les jeux
List<Game> games = api.games.list();
System.out.println("Jeux disponibles: " + games.size());

// Acheter un objet
Map<String, Object> result = api.items.buy("item_id", 1);
```
