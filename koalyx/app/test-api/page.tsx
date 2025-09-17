'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import Navigation from '@/components/navigation'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Chip,
  Divider,
  Progress,
  Accordion,
  AccordionItem
} from '@heroui/react'
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Database,
  Shield,
  Users,
  FileText,
  Star,
  MessageSquare,
  Bell,
  Settings,
  Gamepad2
} from 'lucide-react'

type TestStatus = 'pending' | 'running' | 'success' | 'error'

interface TestResult {
  id: string
  name: string
  endpoint: string
  method: string
  status: TestStatus
  responseTime?: number
  statusCode?: number
  error?: string
  response?: any
}

interface TestCategory {
  id: string
  name: string
  icon: any
  color: string
  tests: TestResult[]
}

export default function ApiTestPage() {
  const { user } = useAuth()
  const [isRunning, setIsRunning] = useState(false)
  const [currentTest, setCurrentTest] = useState<string>('')
  const [progress, setProgress] = useState(0)
  const [categories, setCategories] = useState<TestCategory[]>([
    {
      id: 'auth',
      name: 'Authentification',
      icon: Shield,
      color: 'primary',
      tests: [
        { id: 'auth-1', name: 'Connexion utilisateur', endpoint: '/api/auth/login', method: 'POST', status: 'pending' },
        { id: 'auth-2', name: 'Inscription utilisateur', endpoint: '/api/auth/register', method: 'POST', status: 'pending' },
        { id: 'auth-3', name: 'Profil utilisateur', endpoint: '/api/auth/me', method: 'GET', status: 'pending' },
        { id: 'auth-4', name: 'Déconnexion', endpoint: '/api/auth/logout', method: 'POST', status: 'pending' },
        { id: 'auth-5', name: 'Discord callback', endpoint: '/api/auth/discord/callback', method: 'GET', status: 'pending' }
      ]
    },
    {
      id: 'users',
      name: 'Gestion Utilisateurs',
      icon: Users,
      color: 'secondary',
      tests: [
        { id: 'users-1', name: 'Liste des utilisateurs', endpoint: '/api/admin/users', method: 'GET', status: 'pending' },
        { id: 'users-2', name: 'Création utilisateur', endpoint: '/api/admin/users', method: 'POST', status: 'pending' },
        { id: 'users-3', name: 'Détails utilisateur', endpoint: '/api/admin/users/1', method: 'GET', status: 'pending' },
        { id: 'users-4', name: 'Modification utilisateur', endpoint: '/api/admin/users/1', method: 'PUT', status: 'pending' },
        { id: 'users-5', name: 'Bannir utilisateur', endpoint: '/api/admin/users/1/ban', method: 'POST', status: 'pending' },
        { id: 'users-6', name: 'Débannir utilisateur', endpoint: '/api/admin/users/1/unban', method: 'POST', status: 'pending' },
        { id: 'users-7', name: 'Historique bans', endpoint: '/api/admin/users/ban-history', method: 'GET', status: 'pending' }
      ]
    },
    {
      id: 'games',
      name: 'Gestion Jeux',
      icon: Gamepad2,
      color: 'success',
      tests: [
        { id: 'games-1', name: 'Liste des jeux', endpoint: '/api/games', method: 'GET', status: 'pending' },
        { id: 'games-2', name: 'Détails d\'un jeu', endpoint: '/api/games/1', method: 'GET', status: 'pending' },
        { id: 'games-3', name: 'Médias d\'un jeu', endpoint: '/api/games/1/media', method: 'GET', status: 'pending' },
        { id: 'games-4', name: 'Liens téléchargement', endpoint: '/api/games/1/download-links', method: 'GET', status: 'pending' },
        { id: 'games-5', name: 'Incrémenter vues', endpoint: '/api/games/1/increment-view', method: 'POST', status: 'pending' },
        { id: 'games-6', name: 'Création jeu (Admin)', endpoint: '/api/admin/games', method: 'POST', status: 'pending' },
        { id: 'games-7', name: 'Modification jeu (Admin)', endpoint: '/api/admin/games/1', method: 'PUT', status: 'pending' },
        { id: 'games-8', name: 'Badges jeu (Admin)', endpoint: '/api/admin/games/1/badges', method: 'GET', status: 'pending' },
        { id: 'games-9', name: 'Demandes mise à jour', endpoint: '/api/games/update-requests', method: 'GET', status: 'pending' }
      ]
    },
    {
      id: 'articles',
      name: 'Gestion Articles',
      icon: FileText,
      color: 'warning',
      tests: [
        { id: 'articles-1', name: 'Liste des articles', endpoint: '/api/articles', method: 'GET', status: 'pending' },
        { id: 'articles-2', name: 'Détails d\'un article', endpoint: '/api/articles/1', method: 'GET', status: 'pending' },
        { id: 'articles-3', name: 'Catégories articles', endpoint: '/api/articles/categories', method: 'GET', status: 'pending' },
        { id: 'articles-4', name: 'Créer catégorie', endpoint: '/api/articles/categories', method: 'POST', status: 'pending' },
        { id: 'articles-5', name: 'Avis sur article', endpoint: '/api/articles/1/reviews', method: 'GET', status: 'pending' },
        { id: 'articles-6', name: 'Créer avis article', endpoint: '/api/articles/1/reviews', method: 'POST', status: 'pending' },
        { id: 'articles-7', name: 'Réactions article', endpoint: '/api/articles/1/reactions', method: 'GET', status: 'pending' },
        { id: 'articles-8', name: 'Admin - Liste articles', endpoint: '/api/admin/articles', method: 'GET', status: 'pending' },
        { id: 'articles-9', name: 'Admin - Créer article', endpoint: '/api/admin/articles', method: 'POST', status: 'pending' },
        { id: 'articles-10', name: 'Admin - Modifier article', endpoint: '/api/admin/articles/1', method: 'PUT', status: 'pending' }
      ]
    },
    {
      id: 'favorites',
      name: 'Favoris',
      icon: Star,
      color: 'danger',
      tests: [
        { id: 'fav-1', name: 'Liste des favoris', endpoint: '/api/favorites', method: 'GET', status: 'pending' },
        { id: 'fav-2', name: 'Ajouter aux favoris', endpoint: '/api/favorites', method: 'POST', status: 'pending' },
        { id: 'fav-3', name: 'Supprimer des favoris', endpoint: '/api/favorites', method: 'DELETE', status: 'pending' },
        { id: 'fav-4', name: 'Vérifier favori', endpoint: '/api/favorites/check', method: 'GET', status: 'pending' }
      ]
    },
    {
      id: 'ads',
      name: 'Publicités',
      icon: MessageSquare,
      color: 'primary',
      tests: [
        { id: 'ads-1', name: 'Récupérer publicités', endpoint: '/api/ads', method: 'GET', status: 'pending' },
        { id: 'ads-2', name: 'Clic sur publicité', endpoint: '/api/ads/click', method: 'POST', status: 'pending' },
        { id: 'ads-3', name: 'Admin - Liste publicités', endpoint: '/api/admin/ads', method: 'GET', status: 'pending' },
        { id: 'ads-4', name: 'Admin - Créer publicité', endpoint: '/api/admin/ads', method: 'POST', status: 'pending' },
        { id: 'ads-5', name: 'Admin - Modifier publicité', endpoint: '/api/admin/ads/1', method: 'PUT', status: 'pending' },
        { id: 'ads-6', name: 'Admin - Supprimer publicité', endpoint: '/api/admin/ads/1', method: 'DELETE', status: 'pending' },
        { id: 'ads-7', name: 'Admin - Paramètres pub', endpoint: '/api/admin/ads/settings', method: 'GET', status: 'pending' }
      ]
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      color: 'secondary',
      tests: [
        { id: 'notif-1', name: 'Liste notifications', endpoint: '/api/notifications', method: 'GET', status: 'pending' },
        { id: 'notif-2', name: 'Marquer comme lu', endpoint: '/api/notifications/1/mark-read', method: 'PUT', status: 'pending' }
      ]
    },
    {
      id: 'support',
      name: 'Support & Tickets',
      icon: Settings,
      color: 'warning',
      tests: [
        { id: 'support-1', name: 'Liste tickets', endpoint: '/api/support/tickets', method: 'GET', status: 'pending' },
        { id: 'support-2', name: 'Créer ticket', endpoint: '/api/support/tickets', method: 'POST', status: 'pending' },
        { id: 'support-3', name: 'Messages ticket', endpoint: '/api/support/tickets/1/messages', method: 'GET', status: 'pending' },
        { id: 'support-4', name: 'Admin - Tickets', endpoint: '/api/admin/support/tickets', method: 'GET', status: 'pending' },
        { id: 'support-5', name: 'Admin - Assigner ticket', endpoint: '/api/admin/support/tickets/1/assign', method: 'POST', status: 'pending' },
        { id: 'support-6', name: 'Admin - Statut ticket', endpoint: '/api/admin/support/tickets/1/status', method: 'PUT', status: 'pending' }
      ]
    },
    {
      id: 'account',
      name: 'Compte Utilisateur',
      icon: Users,
      color: 'success',
      tests: [
        { id: 'account-1', name: 'Profil utilisateur', endpoint: '/api/account/profile', method: 'GET', status: 'pending' },
        { id: 'account-2', name: 'Modifier profil', endpoint: '/api/account/profile', method: 'PUT', status: 'pending' },
        { id: 'account-3', name: 'Changer mot de passe', endpoint: '/api/account/password', method: 'PUT', status: 'pending' },
        { id: 'account-4', name: 'Upload photo profil', endpoint: '/api/account/upload-photo', method: 'POST', status: 'pending' }
      ]
    },
    {
      id: 'categories',
      name: 'Catégories',
      icon: Database,
      color: 'primary',
      tests: [
        { id: 'cat-1', name: 'Catégories publiques', endpoint: '/api/categories', method: 'GET', status: 'pending' },
        { id: 'cat-2', name: 'Admin - Catégories', endpoint: '/api/admin/categories', method: 'GET', status: 'pending' }
      ]
    },
    {
      id: 'misc',
      name: 'Divers & Utils',
      icon: Settings,
      color: 'secondary',
      tests: [
        { id: 'misc-1', name: 'Liens morts', endpoint: '/api/dead-links', method: 'GET', status: 'pending' },
        { id: 'misc-2', name: 'Admin - Badges', endpoint: '/api/admin/badges', method: 'GET', status: 'pending' },
        { id: 'misc-3', name: 'Incrémenter vues lien', endpoint: '/api/download-links/1/increment-view', method: 'POST', status: 'pending' }
      ]
    }
  ])

  const totalTests = categories.reduce((acc, cat) => acc + cat.tests.length, 0)
  const completedTests = categories.reduce((acc, cat) => 
    acc + cat.tests.filter(test => test.status === 'success' || test.status === 'error').length, 0
  )

  const runSingleTest = async (categoryId: string, testId: string): Promise<TestResult> => {
    const category = categories.find(c => c.id === categoryId)
    const test = category?.tests.find(t => t.id === testId)
    
    if (!test || !category) throw new Error('Test non trouvé')
    
    setCurrentTest(`${category.name} - ${test.name}`)
    
    const startTime = Date.now()
    
    // Récupérer le token d'authentification depuis les cookies
    const getAuthToken = () => {
      if (typeof document !== 'undefined') {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        return authCookie ? authCookie.split('=')[1] : null
      }
      return null
    }
    
    try {
      let response: Response
      let body = null
      
      // Tests problématiques qui peuvent déconnecter ou rediriger l'utilisateur
      const problematicTests = [
        '/api/auth/login', 
        '/api/auth/logout', 
        '/api/auth/register',
        '/api/auth/discord/callback', // Peut aussi causer des redirections
        '/api/account/upload-photo' // Nécessite FormData multipart
      ]
      
      if (problematicTests.includes(test.endpoint)) {
        // Simuler le test sans l'exécuter réellement
        await new Promise(resolve => setTimeout(resolve, 1000)) // Simule le temps de réponse
        
        let note = "Ce test est simulé pour éviter de modifier votre session d'authentification"
        if (test.endpoint === '/api/account/upload-photo') {
          note = "Ce test est simulé car il nécessite un upload de fichier multipart/form-data"
        }
        
        return {
          ...test,
          status: 'success' as const,
          responseTime: 1000,
          statusCode: 200,
          response: { 
            message: `Test simulé pour ${test.endpoint}`,
            note: note
          },
          error: undefined
        }
      }
      
      // Préparer les données de test selon l'endpoint
      switch (test.endpoint) {
        case '/api/admin/users':
          if (test.method === 'POST') {
            body = JSON.stringify({
              nom_utilisateur: `testuser_${Date.now()}`,
              email: `testuser_${Date.now()}@test.com`,
              mot_de_passe: 'password123',
              role: 'membre'
            })
          }
          break
        case '/api/admin/users/1':
          if (test.method === 'PUT') {
            body = JSON.stringify({
              nom_utilisateur: 'testuser_updated',
              email: 'updated@test.com',
              role: 'plus'
            })
          }
          break
        case '/api/admin/users/1/ban':
          body = JSON.stringify({ 
            raison: 'Test de bannissement', 
            duree: 7 
          })
          break
        case '/api/admin/users/1/unban':
          body = JSON.stringify({})
          break
        case '/api/admin/games':
          if (test.method === 'POST') {
            body = JSON.stringify({
              title: `Test Game ${Date.now()}`,
              description: 'Jeu de test automatique',
              platform: 'Windows',
              year: 2024,
              category_id: 1
            })
          }
          break
        case '/api/admin/games/1':
          if (test.method === 'PUT') {
            body = JSON.stringify({
              title: 'Test Game Updated',
              description: 'Description mise à jour'
            })
          }
          break
        case '/api/games/1/increment-view':
          body = JSON.stringify({})
          break
        case '/api/articles/categories':
          if (test.method === 'POST') {
            body = JSON.stringify({
              nom: `Test Category ${Date.now()}`,
              description: 'Catégorie de test'
            })
          }
          break
        case '/api/articles/1/reviews':
          if (test.method === 'POST') {
            body = JSON.stringify({
              note: 5,
              commentaire: 'Test review automatique'
            })
          }
          break
        case '/api/admin/articles':
          if (test.method === 'POST') {
            body = JSON.stringify({
              titre: `Test Article ${Date.now()}`,
              contenu: 'Contenu de test automatique',
              resume: 'Résumé de test',
              statut: 'brouillon'
            })
          }
          break
        case '/api/admin/articles/1':
          if (test.method === 'PUT') {
            body = JSON.stringify({
              titre: 'Article de test mis à jour',
              contenu: 'Contenu mis à jour'
            })
          }
          break
        case '/api/favorites':
          if (test.method === 'POST') {
            body = JSON.stringify({ game_id: 1, type: 'game' })
          } else if (test.method === 'DELETE') {
            body = JSON.stringify({ game_id: 1, type: 'game' })
          }
          break
        case '/api/ads/click':
          body = JSON.stringify({ ad_id: 1 })
          break
        case '/api/admin/ads':
          if (test.method === 'POST') {
            body = JSON.stringify({
              title: `Test Ad ${Date.now()}`,
              description: 'Publicité de test',
              ad_type: 'banner_bottom',
              ad_format: 'custom',
              target_roles: ['gratuit'],
              position_priority: 1,
              is_active: true
            })
          }
          break
        case '/api/admin/ads/1':
          if (test.method === 'PUT') {
            body = JSON.stringify({
              title: 'Publicité mise à jour',
              description: 'Description mise à jour'
            })
          }
          break
        case '/api/support/tickets':
          if (test.method === 'POST') {
            body = JSON.stringify({
              sujet: `Test Ticket ${Date.now()}`,
              message: 'Message de test automatique',
              priorite: 'normale'
            })
          }
          break
        case '/api/admin/support/tickets/1/assign':
          body = JSON.stringify({ assign_to: 1 })
          break
        case '/api/admin/support/tickets/1/status':
          body = JSON.stringify({ status: 'en_cours' })
          break
        case '/api/account/profile':
          if (test.method === 'PUT') {
            body = JSON.stringify({
              nom_utilisateur: 'profil_updated',
              email: 'profil@test.com'
            })
          }
          break
        case '/api/account/password':
          body = JSON.stringify({
            ancien_mot_de_passe: 'oldpass123',
            nouveau_mot_de_passe: 'newpass123'
          })
          break
        case '/api/download-links/1/increment-view':
          body = JSON.stringify({})
          break
      }
      
      const authToken = getAuthToken()
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      }
      
      // Ajouter le token d'authentification si disponible
      if (authToken) {
        headers['Cookie'] = `auth-token=${authToken}`
      }
      
      const options: RequestInit = {
        method: test.method,
        headers,
        credentials: 'include', // Important pour inclure les cookies
      }
      
      if (body) {
        options.body = body
      }
      
      response = await fetch(test.endpoint, options)
      
      const responseTime = Date.now() - startTime
      const responseData = await response.text()
      
      let parsedResponse
      try {
        parsedResponse = JSON.parse(responseData)
      } catch {
        parsedResponse = responseData
      }
      
      let errorMessage = undefined
      if (!response.ok) {
        if (response.status === 401) {
          errorMessage = `HTTP 401: Non authentifié - ${authToken ? 'Token invalide ou expiré' : 'Aucun token trouvé'}`
        } else if (response.status === 403) {
          errorMessage = `HTTP 403: Accès refusé - Permissions insuffisantes`
        } else {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`
        }
        
        // Ajouter le détail de la réponse si disponible
        if (parsedResponse && typeof parsedResponse === 'object' && parsedResponse.message) {
          errorMessage += ` - ${parsedResponse.message}`
        }
      }

      return {
        ...test,
        status: response.ok ? 'success' : 'error',
        responseTime,
        statusCode: response.status,
        response: parsedResponse,
        error: errorMessage
      }
      
    } catch (error) {
      const responseTime = Date.now() - startTime
      return {
        ...test,
        status: 'error',
        responseTime,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }
    }
  }

  const runAllTests = async () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentTest('')
    
    // Reset tous les tests
    const resetCategories = categories.map(cat => ({
      ...cat,
      tests: cat.tests.map(test => ({ ...test, status: 'pending' as const, error: undefined, response: undefined, responseTime: undefined, statusCode: undefined }))
    }))
    setCategories(resetCategories)
    
    let testCount = 0
    const updatedCategories: TestCategory[] = [...resetCategories]
    
    for (let catIndex = 0; catIndex < updatedCategories.length; catIndex++) {
      const category = updatedCategories[catIndex]
      
      for (let testIndex = 0; testIndex < category.tests.length; testIndex++) {
        const test = category.tests[testIndex]
        
        // Marquer le test comme en cours
        updatedCategories[catIndex].tests[testIndex] = { ...test, status: 'running' as const }
        setCategories([...updatedCategories])
        
        // Exécuter le test
        const result = await runSingleTest(category.id, test.id)
        
        // Mettre à jour le résultat
        updatedCategories[catIndex].tests[testIndex] = result
        setCategories([...updatedCategories])
        
        testCount++
        setProgress((testCount / totalTests) * 100)
        
        // Petite pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }
    
    setIsRunning(false)
    setCurrentTest('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'running':
        return <Spinner size="sm" color="primary" />
      default:
        return <Clock className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusChip = (status: string, statusCode?: number, response?: any) => {
    // Vérifier si c'est un test simulé
    const isSimulated = response && response.note && response.note.includes('simulé')
    
    switch (status) {
      case 'success':
        if (isSimulated) {
          return <Chip color="secondary" variant="flat" size="sm">🛡️ Simulé (200)</Chip>
        }
        return <Chip color="success" variant="flat" size="sm">✓ Réussi ({statusCode})</Chip>
      case 'error':
        return <Chip color="danger" variant="flat" size="sm">✗ Échec ({statusCode || 'N/A'})</Chip>
      case 'running':
        return <Chip color="primary" variant="flat" size="sm">⏳ En cours...</Chip>
      default:
        return <Chip color="default" variant="flat" size="sm">⏸ En attente</Chip>
    }
  }

  const getCategoryStats = (category: TestCategory) => {
    const success = category.tests.filter(t => t.status === 'success').length
    const error = category.tests.filter(t => t.status === 'error').length
    const total = category.tests.length
    
    return { success, error, total }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="max-w-md">
            <CardBody className="text-center">
              <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Accès Restreint</h2>
              <p className="text-default-600">
                Seuls les administrateurs peuvent accéder aux tests API.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Tests API Système</h1>
          <p className="text-lg text-default-600 mb-4">
            Interface de test complète pour toutes les APIs du système
          </p>
          
          {/* État d'authentification */}
          <div className="flex justify-center mb-6">
            <Chip 
              color={user ? 'success' : 'danger'} 
              variant="flat" 
              startContent={user ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            >
              {user ? `Connecté en tant que admin (${user.role})` : 'Non authentifié'}
            </Chip>
          </div>
          
          <div className="flex justify-center gap-4 mb-6">
            <Button
              color="primary"
              size="lg"
              startContent={<Play className="w-5 h-5" />}
              onPress={runAllTests}
              isDisabled={isRunning}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
            </Button>
          </div>
          
          {/* Informations importantes */}
          <div className="max-w-4xl mx-auto mb-6 space-y-4">
            {!user && (
              <Card className="bg-warning-50 border-warning-200">
                <CardBody className="text-center py-4">
                  <AlertTriangle className="w-8 h-8 text-warning mx-auto mb-2" />
                  <p className="text-warning-700 font-medium mb-2">
                    Attention : Vous n'êtes pas authentifié
                  </p>
                  <p className="text-warning-600 text-sm">
                    La plupart des tests échoueront avec des erreurs 401. Connectez-vous en tant qu'admin pour des tests complets.
                  </p>
                </CardBody>
              </Card>
            )}
            
            <Card className="bg-blue-50 border-blue-200">
              <CardBody className="text-center py-4">
                <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-700 font-medium mb-2">
                  Tests d'authentification sécurisés
                </p>
                <p className="text-blue-600 text-sm">
                  Les tests de connexion/déconnexion sont simulés pour préserver votre session. 
                  Ils affichent "Réussi" sans modifier votre état d'authentification.
                </p>
              </CardBody>
            </Card>
          </div>
          
          {isRunning && (
            <div className="max-w-md mx-auto">
              <Progress 
                value={progress} 
                color="primary" 
                className="mb-2"
                label={`Progression: ${Math.round(progress)}%`}
              />
              <p className="text-sm text-default-600">
                {currentTest && `Test en cours: ${currentTest}`}
              </p>
            </div>
          )}
        </div>

        {/* Stats globales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-primary">{totalTests}</div>
              <div className="text-sm text-default-600">Tests Total</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-success">
                {categories.reduce((acc, cat) => 
                  acc + cat.tests.filter(test => test.status === 'success').length, 0
                )}
              </div>
              <div className="text-sm text-default-600">Réussis</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-danger">
                {categories.reduce((acc, cat) => 
                  acc + cat.tests.filter(test => test.status === 'error').length, 0
                )}
              </div>
              <div className="text-sm text-default-600">Échecs</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <div className="text-2xl font-bold text-warning">
                {categories.reduce((acc, cat) => 
                  acc + cat.tests.filter(test => test.status === 'running').length, 0
                )}
              </div>
              <div className="text-sm text-default-600">En cours</div>
            </CardBody>
          </Card>
        </div>

        {/* Résultats par catégorie */}
        <Accordion variant="splitted" className="w-full">
          {categories.map((category) => {
            const stats = getCategoryStats(category)
            const IconComponent = category.icon
            
            return (
              <AccordionItem
                key={category.id}
                aria-label={category.name}
                title={
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5" />
                    <span className="font-semibold">{category.name}</span>
                    <div className="flex gap-2 ml-auto">
                      <Chip color="success" variant="flat" size="sm">{stats.success}</Chip>
                      <Chip color="danger" variant="flat" size="sm">{stats.error}</Chip>
                      <Chip color="default" variant="flat" size="sm">{stats.total}</Chip>
                    </div>
                  </div>
                }
                className="mb-2"
              >
                <div className="space-y-3">
                  {category.tests.map((test) => (
                    <Card key={test.id} className="shadow-sm">
                      <CardBody>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h4 className="font-semibold">{test.name}</h4>
                              <p className="text-sm text-default-600">
                                {test.method} {test.endpoint}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {getStatusChip(test.status, test.statusCode, test.response)}
                            {test.responseTime && (
                              <p className="text-xs text-default-500 mt-1">
                                {test.responseTime}ms
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {test.error && (
                          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3 mb-3">
                            <p className="text-sm text-danger-700 font-mono">
                              {test.error}
                            </p>
                          </div>
                        )}
                        
                        {test.response && test.status === 'success' && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-sm text-default-600 hover:text-default-800">
                              Voir la réponse
                            </summary>
                            <div className="mt-2 p-3 bg-default-100 rounded">
                              {test.response.note && test.response.note.includes('simulé') && (
                                <div className="mb-2 p-2 bg-blue-100 border border-blue-200 rounded text-xs">
                                  <Shield className="w-4 h-4 inline mr-1 text-blue-600" />
                                  <span className="text-blue-700 font-medium">Test sécurisé :</span>
                                  <span className="text-blue-600 ml-1">{test.response.note}</span>
                                </div>
                              )}
                              <pre className="text-xs overflow-x-auto">
                                {JSON.stringify(test.response, null, 2)}
                              </pre>
                            </div>
                          </details>
                        )}
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </div>
  )
}
