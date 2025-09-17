import { NextRequest, NextResponse } from 'next/server'
import { TokenEncryption } from '@/lib/crypto'
import { db } from '@/lib/database'

// Interface pour les résultats d'authentification
export interface AuthResult {
  success: boolean
  user?: {
    id: number
    username: string
    email: string
    role: string
  }
  error?: string
  status?: number
}

// Interface pour la validation des entrées
export interface ValidationRule {
  required?: boolean
  type?: 'string' | 'number' | 'email' | 'url' | 'boolean'
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  enum?: string[]
}

export interface ValidationSchema {
  [key: string]: ValidationRule
}

// Middleware d'authentification centralisé
export async function authenticateUser(request: NextRequest): Promise<AuthResult> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return {
        success: false,
        error: 'Token d\'authentification manquant',
        status: 401
      }
    }

    const tokenInfo = TokenEncryption.getTokenInfo(token)
    if (!tokenInfo) {
      return {
        success: false,
        error: 'Token invalide ou expiré',
        status: 401
      }
    }

    // Vérifier que l'utilisateur existe toujours en base
    const [result] = await db.execute(
      'SELECT id, nom_utilisateur, email, role, COALESCE(is_banned, 0) as is_banned FROM utilisateurs WHERE id = ?',
      [tokenInfo.userId]
    )

    const users = Array.isArray(result) ? result : [result]
    if (!users || users.length === 0) {
      return {
        success: false,
        error: 'Utilisateur non trouvé',
        status: 401
      }
    }

    const user = users[0] as any

    // Vérifier que l'utilisateur n'est pas banni
    if (user.is_banned && user.is_banned !== 0) {
      return {
        success: false,
        error: 'Compte banni',
        status: 403
      }
    }

    // Pas de vérification stricte du rôle car il peut avoir changé légitimement

    return {
      success: true,
      user: {
        id: user.id,
        username: user.nom_utilisateur,
        email: user.email,
        role: user.role
      }
    }
  } catch (error) {
    console.error('Erreur d\'authentification:', error)
    return {
      success: false,
      error: 'Erreur interne d\'authentification',
      status: 500
    }
  }
}

// Middleware d'autorisation par rôle
export async function requireRole(request: NextRequest, allowedRoles: string[]): Promise<AuthResult> {
  const authResult = await authenticateUser(request)
  
  if (!authResult.success) {
    return authResult
  }

  if (!authResult.user || !allowedRoles.includes(authResult.user.role)) {
    return {
      success: false,
      error: 'Permissions insuffisantes',
      status: 403
    }
  }

  return authResult
}

// Validation et sanitisation des entrées
export function validateInput(data: any, schema: ValidationSchema): { valid: boolean; errors: string[]; sanitized: any } {
  const errors: string[] = []
  const sanitized: any = {}

  for (const [field, rule] of Object.entries(schema)) {
    const value = data[field]

    // Vérifier si le champ est requis
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`Le champ '${field}' est requis`)
      continue
    }

    // Si le champ n'est pas fourni et n'est pas requis, passer au suivant
    if (value === undefined || value === null) {
      continue
    }

    // Sanitisation de base (trim pour les strings, préserver retours à la ligne pour specifications)
    let sanitizedValue = value
    if (typeof value === 'string') {
      if (field === 'specifications') {
        // Pour les spécifications, préserver les retours à la ligne
        sanitizedValue = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '').trim()
      } else {
        sanitizedValue = value.trim()
      }
    }

    // Validation par type
    if (rule.type) {
      switch (rule.type) {
        case 'string':
          if (typeof sanitizedValue !== 'string') {
            errors.push(`Le champ '${field}' doit être une chaîne de caractères`)
            continue
          }
          break
        
        case 'number':
          const numValue = Number(sanitizedValue)
          if (isNaN(numValue)) {
            errors.push(`Le champ '${field}' doit être un nombre`)
            continue
          }
          sanitizedValue = numValue
          break
        
        case 'email':
          if (typeof sanitizedValue !== 'string' || !isValidEmail(sanitizedValue)) {
            errors.push(`Le champ '${field}' doit être un email valide`)
            continue
          }
          break
        
        case 'url':
          if (typeof sanitizedValue !== 'string' || !isValidUrl(sanitizedValue)) {
            errors.push(`Le champ '${field}' doit être une URL valide`)
            continue
          }
          break
        
        case 'boolean':
          if (typeof sanitizedValue !== 'boolean') {
            // Essayer de convertir
            if (sanitizedValue === 'true' || sanitizedValue === '1' || sanitizedValue === 1) {
              sanitizedValue = true
            } else if (sanitizedValue === 'false' || sanitizedValue === '0' || sanitizedValue === 0) {
              sanitizedValue = false
            } else {
              errors.push(`Le champ '${field}' doit être un booléen`)
              continue
            }
          }
          break
      }
    }

    // Validation de longueur pour les strings
    if (typeof sanitizedValue === 'string') {
      if (rule.minLength && sanitizedValue.length < rule.minLength) {
        errors.push(`Le champ '${field}' doit contenir au moins ${rule.minLength} caractères`)
        continue
      }
      if (rule.maxLength && sanitizedValue.length > rule.maxLength) {
        errors.push(`Le champ '${field}' ne peut pas dépasser ${rule.maxLength} caractères`)
        continue
      }
    }

    // Validation de valeur pour les numbers
    if (typeof sanitizedValue === 'number') {
      if (rule.min !== undefined && sanitizedValue < rule.min) {
        errors.push(`Le champ '${field}' doit être supérieur ou égal à ${rule.min}`)
        continue
      }
      if (rule.max !== undefined && sanitizedValue > rule.max) {
        errors.push(`Le champ '${field}' doit être inférieur ou égal à ${rule.max}`)
        continue
      }
    }

    // Validation par pattern
    if (rule.pattern && typeof sanitizedValue === 'string') {
      if (!rule.pattern.test(sanitizedValue)) {
        errors.push(`Le champ '${field}' ne respecte pas le format requis`)
        continue
      }
    }

    // Validation par enum
    if (rule.enum && !rule.enum.includes(sanitizedValue)) {
      errors.push(`Le champ '${field}' doit être une des valeurs suivantes: ${rule.enum.join(', ')}`)
      continue
    }

    sanitized[field] = sanitizedValue
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitized
  }
}

// Utilitaires de validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Sanitisation XSS (basique)
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

// Validation d'ID numérique sécurisée
export function validateId(id: string | number): number | null {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id
  if (isNaN(numId) || numId <= 0 || numId > 2147483647) {
    return null
  }
  return numId
}

// Helper pour créer des réponses d'erreur standardisées
export function createErrorResponse(message: string, status: number = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details })
    },
    { status }
  )
}

// Helper pour créer des réponses de succès standardisées
export function createSuccessResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    ...(message && { message }),
    ...data
  })
}
