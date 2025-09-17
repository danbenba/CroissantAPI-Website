import CryptoJS from 'crypto-js'
import { ENCRYPTION_CONFIG } from '@/config/encryption'

export interface EncryptedToken {
  token: string
  expiresAt: number
  userId: number
  role: string
}

export class TokenEncryption {
  /**
   * Chiffre un token avec AES-256-B
   */
  static encrypt(data: Omit<EncryptedToken, 'token'>): string {
    try {
      // Convertir les données en JSON
      const jsonData = JSON.stringify(data)
      
      // Générer un vecteur d'initialisation (IV) aléatoire
      const iv = CryptoJS.lib.WordArray.random(ENCRYPTION_CONFIG.IV_SIZE)
      
      // Chiffrer avec AES-256-CBC
      const encrypted = CryptoJS.AES.encrypt(jsonData, ENCRYPTION_CONFIG.KEY, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      // Combiner IV et données chiffrées en base64
      const result = iv.toString() + encrypted.toString()
      return result
    } catch (error) {
      console.error('[v0] Encryption error:', error)
      throw new Error('Erreur lors du chiffrement du token')
    }
  }

  /**
   * Déchiffre un token AES-256-B
   */
  static decrypt(encryptedToken: string): EncryptedToken | null {
    try {
      // Extraire l'IV (16 premiers bytes)
      const iv = CryptoJS.enc.Hex.parse(encryptedToken.substring(0, 32))
      
      // Extraire les données chiffrées
      const encryptedData = encryptedToken.substring(32)
      
      // Déchiffrer
      const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_CONFIG.KEY, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      
      // Convertir en string
      const decryptedString = decrypted.toString(CryptoJS.enc.Utf8)
      
      if (!decryptedString) {
        throw new Error('Token vide après déchiffrement')
      }
      
      // Parser le JSON
      const data: EncryptedToken = JSON.parse(decryptedString)
      
      // Vérifier l'expiration
      if (Date.now() > data.expiresAt) {
        console.log('[v0] Token expiré:', new Date(data.expiresAt))
        return null
      }
      
      return data
    } catch (error) {
      console.error('[v0] Decryption error:', error)
      return null
    }
  }

  /**
   * Génère un token avec expiration d'1 semaine
   */
  static generateToken(userId: number, role: string): string {
    const expiresAt = Date.now() + ENCRYPTION_CONFIG.TOKEN_EXPIRY
    
    const tokenData: Omit<EncryptedToken, 'token'> = {
      expiresAt,
      userId,
      role
    }
    
    return this.encrypt(tokenData)
  }

  /**
   * Vérifie si un token est valide
   */
  static isValidToken(token: string): boolean {
    try {
      const decrypted = this.decrypt(token)
      return decrypted !== null
    } catch {
      return false
    }
  }

  /**
   * Récupère les informations d'un token valide
   */
  static getTokenInfo(token: string): EncryptedToken | null {
    return this.decrypt(token)
  }

  /**
   * Vérifie la configuration de chiffrement
   */
  static validateConfig(): boolean {
    if (ENCRYPTION_CONFIG.KEY.length !== 32) {
      console.error('[v0] ❌ Clé de chiffrement invalide: doit faire 32 caractères')
      return false
    }
    
    console.log('[v0] ✅ Configuration de chiffrement AES-256-B valide')
    return true
  }
}

// Fonctions utilitaires pour la compatibilité
export const encryptToken = TokenEncryption.encrypt
export const decryptToken = TokenEncryption.decrypt
export const generateToken = TokenEncryption.generateToken
export const isValidToken = TokenEncryption.isValidToken
export const getTokenInfo = TokenEncryption.getTokenInfo

// Validation de la configuration au démarrage
TokenEncryption.validateConfig()
