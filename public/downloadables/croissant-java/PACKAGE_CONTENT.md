# Fichiers CroissantAPI Java Client

Ce package contient tous les fichiers nécessaires pour utiliser l'API Croissant en Java.

## Fichiers principaux

### 📁 Code source
- **CroissantAPI.java** - Classe principale du client API (7KB)
- **CroissantAPIExample.java** - Exemples d'utilisation complets (4KB)
- **CroissantAPITest.java** - Tests unitaires (6KB)

### 📁 Documentation
- **README_CroissantAPI_Java.md** - Documentation complète (8KB)
- **croissant-api-java.json** - Métadonnées du projet (1KB)

### 📁 Configuration des builds
- **pom.xml** - Configuration Maven (2KB)
- **build.gradle** - Configuration Gradle (1KB)

### 📁 Scripts de build
- **build.sh** - Script de build Unix/Linux/macOS (2KB)
- **build.bat** - Script de build Windows (2KB)

### 📁 Outils de développement
- **.gitignore** - Fichier d'exclusion Git (1KB)

## Installation rapide

### Option 1: Maven
```bash
# Copier pom.xml dans votre projet
mvn clean compile
mvn exec:java -Dexec.mainClass="CroissantAPIExample"
```

### Option 2: Gradle
```bash
# Copier build.gradle dans votre projet
./gradlew build
./gradlew runExample
```

### Option 3: Compilation manuelle
```bash
# Unix/Linux/macOS
chmod +x build.sh
./build.sh run

# Windows
build.bat run
```

## Utilisation basique

```java
// Initialisation
CroissantAPI api = new CroissantAPI("votre_token");

// Obtenir l'utilisateur actuel
User me = api.users.getMe();

// Lister les jeux
List<Game> games = api.games.list();

// Acheter un objet
Map<String, Object> result = api.items.buy("item_id", 1);
```

## Fonctionnalités supportées

✅ Gestion des utilisateurs (authentification, recherche, transferts)
✅ Gestion des jeux (liste, recherche, achat)
✅ Gestion des objets (création, achat, vente, don)
✅ Système d'inventaire
✅ Système d'échanges entre utilisateurs
✅ Gestion des lobbies multijoueur
✅ Gestion des studios de développement
✅ OAuth2 pour l'authentification externe
✅ Recherche globale

## Dépendances

- **Java 8+** (requis)
- **Gson 2.10.1** (inclus dans les configurations Maven/Gradle)
- **JUnit 4.13.2** (pour les tests uniquement)

## Support

- 🌐 API officielle: https://croissant-api.fr/api
- 📖 Documentation TypeScript: croissant-api.ts
- 🔧 Exemples: CroissantAPIExample.java
- 🧪 Tests: CroissantAPITest.java

Tous les fichiers sont compatibles avec Java 8+ et suivent les conventions de codage Java standard.
