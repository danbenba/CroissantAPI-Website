"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/navigation"
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Progress,
  Divider,
  Avatar,
  Badge
} from "@heroui/react"
import {
  UsersIcon,
  ChartBarIcon,
  EyeIcon,
  CogIcon,
  ShieldCheckIcon,
  BoltIcon,
  GlobeAltIcon,
  ComputerDesktopIcon
} from "@heroicons/react/24/outline"

interface AdminStats {
  totalUsers: number
  totalPrograms: number
  averageRating: string
  totalVotes: number
}

interface User {
  id: number
  nom_utilisateur: string
  email: string
  role: string
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AdminStats | null>(null)

  // Vérification de l'authentification
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
          cache: "no-cache"
        })
        
        if (response.ok) {
          const data = await response.json()
          
          if (data.user && data.success) {
            if (data.user.role === "admin") {
              setUser(data.user)
              fetchStats()
            } else {
              setTimeout(() => router.push("/"), 3000)
            }
          } else {
            setTimeout(() => router.push("/"), 3000)
          }
        } else {
          setTimeout(() => router.push("/"), 3000)
        }
      } catch (error) {
        setTimeout(() => router.push("/"), 3000)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include"
      })
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    }
  }

  // Quick actions data
  const quickActions = [
    {
      title: "Gérer les Jeux",
      description: "Ajouter, modifier ou supprimer des jeux",
      icon: ComputerDesktopIcon,
      color: "primary",
      href: "/admin/games",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "Utilisateurs",
      description: "Gérer les comptes utilisateurs",
      icon: UsersIcon,
      color: "secondary",
      href: "/admin/users",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      title: "Support",
      description: "Tickets et demandes d'aide",
      icon: ShieldCheckIcon,
      color: "success",
      href: "/admin/supports",
      gradient: "from-green-500 to-teal-600"
    },
    {
      title: "Publicités",
      description: "Gérer les bannières publicitaires",
      icon: GlobeAltIcon,
      color: "warning",
      href: "/admin/ads",
      gradient: "from-orange-500 to-red-600"
    },
    {
      title: "Articles",
      description: "Créer et gérer les articles",
      icon: ChartBarIcon,
      color: "danger",
      href: "/admin/articles",
      gradient: "from-red-500 to-pink-600"
    },
    {
      title: "Système",
      description: "Configuration et paramètres",
      icon: CogIcon,
      color: "default",
      href: "/admin/system",
      gradient: "from-gray-500 to-gray-700"
    }
  ]

  // Affichage de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <Navigation />
        
        {/* Voile violet en arrière-plan */}
        <div 
          className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
          style={{ inset: 0 }}
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
            <CardBody className="text-center p-10">
              <Spinner size="lg" color="primary" label="Vérification de l'authentification..." />
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  // Redirection si non connecté ou non admin
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background text-foreground relative">
        <Navigation />
        
        {/* Voile violet en arrière-plan */}
        <div 
          className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-red-500"
          style={{ inset: 0 }}
        />
        
        <div className="flex items-center justify-center min-h-screen">
          <Card className="bg-gray-900/60 backdrop-blur-lg border border-red-500/30 max-w-md mx-auto">
            <CardBody className="text-center p-10">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-5">
                <ShieldCheckIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Accès Refusé</h2>
              <p className="text-gray-300 mb-5">
                Vous n'avez pas les permissions nécessaires pour accéder à cette page.
              </p>
              <p className="text-sm text-gray-400">
                Redirection vers l'accueil dans quelques secondes...
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <Navigation />
      
      {/* Voile violet en arrière-plan */}
      <div 
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Header avec badge admin et titre */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-300 px-6 py-3 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-purple-500/30">
            <ShieldCheckIcon className="w-4 h-4" />
            Panel Administrateur
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent">
              Tableau de Bord
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-4 text-gray-300">
            <Badge content="" color="success" shape="circle" size="sm">
              <Avatar 
                src="/api/storage/profile/default.png" 
                size="sm"
                className="border-2 border-purple-500/30"
              />
            </Badge>
            <div className="text-left">
              <p className="text-white font-medium">Bienvenue, {user.nom_utilisateur}</p>
              <p className="text-sm text-gray-400">Administrateur Système</p>
            </div>
          </div>
        </div>

        {/* Statistiques en temps réel */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <UsersIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <p className="text-gray-400 text-sm">Utilisateurs</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <ComputerDesktopIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalPrograms}</p>
                    <p className="text-gray-400 text-sm">Programmes</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.averageRating}</p>
                    <p className="text-gray-400 text-sm">Note Moyenne</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardBody className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.totalVotes}</p>
                    <p className="text-gray-400 text-sm">Total Votes</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Actions rapides */}
        <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Actions Rapides</h2>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Card 
                  key={index}
                  className="bg-gray-800/50 backdrop-blur-sm border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  isPressable
                  onPress={() => window.location.href = action.href}
                >
                  <CardBody className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                          {action.title}
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <ChartBarIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Performances</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Utilisation Serveur</span>
                    <span className="text-white">78%</span>
                  </div>
                  <Progress 
                    value={78} 
                    color="success" 
                    className="max-w-full"
                    classNames={{
                      track: "bg-gray-700",
                      indicator: "bg-gradient-to-r from-green-400 to-green-600"
                    }}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Base de Données</span>
                    <span className="text-white">65%</span>
                  </div>
                  <Progress 
                    value={65} 
                    color="primary" 
                    className="max-w-full"
                    classNames={{
                      track: "bg-gray-700",
                      indicator: "bg-gradient-to-r from-blue-400 to-blue-600"
                    }}
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300">Trafic Réseau</span>
                    <span className="text-white">45%</span>
                  </div>
                  <Progress 
                    value={45} 
                    color="warning" 
                    className="max-w-full"
                    classNames={{
                      track: "bg-gray-700",
                      indicator: "bg-gradient-to-r from-orange-400 to-orange-600"
                    }}
                  />
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="bg-gray-900/60 backdrop-blur-lg border border-white/10 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <BoltIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">Activité Récente</h3>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Nouveau jeu ajouté</p>
                    <p className="text-gray-400 text-xs">Il y a 2 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Utilisateur banni</p>
                    <p className="text-gray-400 text-xs">Il y a 15 minutes</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Ticket support résolu</p>
                    <p className="text-gray-400 text-xs">Il y a 1 heure</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-white text-sm">Mise à jour système</p>
                    <p className="text-gray-400 text-xs">Il y a 3 heures</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}