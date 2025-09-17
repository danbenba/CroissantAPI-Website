# Migration VIP → Plus + Ultra

## Résumé

Le rôle unique "VIP" a été remplacé par deux nouveaux rôles : **"Plus"** et **"Ultra"**. Cette migration offre plus de flexibilité pour différencier les niveaux d'abonnement premium.

## Changements Effectués

### 1. Types TypeScript Modifiés

- `lib/auth-client.ts` : Type `Role` mis à jour
- `lib/auth.ts` : Interface `AuthUser` mise à jour  
- `lib/database.ts` : Interface `User` mise à jour

### 2. APIs Mises à Jour

- `app/api/admin/users/route.ts` : Validation des rôles
- `app/api/admin/users/[id]/route.ts` : Validation des rôles

### 3. Contrôle d'Accès

- `app/games/[id]/page.tsx` : 
  - Fonction `hasVipAccess()` → `hasPremiumAccess()`
  - Les rôles "plus" et "ultra" ont accès au contenu premium
  - Messages d'erreur mis à jour

### 4. Interface Utilisateur

#### Composants Modifiés :
- `components/navigation.tsx` : Labels et couleurs des rôles
- `app/admin/users/page.tsx` : Sélecteurs de rôles dans l'admin
- `app/users/page.tsx` : Interface publique des utilisateurs
- `app/account/page.tsx` : Page de profil utilisateur
- `app/debug/admin-users/page.tsx` : Interface de debug

#### Nouvelles Couleurs :
- **Plus** : `#FFD700` (or) - couleur warning
- **Ultra** : `#9333EA` (violet) - couleur warning

### 5. Base de Données

#### Scripts de Migration Créés :
- `scripts/18-migrate-vip-to-plus-ultra.sql` : Migration complète et détaillée
- `scripts/run-migration-vip-to-plus-ultra.sql` : Script rapide pour bases existantes

#### Scripts Existants Mis à Jour :
- `scripts/01-create-database-schema.sql`
- `scripts/init-database.sql`
- `scripts/17-update-role-visiteur-to-membre.sql`
- `scripts/01-create-support-database.sql`
- `scripts/setup-database.js`
- `scripts/unlockshy(5).sql`

## Stratégie de Migration des Données

Les utilisateurs VIP existants sont répartis équitablement :
- **ID pair** → rôle "plus"
- **ID impair** → rôle "ultra"

Cette répartition assure une distribution équitable entre les deux nouveaux niveaux.

## Rétrocompatibilité

### Accès au Contenu
- Le champ `is_vip` dans les tables reste inchangé
- Les rôles "plus" ET "ultra" ont accès au contenu marqué `is_vip=true`
- Aucune perte d'accès pour les anciens utilisateurs VIP

### Rollback
Si nécessaire, pour revenir en arrière :
```sql
UPDATE utilisateurs SET role = 'vip' WHERE role IN ('plus', 'ultra');
```

## Différenciation Future Plus/Ultra

Actuellement, "Plus" et "Ultra" ont les mêmes permissions. Vous pouvez maintenant implémenter :

### Suggestions pour "Plus" :
- Accès aux jeux premium de base
- Support prioritaire
- Pas de publicité

### Suggestions pour "Ultra" :
- Tout ce que "Plus" offre +
- Téléchargements plus rapides
- Contenu exclusif Ultra-only
- Bêta accès aux nouveaux jeux
- Support premium instantané

### Implémentation Technique
```typescript
// Exemple : Vérifier le niveau Ultra spécifiquement
const hasUltraAccess = () => {
  return user?.role === 'ultra' || ['admin', 'moderateur'].includes(user?.role)
}

// Exemple : Contenu exclusif Ultra
const canAccessUltraContent = (contentLevel: 'free' | 'plus' | 'ultra') => {
  if (contentLevel === 'free') return true
  if (contentLevel === 'plus') return hasPremiumAccess() // Plus OU Ultra
  if (contentLevel === 'ultra') return hasUltraAccess() // Ultra seulement
}
```

## Vérification Post-Migration

Après migration, vérifiez :

1. **Base de données** : 
   ```sql
   SELECT role, COUNT(*) FROM utilisateurs GROUP BY role;
   ```

2. **Interface** : Connectez-vous avec des comptes Plus/Ultra

3. **Accès** : Testez l'accès au contenu premium

4. **Administration** : Vérifiez la création/modification d'utilisateurs

## Notes Importantes

- ✅ Tous les composants UI ont été mis à jour
- ✅ Les APIs d'administration supportent les nouveaux rôles  
- ✅ Le contrôle d'accès fonctionne avec Plus et Ultra
- ✅ Les scripts de migration sont prêts
- ✅ La rétrocompatibilité est assurée

La migration est complète et prête pour la production !
