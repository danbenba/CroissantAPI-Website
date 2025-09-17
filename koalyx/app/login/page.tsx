"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useLanguage } from '@/contexts/LanguageContext'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Checkbox,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure
} from "@heroui/react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { t } = useLanguage()
  const { isOpen: isErrorModalOpen, onOpen: onErrorModalOpen, onOpenChange: onErrorModalOpenChange } = useDisclosure()
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  })
  
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Gérer les messages de succès/erreur depuis l'URL (Discord auth)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const success = params.get('success')
      const error = params.get('error')
      
      if (success === 'discord_login') {
        setSuccessMessage('Connexion Discord réussie ! Redirection...')
        // Rediriger vers l'accueil après 2 secondes
        setTimeout(() => {
          router.push('/')
        }, 2000)
      } else if (error) {
        let errorMsg = 'Erreur lors de la connexion Discord'
        switch (error) {
          case 'discord_cancelled':
            errorMsg = 'Connexion Discord annulée'
            break
          case 'discord_error':
            errorMsg = 'Erreur lors de la connexion Discord'
            break
          case 'missing_code':
            errorMsg = 'Code Discord manquant'
            break
          case 'invalid_state':
            errorMsg = 'État de sécurité invalide'
            break
        }
        setErrorMessage(errorMsg)
        onErrorModalOpen()
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🔄 Tentative de connexion pour:', formData.username)
      
      const result = await login(formData.username, formData.password)
      
      if (result.success) {
        console.log('✅ Connexion réussie !')
        // Rediriger vers la page d'accueil après connexion
        router.push('/')
      } else {
        console.log('❌ Échec de connexion:', result.error)
        setErrorMessage(result.error || t('auth.invalidCredentials'))
        onErrorModalOpen()
      }
    } catch (err) {
      console.error('❌ Erreur lors de la connexion:', err)
      setErrorMessage(t('auth.unexpectedError'))
      onErrorModalOpen()
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground font-sans relative flex flex-col"
      style={{}}
    >
      <Navigation />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">

      {/* voile violet en arrière-plan, calqué sur la page d'accueil */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Contenu principal centré */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo et titre */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-6 shadow-2xl">
              <i className="fas fa-unlock text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
              Koalyx
            </h1>
            <p className="text-gray-300 text-lg">{t('auth.loginSubtitle')}</p>
            
            {/* Message de succès Discord */}
            {successMessage && (
              <div className="mt-4">
                <Chip 
                  color="success" 
                  variant="flat" 
                  className="w-full text-center"
                  startContent={<i className="fas fa-check-circle" />}
                >
                  {successMessage}
                </Chip>
              </div>
            )}
          </div>

          {/* Formulaire de connexion */}
          <Card className="bg-gray-800/50 backdrop-blur-xl border-gray-700/50 shadow-2xl">
          
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nom d'utilisateur */}
              <div>
                <Input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  label={t('auth.username')}
                  placeholder={t('auth.username')}
                  startContent={<i className="fas fa-user text-gray-400" />}
                  variant="bordered"
                  color="primary"
                  className="w-full"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  label={t('auth.password')}
                  placeholder={t('auth.password')}
                  startContent={<i className="fas fa-lock text-gray-400" />}
                  variant="bordered"
                  color="primary"
                  className="w-full"
                />
              </div>

              {/* Options */}
              <div className="flex items-center justify-between">
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  color="primary"
                  size="sm"
                >
                  <span className="text-sm text-gray-300">{t('auth.rememberMe')}</span>
                </Checkbox>
                
                <a
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </a>
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                color="primary"
                variant="solid"
                size="lg"
                className="w-full h-12 text-lg font-semibold"
                startContent={loading ? <Spinner size="sm" color="white" /> : <i className="fas fa-sign-in-alt" />}
                disabled={loading}
              >
                {loading ? t('auth.redirecting') : t('auth.loginButton')}
              </Button>
            </form>

            {/* Séparateur */}
            <div className="my-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <Chip variant="flat" color="default" size="sm" className="bg-gray-800 border-gray-600">
                    <span className="text-gray-400">Ou</span>
                  </Chip>
                </div>
              </div>
            </div>

            {/* Boutons sociaux */}
            <div className="space-y-3">
              <Button
                color="default"
                variant="bordered"
                className="w-full h-12"
                startContent={<i className="fab fa-discord text-indigo-400" />}
                onClick={() => {
                  window.location.href = '/api/auth/discord'
                }}
                disabled={loading}
              >
{t('auth.loginWithDiscord')}
              </Button>
              
              <Button
                color="danger"
                variant="bordered"
                className="w-full h-12"
                startContent={<i className="fab fa-google" />}
                disabled
              >
                Continuer avec Google (Bientôt disponible)
              </Button>
            </div>

            {/* Lien d'inscription */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
{t('auth.noAccountYet')}{' '}
                <Link
                  href="/register"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  {t('auth.registerButton')}
                </Link>
              </p>
            </div>
          </CardBody>
        </Card>

          {/* Informations supplémentaires */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-2 text-green-400"></i>
                Connexion sécurisée
              </span>
              <span className="flex items-center">
                <i className="fas fa-clock mr-2 text-blue-400"></i>
                Session de 7 jours
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'erreur */}
      <Modal isOpen={isErrorModalOpen} onOpenChange={onErrorModalOpenChange}>
        <ModalContent className="bg-gray-800 border-gray-700">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-white"></i>
                </div>
                <span className="text-white">{t('auth.loginError')}</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-300">
                  {errorMessage || t('auth.unexpectedError')}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t('common.close')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
