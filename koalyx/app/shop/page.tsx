"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Spinner,
  Avatar,
  Select,
  SelectItem,
} from "@heroui/react"

interface PricingPlan {
  id: string
  name: string
  displayName: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  icon: string
  badge?: string
}

interface ButtonProps {
  color: "default" | "primary" | "secondary" | "success" | "warning" | "danger"
  variant: "shadow" | "bordered" | "flat" | "solid" | "light" | "faded" | "ghost"
  disabled: boolean
}

export default function ShopPage() {
  const [loading, setLoading] = useState(true)
  const [previewRole, setPreviewRole] = useState<string>('')
  const { user } = useAuth()
  const { t } = useLanguage()

  useEffect(() => {
    // Simuler un chargement
    const timer = setTimeout(() => setLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  // Définir le rôle de prévisualisation par défaut
  useEffect(() => {
    if (user && !previewRole) {
      setPreviewRole(user.role)
    } else if (!user && !previewRole) {
      setPreviewRole('membre') // Par défaut pour les utilisateurs non connectés
    }
  }, [user, previewRole])

  // Options pour le menu déroulant de prévisualisation
  const previewOptions = [
    { key: 'membre', label: 'Gratuit (Membre)', icon: 'fas fa-user' },
    { key: 'plus', label: 'Premium (Plus)', icon: 'fas fa-star' },
    { key: 'ultra', label: 'Ultra', icon: 'fas fa-crown' }
  ]

  // Obtenir le rôle à afficher (prévisualisation ou rôle actuel)
  const getDisplayRole = () => {
    if (previewRole) return previewRole
    if (user?.role) return user.role
    return 'membre' // Par défaut pour les utilisateurs non connectés
  }

  // Fonction pour obtenir l'icône selon le rôle
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return 'fas fa-shield-alt'
      case 'moderateur':
        return 'fas fa-gavel'
      case 'support':
        return 'fas fa-headset'
      case 'ultra':
        return 'fas fa-crown'
      case 'plus':
        return 'fas fa-star'
      case 'membre':
      default:
        return 'fas fa-user'
    }
  }

  // Fonction pour obtenir le nom affiché du rôle
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return t('roles.admin')
      case 'moderateur':
        return t('roles.moderateur')
      case 'support':
        return t('roles.support')
      case 'ultra':
        return t('roles.ultra')
      case 'plus':
        return t('roles.plus')
      case 'membre':
      default:
        return t('roles.membre')
    }
  }

  // Fonction pour obtenir les dégradés selon le rôle
  const getRoleGradient = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-500 to-red-600'
      case 'moderateur':
        return 'bg-gradient-to-r from-blue-500 to-blue-600'
      case 'support':
        return 'bg-gradient-to-r from-green-500 to-green-600'
      case 'plus':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500'
      case 'ultra':
        return 'bg-gradient-to-r from-purple-500 to-indigo-600'
      case 'membre':
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600'
    }
  }

  // Fonction pour obtenir les couleurs de texte selon le rôle
  const getRoleTextGradient = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent'
      case 'moderateur':
        return 'bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent'
      case 'support':
        return 'bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent'
      case 'plus':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent'
      case 'ultra':
        return 'bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent'
      case 'membre':
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent'
    }
  }

  // Fonction pour vérifier si l'utilisateur possède déjà un plan
  const hasAccessToPlan = (planId: string) => {
    if (!user) return false
    
    const userRole = user.role
    
    // Hiérarchie des rôles
    const roleHierarchy = {
      'membre': 1,
      'plus': 2,
      'ultra': 3
    }
    
    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const planLevel = roleHierarchy[planId as keyof typeof roleHierarchy] || 0
    
    return userLevel >= planLevel
  }

  // Fonction pour obtenir le message du bouton selon l'état
  const getButtonContent = (planId: string) => {
    if (!user) {
      return planId === 'membre' ? t('vip.freePrice') : t('shop.signInToBuy')
    }
    
    if (hasAccessToPlan(planId)) {
      return t('shop.youAlreadyHave')
    }
    
    return planId === 'membre' ? t('vip.freePrice') : t('shop.chooseThisPlan')
  }

  // Fonction pour obtenir la couleur du bouton selon l'état
  const getButtonProps = (plan: PricingPlan): ButtonProps => {
    if (!user) {
      return {
        color: plan.color,
        variant: plan.highlighted ? "shadow" : "bordered",
        disabled: false
      }
    }
    
    if (hasAccessToPlan(plan.id)) {
      return {
        color: "success",
        variant: "shadow",
        disabled: true
      }
    }
    
    return {
      color: plan.color,
      variant: plan.highlighted ? "shadow" : "bordered",
      disabled: false
    }
  }

  const pricingPlans: PricingPlan[] = [
    {
      id: 'membre',
      name: 'membre',
      displayName: t('vip.free'),
      price: t('vip.freePrice'),
      period: t('shop.freeForever'),
      description: t('shop.memberDescription'),
      color: 'default',
      icon: 'fas fa-user',
      features: [
        t('shop.features.freeGamesAccess'),
        t('shop.features.limitedDownloads'),
        t('shop.features.communitySupport'),
        t('shop.features.customProfile'),
        t('shop.features.limitedFavorites')
      ]
    },
    {
      id: 'plus',
      name: 'plus',
      displayName: t('vip.plus'),
      price: '5.00€',
      period: t('shop.freeForever'),
      description: t('shop.plusDescription'),
      color: 'warning',
      icon: 'fas fa-star',
      highlighted: true,
      features: [
        t('shop.features.allMemberBenefits'),
        t('shop.features.premiumGamesAccess'),
        t('shop.features.noAdsPopup'),
        t('shop.features.prioritySupport'),
        t('shop.features.earlyAccess'),
        t('shop.features.exclusivePlusBadge')
      ]
    },
    {
      id: 'ultra',
      name: 'ultra',
      displayName: t('vip.ultra'),
      price: '19.99€',
      period: t('shop.perMonth'),
      description: t('shop.ultraDescription'),
      color: 'secondary',
      icon: 'fas fa-crown',
      features: [
        t('shop.features.allPlusBenefits'),
        t('shop.features.exclusiveUltraContent'),
        t('shop.features.ultraFastServers'),
        t('shop.features.vipSupport247'),
        t('shop.features.betaAccess'),
        t('shop.features.exclusiveUltraBadge'),
        t('shop.features.apiKey'),
        t('shop.features.partnerDiscounts')
      ]
    }
  ]

  const allFeatures = [
    { name: t('shop.features.freeGamesAccess'), membre: true, plus: true, ultra: true },
    { name: t('shop.comparison.downloadsPerDay'), membre: '10', plus: t('shop.comparison.unlimited'), ultra: t('shop.comparison.unlimited') },
    { name: t('shop.comparison.customerSupport'), membre: t('shop.comparison.communitySupport'), plus: t('shop.comparison.prioritySupport'), ultra: t('shop.comparison.vipSupport') },
    { name: t('shop.comparison.premiumGames'), membre: false, plus: true, ultra: true },
    { name: t('shop.comparison.earlyAccess'), membre: false, plus: true, ultra: true },
    { name: t('shop.comparison.exclusiveContent'), membre: false, plus: false, ultra: true },
    { name: t('shop.comparison.ultraFastServers'), membre: false, plus: false, ultra: true },
    { name: t('shop.comparison.privateCommunity'), membre: false, plus: false, ultra: true },
    { name: t('shop.comparison.partnerDiscounts'), membre: false, plus: false, ultra: true }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans relative flex items-center justify-center">
        {/* voile violet identique */}
        <div
          className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
          style={{ inset: 0 as unknown as number }}
        />
        
        {/* contenu de chargement */}
        <div className="relative z-10 text-center">
          <Spinner size="lg" color="primary" label={t('shop.loading')} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      <Navigation />

      {/* voile violet en arrière-plan, calqué sur la page d'accueil */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">

      {/* Hero Section */}
      <div className="relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
            <i className="fas fa-shopping-cart mr-4 text-blue-400"></i>
{t('shop.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
{t('shop.subtitle')}
          </p>

          {/* Aperçu utilisateur */}
          {user ? (
            <div className="mb-12">
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 max-w-2xl mx-auto">
                <CardBody className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <Avatar
                        src={user.photo || "/storage/icons/default_profile.png"}
                        className="w-16 h-16"
                        showFallback
                        fallback={<i className="fas fa-user text-white"></i>}
                      />
                      <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${getRoleGradient(user.role)} rounded-full flex items-center justify-center shadow-lg`}>
                        <i className={`${getRoleIcon(user.role)} text-xs text-white`}></i>
                      </div>
                    </div>
                    <div className="text-left flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
Bonjour, {user.nom_utilisateur} !
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
{t('shop.yourCurrentRole')} :
                      </p>
                      <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRoleGradient(user.role)}`}>
                        <span className="text-white">
{getRoleDisplayName(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Section de prévisualisation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Menu de prévisualisation */}
                    <div>
                      <p className="text-gray-400 text-sm mb-3">{t('shop.previewAs')} :</p>
                      <Select
                        placeholder="Choisir un niveau"
                        selectedKeys={previewRole ? [previewRole] : []}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string
                          setPreviewRole(selectedKey)
                        }}
                        classNames={{
                          trigger: "bg-gray-700/50 border-white/20 hover:border-blue-500/50",
                          value: "text-white",
                          popoverContent: "bg-gray-800 border-white/20"
                        }}
                        startContent={
                          <div className={`w-6 h-6 ${getRoleGradient(getDisplayRole())} rounded-full flex items-center justify-center`}>
                            <i className={`${getRoleIcon(getDisplayRole())} text-xs text-white`}></i>
                          </div>
                        }
                      >
                        {previewOptions.map((option) => (
                          <SelectItem key={option.key}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 ${getRoleGradient(option.key)} rounded-full flex items-center justify-center`}>
                                <i className={`${option.icon} text-xs text-white`}></i>
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Aperçu du pseudo avec dégradé */}
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Aperçu de votre pseudo :</p>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${getRoleGradient(getDisplayRole())} rounded-full flex items-center justify-center shadow-lg`}>
                            <i className={`${getRoleIcon(getDisplayRole())} text-sm text-white`}></i>
                          </div>
                          <span className={`text-lg font-bold ${getRoleTextGradient(getDisplayRole())}`}>
                            {user.nom_utilisateur}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          {getDisplayRole() === user.role ? 
                            'Votre niveau actuel' : 
                            `Aperçu du niveau ${getRoleDisplayName(getDisplayRole())}`
                          }
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bouton de réinitialisation */}
                  {previewRole && previewRole !== user.role && (
                    <div className="mt-4 text-center">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => setPreviewRole(user.role)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <i className="fas fa-undo mr-2"></i>
                        Retour à votre niveau actuel
                      </Button>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          ) : (
            /* Aperçu pour utilisateurs non connectés */
            <div className="mb-12">
              <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 max-w-2xl mx-auto">
                <CardBody className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">
                      Prévisualisez votre pseudo
                    </h3>
                    <p className="text-sm text-gray-400">
                      Découvrez à quoi ressemblera votre pseudo avec chaque niveau
                    </p>
                  </div>
                  
                  {/* Section de prévisualisation pour invités */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Menu de prévisualisation */}
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Choisir un niveau :</p>
                      <Select
                        placeholder="Choisir un niveau"
                        selectedKeys={previewRole ? [previewRole] : ['membre']}
                        onSelectionChange={(keys) => {
                          const selectedKey = Array.from(keys)[0] as string
                          setPreviewRole(selectedKey)
                        }}
                        classNames={{
                          trigger: "bg-gray-700/50 border-white/20 hover:border-blue-500/50",
                          value: "text-white",
                          popoverContent: "bg-gray-800 border-white/20"
                        }}
                        startContent={
                          <div className={`w-6 h-6 ${getRoleGradient(getDisplayRole())} rounded-full flex items-center justify-center`}>
                            <i className={`${getRoleIcon(getDisplayRole())} text-xs text-white`}></i>
                          </div>
                        }
                      >
                        {previewOptions.map((option) => (
                          <SelectItem key={option.key}>
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 ${getRoleGradient(option.key)} rounded-full flex items-center justify-center`}>
                                <i className={`${option.icon} text-xs text-white`}></i>
                              </div>
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    {/* Aperçu du pseudo avec dégradé */}
                    <div>
                      <p className="text-gray-400 text-sm mb-3">Aperçu du pseudo :</p>
                      <div className="p-4 bg-gray-700/30 rounded-lg border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 ${getRoleGradient(getDisplayRole())} rounded-full flex items-center justify-center shadow-lg`}>
                            <i className={`${getRoleIcon(getDisplayRole())} text-sm text-white`}></i>
                          </div>
                          <span className={`text-lg font-bold ${getRoleTextGradient(getDisplayRole())}`}>
                            VotrePseudo
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Aperçu du niveau {getRoleDisplayName(getDisplayRole())}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Call to action pour se connecter */}
                  <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm mb-3">
                      Connectez-vous pour voir votre vrai pseudo
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button 
                        as={Link} 
                        href="/login" 
                        color="primary" 
                        variant="shadow"
                        size="sm"
                      >
                        Se connecter
                      </Button>
                      <Button 
                        as={Link} 
                        href="/register" 
                        variant="bordered" 
                        size="sm"
                        className="text-white border-white/20 hover:border-white/40"
                      >
                        S'inscrire
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-4xl font-bold mb-16 text-white text-center">
          <i className="fas fa-tags text-blue-400 mr-3"></i>
          Nos Plans
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => {
            const isOwned = hasAccessToPlan(plan.id)
            const buttonProps = getButtonProps(plan)
            
            return (
            <Card 
              key={plan.id}
              className={`
                relative bg-gray-800/50 backdrop-blur-sm border border-white/10 
                ${plan.highlighted && !isOwned ? 'ring-2 ring-blue-500 lg:scale-105 shadow-2xl shadow-blue-500/20 lg:-mt-4' : ''}
                ${isOwned ? 'ring-2 ring-green-500 shadow-2xl shadow-green-500/20' : ''}
                hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 hover:shadow-xl
                ${isOwned ? 'bg-gradient-to-br from-green-900/20 to-green-800/20' : ''}
                min-h-[600px] flex flex-col
              `}
            >
              {/* Badge en haut à droite */}
              {plan.badge && !isOwned && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Chip 
                    color={plan.color} 
                    variant="shadow" 
                    className="text-white font-bold text-xs px-4 py-2"
                    startContent={<i className="fas fa-fire text-xs"></i>}
                  >
                    {plan.badge}
                  </Chip>
                </div>
              )}

              {isOwned && (
                <div className="absolute -top-3 -right-3 z-10">
                  <Chip 
                    color="success" 
                    variant="shadow" 
                    className="text-white font-bold text-xs px-4 py-2"
                    startContent={<i className="fas fa-check text-xs"></i>}
                  >
                    Actuel
                  </Chip>
                </div>
              )}

            <CardHeader className="pt-8 pb-6 flex-shrink-0">
              {/* Ligne d'en-tête : Icône | Titre | Prix | Badge (en containers séparés) */}
              <div className="flex flex-col items-center justify-center gap-6 w-full text-center">
                {/* Première ligne : Icône + Titre */}
                <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6 justify-center mx-auto">
                  {/* 1) Icône */}
                  <div className="flex justify-center">
                    <div className={`w-20 h-20 ${getRoleGradient(plan.id)} rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 hover:scale-110 mx-auto`}>
                      <i className={`${plan.icon} text-3xl text-white`}></i>
                    </div>
                  </div>

                  {/* 2) Titre (Membre / Plus / Ultra) */}
                  <div className="flex justify-center w-full sm:w-auto">
                    <h3 className={`text-2xl sm:text-3xl font-bold ${getRoleTextGradient(plan.id)} whitespace-nowrap text-center`}>
                      {plan.displayName}
                    </h3>
                  </div>
                </div>

                {/* Séparateur visuel centré */}
                <div className="flex justify-center w-full">
                  <div className="w-24 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                </div>

                {/* 3) Prix - Parfaitement centré */}
                <div className="flex flex-col items-center gap-3 w-full justify-center">
                  <div className="flex items-baseline gap-2 justify-center mx-auto">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white whitespace-nowrap">
                      {plan.price}
                    </span>
                    {plan.period !== 'pour toujours' && (
                      <span className="text-gray-400 text-sm sm:text-base lg:text-lg whitespace-nowrap">
                        / {plan.period}
                      </span>
                    )}
                  </div>

                  {plan.period === 'pour toujours' && (
                    <div className="flex items-center justify-center mx-auto">
                      <span className="text-green-400 text-xs sm:text-sm font-semibold whitespace-nowrap text-center">
                        <i className="fas fa-infinity mr-1"></i>
                        Achat unique
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
              
              <CardBody className="pt-0 flex-grow flex flex-col">
                {/* Liste des fonctionnalités */}
                <div className="flex-grow">
                  <div className="mb-6">
                    <h4 className="text-white font-semibold mb-4 text-center">
                      <i className="fas fa-list-check mr-2 text-blue-400"></i>
                      Fonctionnalités incluses
                    </h4>
                    <ul className="space-y-4">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start text-gray-300 group">
                          <div className="flex-shrink-0 mr-3 mt-0.5">
                            <i className="fas fa-check text-green-400 text-sm group-hover:scale-110 transition-transform"></i>
                          </div>
                          <span className="text-sm leading-relaxed group-hover:text-white transition-colors">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Bouton d'action */}
                <div className="mt-auto pt-4">
                  <Button
                    color={buttonProps.color}
                    variant={buttonProps.variant}
                    fullWidth
                    size="lg"
                    disabled={buttonProps.disabled}
                    className={`
                      font-bold text-base h-14 transition-all duration-300
                      ${isOwned ? 'cursor-not-allowed' : ''}
                      ${!isOwned && plan.highlighted ? 'text-white shadow-lg' : 'text-white hover:bg-white/10'}
                      ${!isOwned ? 'hover:scale-105 hover:shadow-xl' : ''}
                    `}
                  >
                    {isOwned && <i className="fas fa-check mr-2"></i>}
                    {!isOwned && plan.highlighted && <i className="fas fa-star mr-2"></i>}
                    {!isOwned && !plan.highlighted && <i className="fas fa-arrow-right mr-2"></i>}
                    {getButtonContent(plan.id)}
                  </Button>
                </div>
              </CardBody>
            </Card>
            )
          })}
        </div>

        {/* Features Comparison Table */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-16 text-white text-center">
            <i className="fas fa-chart-bar text-green-400 mr-3"></i>
            Comparaison des Fonctionnalités
          </h2>

          <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 overflow-hidden">
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="text-left p-6 text-white font-semibold">Fonctionnalités</th>
                      <th className="text-center p-6 text-white font-semibold">
                        <i className="fas fa-user mr-2"></i>Membre
                      </th>
                      <th className="text-center p-6 text-white font-semibold">
                        <i className="fas fa-star mr-2 text-yellow-400"></i>Plus
                      </th>
                      <th className="text-center p-6 text-white font-semibold">
                        <i className="fas fa-crown mr-2 text-purple-400"></i>Ultra
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allFeatures.map((feature, index) => (
                      <tr key={index} className="border-t border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-6 text-gray-300 font-medium">{feature.name}</td>
                        <td className="p-6 text-center">
                          {typeof feature.membre === 'boolean' ? (
                            feature.membre ? (
                              <i className="fas fa-check text-green-400 text-lg"></i>
                            ) : (
                              <i className="fas fa-times text-red-400 text-lg"></i>
                            )
                          ) : (
                            <span className="text-gray-300">{feature.membre}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {typeof feature.plus === 'boolean' ? (
                            feature.plus ? (
                              <i className="fas fa-check text-green-400 text-lg"></i>
                            ) : (
                              <i className="fas fa-times text-red-400 text-lg"></i>
                            )
                          ) : (
                            <span className="text-gray-300">{feature.plus}</span>
                          )}
                        </td>
                        <td className="p-6 text-center">
                          {typeof feature.ultra === 'boolean' ? (
                            feature.ultra ? (
                              <i className="fas fa-check text-green-400 text-lg"></i>
                            ) : (
                              <i className="fas fa-times text-red-400 text-lg"></i>
                            )
                          ) : (
                            <span className="text-gray-300">{feature.ultra}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold mb-16 text-white text-center">
            <i className="fas fa-gift text-pink-400 mr-3"></i>
            Pourquoi Passer Premium ?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 group">
              <CardBody className="text-center p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-download text-blue-400 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                  Téléchargements<br />Illimités
                </h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  Fini les limites ! Téléchargez autant de jeux et programmes que vous voulez,<br />
                  quand vous voulez.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 group">
              <CardBody className="text-center p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-rocket text-green-400 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                  Vitesses<br />Ultra-Rapides
                </h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  Accédez à nos serveurs premium pour des téléchargements à vitesse maximale,<br />
                  sans attente.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 group">
              <CardBody className="text-center p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-crown text-yellow-400 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors">
                  Contenu<br />Exclusif
                </h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  Découvrez des jeux et programmes exclusifs, disponibles uniquement<br />
                  pour nos membres premium.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 group">
              <CardBody className="text-center p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-main-overlay/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-headset text-purple-400 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  Support<br />Prioritaire
                </h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  Bénéficiez d'un support client prioritaire avec des temps de réponse<br />
                  réduits et une assistance personnalisée.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 group">
              <CardBody className="text-center p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-clock text-orange-400 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-orange-400 transition-colors">
                  Accès<br />Anticipé
                </h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  Soyez les premiers à découvrir les nouveautés avec un accès anticipé<br />
                  aux dernières sorties.
                </p>
              </CardBody>
            </Card>

            <Card className="bg-gray-800/50 backdrop-blur-sm border border-white/10 hover:bg-gray-700/50 transition-all duration-300 hover:scale-105 group">
              <CardBody className="text-center p-8 h-full flex flex-col">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <i className="fas fa-users text-cyan-400 text-3xl"></i>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors">
                  Communauté<br />Privée
                </h3>
                <p className="text-gray-300 leading-relaxed flex-grow">
                  Rejoignez notre communauté premium exclusive pour échanger avec<br />
                  d'autres passionnés et obtenir des conseils d'experts.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-blue-600/20 backdrop-blur-sm border border-blue-500/30">
            <CardBody className="p-12">
              <h2 className="text-3xl font-bold text-white mb-6">
                Prêt à débloquer votre potentiel ?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Rejoignez des milliers d'utilisateurs satisfaits et découvrez pourquoi 
                Koalyx Premium est le choix numéro un des passionnés.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  color="primary" 
                  variant="shadow" 
                  size="lg"
                  className="text-white font-semibold px-8"
                >
                  <i className="fas fa-star mr-2"></i>
                  Commencer avec Plus
                </Button>
                <Button 
                  color="secondary" 
                  variant="shadow" 
                  size="lg"
                  className="text-white font-semibold px-8"
                >
                  <i className="fas fa-crown mr-2"></i>
                  Passer à Ultra
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
      
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
