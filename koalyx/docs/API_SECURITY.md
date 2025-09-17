# Sécurité des APIs

## Protection contre l'accès direct

Le système de sécurité empêche l'accès direct aux APIs depuis le navigateur tout en permettant aux requêtes légitimes du site de fonctionner.

### Fonctionnement

1. **Middleware de protection** : Le middleware vérifie l'origine de chaque requête API
2. **Headers de sécurité** : Les requêtes légitimes incluent des headers spéciaux
3. **Redirection automatique** : Les accès directs sont redirigés vers la page d'accueil

### APIs publiques autorisées

Certaines APIs restent accessibles directement :
- `/api/auth/login`
- `/api/auth/register` 
- `/api/auth/logout`
- `/api/auth/me`

### Utilisation côté client

Utilisez les fonctions du module `lib/api-client.ts` :

```typescript
import { secureGet, securePost, securePut, secureDelete } from '@/lib/api-client'

// GET sécurisé
const response = await secureGet('/api/games/123')
const data = await response.json()

// POST sécurisé
const response = await securePost('/api/games', { title: 'Mon jeu' })
```

### Détection des requêtes légitimes

Le middleware vérifie :
- Header `X-Requested-With: XMLHttpRequest`
- Origin du même domaine
- Referer du même domaine

### Exemple de log

```
🚫 Accès direct bloqué vers /api/games/123/download-links depuis unknown
```

### Migration du code existant

Remplacez :
```typescript
// Ancien code
const response = await fetch('/api/games/123')

// Nouveau code
const response = await secureGet('/api/games/123')
```

Cette protection empêche l'exposition des données sensibles via l'accès direct aux URLs d'API.
