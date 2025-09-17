# Configuration de l'authentification Discord

## Variables d'environnement requises

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Configuration Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback

# URL de l'application (important pour les redirections)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Configuration de l'application Discord

1. **Créer une application Discord :**
   - Allez sur https://discord.com/developers/applications
   - Cliquez sur "New Application"
   - Donnez un nom à votre application

2. **Configurer OAuth2 :**
   - Dans le menu de gauche, cliquez sur "OAuth2" > "General"
   - Ajoutez l'URL de redirection : `http://localhost:3000/api/auth/discord/callback`
   - Pour la production : `https://yourdomain.com/api/auth/discord/callback`

3. **Récupérer les identifiants :**
   - Client ID : visible sur la page OAuth2
   - Client Secret : cliquez sur "Reset Secret" pour générer un nouveau secret

## Base de données

Exécutez le script SQL pour ajouter le support Discord :

```sql
-- Ajouter le champ discord_id à la table utilisateurs
ALTER TABLE utilisateurs 
ADD COLUMN discord_id VARCHAR(255) NULL,
ADD UNIQUE KEY unique_discord_id (discord_id);

-- Index pour optimiser les recherches
CREATE INDEX idx_discord_id ON utilisateurs(discord_id);
```

## Fonctionnalités implémentées

### 1. Connexion via Discord
- Sur la page de connexion, clic sur "Continuer avec Discord"
- Si un compte existe avec cet ID Discord → connexion automatique
- Sinon → redirection vers l'inscription avec données pré-remplies

### 2. Inscription via Discord
- Champs nom d'utilisateur et email pré-remplis
- Aucun mot de passe requis pour les comptes Discord
- Liaison automatique de l'ID Discord au nouveau compte

### 3. Liaison de compte existant
- Dans "Mon Compte" → section "Connexions Sociales"
- Bouton "Lier Discord" pour les comptes non liés
- Bouton "Délier" pour les comptes déjà liés
- Vérification que l'ID Discord n'est pas déjà utilisé

## Sécurité

- Utilisation du paramètre `state` pour prévenir les attaques CSRF
- Vérification des tokens JWT pour la liaison de comptes
- Cookies sécurisés avec flags appropriés
- Validation côté serveur de tous les paramètres

## Test

1. Configurez les variables d'environnement
2. Lancez l'application : `npm run dev`
3. Testez la connexion Discord depuis `/login`
4. Testez la liaison depuis `/account` avec un compte existant
