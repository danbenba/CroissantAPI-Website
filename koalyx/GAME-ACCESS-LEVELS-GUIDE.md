# Guide des Niveaux d'Accès aux Jeux

## Vue d'ensemble

Le système de jeux prend désormais en charge des niveaux d'accès granulaires permettant de définir précisément qui peut accéder à quel contenu.

## Niveaux d'Accès Disponibles

### 🔓 **Gratuit (free)**
- **Accessible à :** Tous les utilisateurs connectés
- **Description :** Contenu libre d'accès
- **Utilisateurs :** `membre`, `plus`, `ultra`, `support`, `moderateur`, `admin`

### ⭐ **Plus (plus)**
- **Accessible à :** Abonnés Plus et niveaux supérieurs
- **Description :** Contenu premium de base
- **Utilisateurs :** `plus`, `ultra`, `support`, `moderateur`, `admin`

### 👑 **Ultra (ultra)**
- **Accessible à :** Abonnés Ultra et staff uniquement
- **Description :** Contenu exclusif premium
- **Utilisateurs :** `ultra`, `support`, `moderateur`, `admin`

## Double Niveau de Contrôle

Le système offre deux niveaux de granularité :

### 1. Niveau du Jeu (`games.access_level`)
Définit l'accès minimum requis pour voir le jeu dans la liste et accéder à sa page de détail.

### 2. Niveau du Lien (`game_download_links.access_level`) 
Permet d'avoir des liens de téléchargement avec des restrictions différentes au sein d'un même jeu.

## Exemples d'Usage

### Exemple 1 : Jeu Freemium
```sql
-- Jeu accessible à tous
UPDATE games SET access_level = 'free' WHERE id = 1;

-- Mais avec des liens premium
UPDATE game_download_links SET access_level = 'plus' 
WHERE game_id = 1 AND title LIKE '%Version Complète%';
```

### Exemple 2 : Jeu Exclusif Ultra
```sql
-- Jeu accessible uniquement aux Ultra
UPDATE games SET access_level = 'ultra' WHERE id = 2;

-- Tous les liens sont Ultra par défaut
UPDATE game_download_links SET access_level = 'ultra' WHERE game_id = 2;
```

### Exemple 3 : Jeu Plus avec Bonus Ultra
```sql
-- Jeu accessible aux Plus et Ultra
UPDATE games SET access_level = 'plus' WHERE id = 3;

-- Lien standard pour Plus
UPDATE game_download_links SET access_level = 'plus' 
WHERE game_id = 3 AND title = 'Version Standard';

-- Lien bonus pour Ultra uniquement
UPDATE game_download_links SET access_level = 'ultra' 
WHERE game_id = 3 AND title = 'Version Deluxe + DLCs';
```

## Migration depuis l'Ancien Système

### Automatique
Le script de migration convertit automatiquement :
- `is_vip = 1` → `access_level = 'ultra'`
- `is_vip = 0` → `access_level = 'free'`

### Rétrocompatibilité
L'ancien champ `is_vip` est conservé temporairement pour assurer la compatibilité.

## Logique de Contrôle d'Accès

### Hiérarchie des Rôles
```typescript
const roleHierarchy = {
  'membre': ['free'],
  'plus': ['free', 'plus'],
  'ultra': ['free', 'plus', 'ultra'],
  'support': ['free', 'plus', 'ultra'], // Staff
  'moderateur': ['free', 'plus', 'ultra'], // Staff
  'admin': ['free', 'plus', 'ultra'] // Staff
}
```

### Vérification d'Accès
```typescript
// Nouvelle fonction principale
const hasAccessLevel = (requiredLevel: 'free' | 'plus' | 'ultra') => {
  if (!user) return requiredLevel === 'free'
  
  // Staff a toujours accès
  if (['support', 'moderateur', 'admin'].includes(user.role)) return true
  
  switch (requiredLevel) {
    case 'free': return true
    case 'plus': return ['plus', 'ultra'].includes(user.role)
    case 'ultra': return user.role === 'ultra'
    default: return false
  }
}
```

## Interface d'Administration

