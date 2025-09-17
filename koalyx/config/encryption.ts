// Configuration de chiffrement AES-256-B
// ⚠️ IMPORTANT: Changez cette clé en production !

export const ENCRYPTION_CONFIG = {
  // Clé de chiffrement AES-256-B (32 caractères)
  // En production, utilisez une variable d'environnement
  KEY: process.env.ENCRYPTION_KEY || 'x7IL6827XBFder0ACxAS5pOkIwek00P4',
  
  // Configuration du token
  TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 1 semaine en millisecondes
  
  // Configuration AES
  ALGORITHM: 'AES',
  KEY_SIZE: 256,
  MODE: 'CBC',
  PADDING: 'Pkcs7',
  IV_SIZE: 16 // Taille du vecteur d'initialisation en bytes
}

// Vérification de la clé
if (ENCRYPTION_CONFIG.KEY.length !== 32) {
  console.warn('[v0] ⚠️ ATTENTION: La clé de chiffrement doit faire exactement 32 caractères pour AES-256-B')
  console.warn('[v0] Clé actuelle:', ENCRYPTION_CONFIG.KEY.length, 'caractères')
}
