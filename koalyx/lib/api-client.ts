/**
 * Utilitaire pour les requêtes API côté client avec headers de sécurité
 */

// Headers de sécurité pour les requêtes internes
const getSecureHeaders = (): HeadersInit => {
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // Header pour identifier les requêtes AJAX légitimes
    'Accept': 'application/json',
  }
}

/**
 * Wrapper fetch sécurisé pour les requêtes API internes
 */
export const secureApiCall = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const secureOptions: RequestInit = {
    ...options,
    headers: {
      ...getSecureHeaders(),
      ...options.headers,
    },
    credentials: 'same-origin', // Inclure les cookies pour l'authentification
  }

  return fetch(url, secureOptions)
}

/**
 * GET sécurisé
 */
export const secureGet = async (url: string): Promise<Response> => {
  return secureApiCall(url, { method: 'GET' })
}

/**
 * POST sécurisé
 */
export const securePost = async (url: string, data?: any): Promise<Response> => {
  return secureApiCall(url, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT sécurisé
 */
export const securePut = async (url: string, data?: any): Promise<Response> => {
  return secureApiCall(url, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE sécurisé
 */
export const secureDelete = async (url: string): Promise<Response> => {
  return secureApiCall(url, { method: 'DELETE' })
}

/**
 * PATCH sécurisé
 */
export const securePatch = async (url: string, data?: any): Promise<Response> => {
  return secureApiCall(url, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}
