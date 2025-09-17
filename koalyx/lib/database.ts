import mysql from 'mysql2/promise'

export const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'unlockshy',
  charset: 'utf8mb4', // Support complet UTF-8 avec emojis
  waitForConnections: true,
  connectionLimit: 5, // Réduit pour éviter trop de connexions
  queueLimit: 0,
  // Options supportées par mysql2
  idleTimeout: 60000,
  maxIdle: 3,
  // Définir la collation via les options de connexion
  typeCast: function (field: any, next: () => any) {
    if (field.type === 'VAR_STRING' || field.type === 'STRING' || field.type === 'TINY_BLOB' || field.type === 'MEDIUM_BLOB' || field.type === 'LONG_BLOB' || field.type === 'BLOB') {
      return field.string();
    }
    return next();
  }
})

// Test de connexion
export async function testConnection() {
  try {
    const connection = await db.getConnection()
    console.log('✅ Connexion à la base de données réussie !')
    connection.release()
    return true
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données:', error)
    return false
  }
}

// Fonction pour exécuter des requêtes SQL
export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await db.execute(query, params)
    return rows as T
  } catch (error) {
    console.error('❌ Erreur lors de l\'exécution de la requête:', error)
    throw error
  }
}

// User types based on the database schema
export interface User {
  id: number
  nom_utilisateur: string
  email: string
  mot_de_passe: string
  role: "admin" | "moderateur" | "support" | "plus" | "ultra" | "membre"
  photo?: string
  discord_id?: string
  date_creation: Date
  derniere_connexion?: Date
  actif: boolean
}

export interface Programme {
  id: number
  nom: string
  description: string
  icone_url?: string
  lien_telechargement?: string
  categorie?: string
  note_moyenne: number | null
  nombre_votes: number | null
  date_ajout: Date
  actif: boolean
}

export interface TicketSupport {
  id: number
  utilisateur_id: number
  titre: string
  description: string
  statut: "ouvert" | "en_cours" | "ferme"
  priorite: "basse" | "normale" | "haute" | "critique"
  assigne_a?: number
  date_creation: Date
  date_modification: Date
}
