# Système d'Articles UnlockShy

## 📋 Vue d'ensemble

Le système d'articles d'UnlockShy permet aux administrateurs de créer, gérer et publier des articles riches avec support Markdown, HTML, images et vidéos YouTube intégrées.

## 🚀 Fonctionnalités

### ✅ Fonctionnalités implémentées

- **Interface publique d'articles** avec layout à 3 colonnes :
  - Colonne gauche : Filtres et recherche
  - Colonne centrale : Liste des articles
  - Colonne droite : Articles récents et informations
- **Support Markdown complet** avec :
  - Coloration syntaxique du code
  - Tables, liens, images
  - Intégration YouTube automatique
  - Support HTML sécurisé
- **Interface d'administration** complète pour les admins
- **Système de catégories** et tags
- **Métadonnées d'articles** (auteur, date, vues)
- **API REST complète** pour la gestion CRUD
- **Responsive design** pour tous les appareils

### 📊 Structure de base de données

#### Table `articles`
```sql
- id: Identifiant unique
- titre: Titre de l'article
- contenu: Contenu (Markdown ou HTML)
- contenu_type: 'markdown' ou 'html'
- auteur_id: Référence vers l'utilisateur
- date_creation: Date de création
- date_modification: Date de dernière modification
- date_publication: Date de publication
- statut: 'brouillon', 'publie', 'archive'
- image_principale: URL de l'image principale
- resume: Résumé de l'article
- tags: Tags JSON
- vues: Nombre de vues
- actif: Article actif/supprimé
```

#### Table `article_categories`
```sql
- id: Identifiant unique
- nom: Nom de la catégorie
- description: Description
- couleur: Couleur d'affichage
- created_at: Date de création
```

## 🎯 Guide d'utilisation

### Pour les administrateurs

1. **Accéder à la gestion** : `/admin/articles`
2. **Créer un article** :
   - Cliquer sur "Nouvel Article"
   - Remplir le formulaire (titre, contenu, catégories, tags)
   - Choisir entre Markdown ou HTML
   - Définir le statut (brouillon/publié)
   - Sauvegarder

3. **Fonctionnalités Markdown** :
   ```markdown
   # Titre principal
   ## Sous-titre
   
   **Texte en gras**
   *Texte en italique*
   
   [Lien vers UnlockShy](https://unlockshy.com)
   
   ![Image](https://exemple.com/image.jpg)
   
   ```javascript
   console.log("Code avec coloration syntaxique");
   ```
   
   https://youtube.com/watch?v=VIDEO_ID
   (sera automatiquement transformé en lecteur)
   ```

4. **Intégration YouTube** :
   - Coller simplement l'URL YouTube dans le contenu
   - Sera automatiquement transformée en lecteur intégré
   - Formats supportés :
     - `https://youtube.com/watch?v=VIDEO_ID`
     - `https://youtu.be/VIDEO_ID`

### Pour les utilisateurs

1. **Consulter les articles** : `/articles`
2. **Filtrer par catégorie** : Utiliser la sidebar gauche
3. **Rechercher** : Barre de recherche dans la sidebar
4. **Lire un article** : Cliquer sur le titre ou l'image
5. **Partager** : Bouton de partage sur chaque article

## 🔧 APIs disponibles

### Articles
- `GET /api/articles` - Liste des articles avec pagination
- `GET /api/articles/[id]` - Détails d'un article
- `POST /api/articles` - Créer un article (admin uniquement)
- `PUT /api/articles/[id]` - Modifier un article (admin uniquement)
- `DELETE /api/articles/[id]` - Supprimer un article (admin uniquement)

### Catégories
- `GET /api/articles/categories` - Liste des catégories
- `POST /api/articles/categories` - Créer une catégorie (admin uniquement)

### Paramètres de requête pour la liste
- `page` : Numéro de page (défaut: 1)
- `limit` : Articles par page (défaut: 10)
- `category` : Filtrer par catégorie
- `search` : Recherche textuelle
- `status` : Statut ('publie' par défaut, 'all' pour admin)
- `author` : Filtrer par auteur

## 🎨 Interface utilisateur

### Page principale (`/articles`)
- **Header** : Titre et description
- **Sidebar gauche** :
  - Barre de recherche
  - Filtres par catégorie
  - Auteurs populaires
- **Contenu central** :
  - Liste des articles avec images
  - Pagination
  - Métadonnées (auteur, date, vues)
- **Sidebar droite** :
  - Articles récents
  - Tags populaires
  - Statistiques

### Page de détail (`/articles/[id]`)
- **Header avec image** de couverture
- **Contenu principal** avec rendu Markdown/HTML
- **Sidebar** avec articles similaires
- **Métadonnées complètes** : auteur, dates, partage
- **Médias additionnels** si configurés

### Interface admin (`/admin/articles`)
- **Table de gestion** des articles
- **Modal d'édition** avec :
  - Éditeur de contenu (Markdown/HTML)
  - Gestion des catégories et tags
  - Aperçu en temps réel
  - Configuration des métadonnées

## 🔒 Sécurité

- **Authentification requise** pour l'administration
- **Validation des rôles** (admin uniquement pour la gestion)
- **Sanitisation HTML** pour éviter les injections XSS
- **Validation des données** côté serveur
- **Soft delete** pour la suppression d'articles

## 🚀 Installation et configuration

1. **Exécuter le script SQL** :
   ```sql
   SOURCE scripts/20-create-articles-system.sql
   ```

2. **Installer les dépendances** :
   ```bash
   npm install react-markdown remark-gfm rehype-raw rehype-sanitize marked dompurify @types/dompurify react-syntax-highlighter @types/react-syntax-highlighter
   ```

3. **Accès admin** : L'utilisateur doit avoir le rôle `admin`

## 📝 Exemples d'utilisation

### Créer un article avec YouTube
```markdown
# Mon premier article

Voici une vidéo intéressante :

https://youtube.com/watch?v=dQw4w9WgXcQ

## Code exemple

```javascript
function hello() {
    console.log("Hello UnlockShy!");
}
```

**Fin de l'article !**
```

### Utiliser l'API
```javascript
// Récupérer les articles
const response = await fetch('/api/articles?page=1&limit=5');
const data = await response.json();

// Créer un article (admin uniquement)
const newArticle = await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        titre: "Nouvel article",
        contenu: "# Contenu en Markdown",
        contenu_type: "markdown",
        categories: ["Actualités"],
        tags: ["nouveau", "important"],
        statut: "publie"
    })
});
```

## 🎉 Le système d'articles est maintenant opérationnel !

Les fonctionnalités incluent :
- ✅ Interface publique moderne et responsive
- ✅ Système d'administration complet
- ✅ Support Markdown avec coloration syntaxique
- ✅ Intégration YouTube automatique
- ✅ Gestion des catégories et tags
- ✅ API REST complète
- ✅ Sécurité et authentification
- ✅ Navigation intégrée au site

Le système est prêt à être utilisé par les administrateurs pour publier du contenu riche !