### Ajout/Modification de Jeux
L'interface d'administration inclut maintenant :
- **Sélecteur de niveau d'accès** pour le jeu
- **Sélecteur de niveau d'accès** pour chaque lien de téléchargement
- **Statistiques** par niveau d'accès

### Tableau des Jeux
- **Colonne "Niveau d'Accès"** remplace "VIP"
- **Chips colorés** : Gratuit (gris), Plus (jaune), Ultra (violet)
- **Icônes distinctives** : 🔓, ⭐, 👑

## Scripts de Migration

### Appliquer la Migration
```bash
# Option 1: Script complet avec vérifications
mysql -u root -p unlockshy < scripts/19-add-game-access-levels.sql

# Option 2: Script rapide
mysql -u root -p unlockshy < scripts/run-migration-game-access-levels.sql
```

### Vérification Post-Migration
```sql
-- Vérifier la répartition des niveaux
SELECT access_level, COUNT(*) as nombre_jeux 
FROM games GROUP BY access_level;

-- Vérifier les liens de téléchargement
SELECT access_level, COUNT(*) as nombre_liens 
FROM game_download_links GROUP BY access_level;
```

## Stratégies Commerciales

### Modèle Suggéré

#### **Niveau Gratuit**
- Jeux indépendants simples
- Versions de démonstration
- Contenu promotionnel

#### **Niveau Plus (9,99€/mois)**
- Jeux populaires récents
- Versions complètes sans DLC
- Accès prioritaire aux nouveautés

#### **Niveau Ultra (19,99€/mois)**
- Jeux AAA exclusifs
- Versions Deluxe avec tous les DLCs
- Accès anticipé aux sorties
- Support prioritaire

### Exemples de Différenciation

1. **Même jeu, versions différentes :**
   - Gratuit : Version démo
   - Plus : Version complète
   - Ultra : Edition Deluxe + Season Pass

2. **Temporalité d'accès :**
   - Ultra : Accès immédiat aux nouveautés
   - Plus : Accès après 1 semaine
   - Gratuit : Accès après 1 mois

3. **Qualité du contenu :**
   - Gratuit : Téléchargement standard
   - Plus : Téléchargement rapide + support
   - Ultra : Téléchargement instantané + support premium

## Notes Techniques

### Nouvelles Colonnes
```sql
-- Table games
ALTER TABLE games ADD COLUMN access_level ENUM('free', 'plus', 'ultra') DEFAULT 'free';

-- Table game_download_links  
ALTER TABLE game_download_links ADD COLUMN access_level ENUM('free', 'plus', 'ultra') DEFAULT 'free';
```

### Index Ajoutés
```sql
-- Pour les performances
ALTER TABLE games ADD INDEX idx_access_level (access_level);
ALTER TABLE games ADD INDEX idx_games_access_platform (access_level, platform);
ALTER TABLE game_download_links ADD INDEX idx_link_access_level (access_level);
```

## Rollback d'Urgence

Si nécessaire, pour revenir à l'ancien système :

```sql
-- Remettre is_vip basé sur access_level
UPDATE games SET is_vip = 1 WHERE access_level IN ('plus', 'ultra');
UPDATE games SET is_vip = 0 WHERE access_level = 'free';

UPDATE game_download_links SET is_vip = 1 WHERE access_level IN ('plus', 'ultra');
UPDATE game_download_links SET is_vip = 0 WHERE access_level = 'free';

-- Supprimer les nouvelles colonnes (ATTENTION : perte de données)
-- ALTER TABLE games DROP COLUMN access_level;
-- ALTER TABLE game_download_links DROP COLUMN access_level;
```

## ✅ Checklist de Déploiement

- [ ] Exécuter la migration de base de données
- [ ] Redémarrer l'application Next.js
- [ ] Tester la création d'un nouveau jeu
- [ ] Tester la modification d'un jeu existant
- [ ] Vérifier les accès avec différents rôles utilisateur
- [ ] Contrôler l'affichage des statistiques
- [ ] Valider les messages d'erreur d'accès

Le système est maintenant prêt pour une gestion fine et flexible des accès aux jeux ! 🚀
