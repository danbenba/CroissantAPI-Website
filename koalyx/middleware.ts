import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { TokenEncryption } from "@/lib/crypto"

// Define protected routes that require authentication
const protectedRoutes = ["/admin", "/users", "/account", "/test-api"]
const adminRoutes = ["/admin", "/test-api"]
const moderatorRoutes = ["/users"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protection contre l'accès direct aux APIs sensibles
  if (pathname.startsWith('/api/')) {
    // Vérifier si c'est un accès direct depuis le navigateur
    const referer = request.headers.get('referer')
    const userAgent = request.headers.get('user-agent')
    const origin = request.headers.get('origin')
    const xRequestedWith = request.headers.get('x-requested-with')
    
    // APIs publiques autorisées (pour l'authentification, etc.)
    const publicAPIs = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/logout',
      '/api/auth/me',
      '/api/auth/discord',
      '/api/account/verify-password',
      '/api/account/delete'
    ]
    
    // Vérifier si c'est une API publique
    const isPublicAPI = publicAPIs.some(api => pathname.startsWith(api))
    
    if (!isPublicAPI) {
      // Vérifier si la requête provient du site lui-même
      const isInternalRequest = (
        // Requête AJAX avec header spécial
        xRequestedWith === 'XMLHttpRequest' ||
        // Requête fetch avec origin du même domaine
        (origin && (origin.includes('localhost') || origin.includes(request.nextUrl.origin))) ||
        // Requête avec referer du même domaine
        (referer && (referer.includes('localhost') || referer.includes(request.nextUrl.origin)))
      )
      
      // Si ce n'est pas une requête interne légitime, rediriger
      if (!isInternalRequest) {
        console.log(`🚫 Accès direct bloqué vers ${pathname} depuis ${referer || 'unknown'}`)
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Headers de sécurité
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')

  // Bloquer l'accès aux routes supprimées (mais permettre /test-api pour les admins)
  if (pathname.startsWith('/debug') || 
      (pathname.startsWith('/test') && pathname !== '/test-api') || 
      pathname.startsWith('/programmes') ||
      pathname.startsWith('/programs')) {
    return new NextResponse('Page non trouvée', { status: 404 })
  }

  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute) {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      console.log("[v0] Middleware - Aucun token trouvé, redirection vers /")
      return NextResponse.redirect(new URL("/", request.url))
    }

    // Utiliser le nouveau système de chiffrement AES-256-B
    const tokenInfo = TokenEncryption.getTokenInfo(token)

    if (!tokenInfo) {
      console.log("[v0] Middleware - Token invalide ou expiré, redirection vers /")
      return NextResponse.redirect(new URL("/", request.url))
    }

    console.log(`[v0] Middleware - Utilisateur ${tokenInfo.userId} (${tokenInfo.role}) accède à ${pathname}`)

    // Check role-based access
    if (adminRoutes.some((route) => pathname.startsWith(route)) && tokenInfo.role !== "admin") {
      console.log(`[v0] Middleware - Accès admin refusé pour ${tokenInfo.role}, redirection vers /`)
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (
      moderatorRoutes.some((route) => pathname.startsWith(route)) &&
      tokenInfo.role !== "moderateur" &&
      tokenInfo.role !== "admin"
    ) {
      console.log(`[v0] Middleware - Accès modérateur refusé pour ${tokenInfo.role}, redirection vers /`)
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths including API routes for security
     * Exclude only static files and assets
     */
    "/((?!_next/static|_next/image|favicon.ico|storage).*)",
  ],
}
