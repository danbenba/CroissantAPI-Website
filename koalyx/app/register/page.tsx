"use client"

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'
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
  useDisclosure,
  Avatar
} from "@heroui/react"

function RegisterPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const { isOpen: isErrorModalOpen, onOpen: onErrorModalOpen, onOpenChange: onErrorModalOpenChange } = useDisclosure()
  const { isOpen: isSuccessModalOpen, onOpen: onSuccessModalOpen, onOpenChange: onSuccessModalOpenChange } = useDisclosure()
  
  // Données Discord depuis l'URL (si redirection depuis Discord OAuth)
  const discordId = searchParams.get('discord_id')
  const discordUsername = searchParams.get('username')
  const discordEmail = searchParams.get('email')
  const discordAvatar = searchParams.get('avatar')
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isDiscordAccount, setIsDiscordAccount] = useState(false)

  // Pré-remplir les champs si données Discord disponibles
  useEffect(() => {
    if (discordId) {
      setIsDiscordAccount(true)
      setFormData(prev => ({
        ...prev,
        username: discordUsername || '',
        email: discordEmail || ''
      }))
    }
  }, [discordId, discordUsername, discordEmail])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
       // Vérifications côté client
       if (formData.password !== formData.confirmPassword) {
         throw new Error(t('auth.passwordMismatch'))
       }

       if (formData.password.length < 6) {
         throw new Error(t('auth.passwordTooShort'))
       }

       if (!formData.acceptTerms) {
         throw new Error(t('auth.mustAcceptTerms'))
       }

      // Appel API pour créer le compte
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password, // Toujours envoyer le mot de passe
          discordId: discordId || undefined,
          photoUrl: discordAvatar || undefined
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onSuccessModalOpen()
      } else {
         throw new Error(data.error || t('auth.unexpectedError'))
      }
    } catch (err) {
      console.error('❌ Erreur lors de l\'inscription:', err)
      setError(err instanceof Error ? err.message : t('auth.registerError'))
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

  const handleSuccessModalClose = () => {
    onSuccessModalOpenChange()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col"
         style={{}}>
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
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full mb-6 shadow-2xl">
              <i className="fas fa-user-plus text-white text-3xl"></i>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2" style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>Koalyx</h1>
             <p className="text-gray-400 text-lg">
               {isDiscordAccount ? t('auth.finalizeRegistration') : t('auth.registerSubtitle')}
             </p>
          </div>

          {/* Information Discord si applicable */}
          {isDiscordAccount && (
            <Card className="mb-6 bg-indigo-900/30 backdrop-blur-sm border-indigo-500/30 shadow-xl">
              <CardBody className="p-4">
                <div className="flex items-center space-x-3">
                                  <Avatar
                  src={discordAvatar || undefined}
                  className="w-12 h-12"
                  showFallback
                  fallback={<i className="fab fa-discord text-indigo-400 text-xl" />}
                />
                  <div>
                     <p className="text-white font-medium">{t('auth.discordAccountDetected')}</p>
                     <p className="text-indigo-300 text-sm">{t('auth.discordPrefilledInfo')}</p>
                  </div>
                  <Chip color="primary" size="sm" variant="shadow">
                    <i className="fab fa-discord mr-1"></i>
                    Discord
                  </Chip>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Formulaire d'inscription */}
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
                   placeholder={t('auth.chooseUsername')}
                  startContent={<i className="fas fa-user text-gray-400" />}
                  variant="bordered"
                  color="primary"
                  className="w-full"
                />
              </div>

              {/* Email */}
              <div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                   label={t('auth.email')}
                   placeholder={t('auth.enterEmail')}
                  startContent={<i className="fas fa-envelope text-gray-400" />}
                  variant="bordered"
                  color="primary"
                  className="w-full"
                />
              </div>

              {/* Mot de passe - toujours affiché */}
              <div>
                <Input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                   label={t('auth.password')}
                   placeholder={isDiscordAccount ? t('auth.passwordForDiscord') : t('auth.passwordSecure')}
                   startContent={<i className="fas fa-lock text-gray-400" />}
                   variant="bordered"
                   color="primary"
                   className="w-full"
                   description={isDiscordAccount ? t('auth.passwordDiscordHelp') : t('auth.passwordMinChars')}
                />
              </div>

              <div>
                <Input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                   label={t('auth.confirmPassword')}
                   placeholder={t('auth.confirmPassword')}
                  startContent={<i className="fas fa-lock text-gray-400" />}
                  variant="bordered"
                  color="primary"
                  className="w-full"
                />
              </div>

              {/* Conditions d'utilisation */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  color="primary"
                  size="sm"
                  className="mt-1"
                >
                   <span className="text-sm text-gray-300">
                     {t('auth.acceptTerms')}{' '}
                     <Link
                       href="/legal/conditions-utilisation"
                       className="text-blue-400 hover:text-blue-300 transition-colors"
                     >
                       {t('footer.termsOfService')}
                     </Link>
                     {' '}et la{' '}
                     <Link
                       href="/legal/politique-confidentialite"
                       className="text-blue-400 hover:text-blue-300 transition-colors"
                     >
                       {t('footer.privacyPolicy')}
                     </Link>
                   </span>
                </Checkbox>
              </div>

              {/* Bouton d'inscription */}
              <Button
                type="submit"
                color="primary"
                variant="solid"
                size="lg"
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600"
                startContent={loading ? <Spinner size="sm" color="white" /> : <i className="fas fa-user-plus" />}
                disabled={loading}
              >
                 {loading ? t('auth.creatingAccount') : t('auth.createAccountButton')}
              </Button>
            </form>

            {/* Séparateur et options sociales (seulement si pas un compte Discord) */}
            {!isDiscordAccount && (
              <>
                <div className="my-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <Chip variant="flat" color="default" size="sm" className="bg-gray-800 border-gray-600">
                        <span className="text-gray-400">{t('auth.or')}</span>
                      </Chip>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    color="default"
                    variant="bordered"
                    className="w-full h-12"
                    startContent={<i className="fab fa-discord text-indigo-400" />}
                    onClick={() => window.location.href = '/api/auth/discord'}
                    disabled={loading}
                  >
{t('auth.registerWithDiscord')}
                  </Button>
                  
                  <Button
                    color="danger"
                    variant="bordered"
                    className="w-full h-12"
                    startContent={<i className="fab fa-google" />}
                    disabled
                  >
{t('auth.continueWithGoogle')}
                  </Button>
                </div>
              </>
            )}

            {/* Lien de connexion */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
{t('auth.alreadyHaveAccount')}{' '}
                 <Link
                   href="/login"
                   className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                 >
                   {t('auth.loginButton')}
                 </Link>
              </p>
            </div>
            </CardBody>
          </Card>

          {/* Informations supplémentaires */}
          <div className="text-center mt-6">
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <i className="fas fa-shield-alt mr-2 text-green-400"></i>
{t('auth.secureRegistration')}
               </span>
               <span className="flex items-center">
                 <i className="fas fa-users mr-2 text-blue-400"></i>
                 {t('auth.activeCommuntiy')}
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
                 <span className="text-white">{t('auth.registerError')}</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-300">
                  {error || t('auth.unexpectedError')}
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

      {/* Modal de succès */}
      <Modal isOpen={isSuccessModalOpen} onOpenChange={handleSuccessModalClose}>
        <ModalContent className="bg-gray-800 border-gray-700">
          {(onClose) => (
            <>
              <ModalHeader className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-white"></i>
                </div>
                 <span className="text-white">{t('auth.accountCreatedSuccess')}</span>
              </ModalHeader>
              <ModalBody>
                <p className="text-gray-300">
{t('auth.accountCreatedDesc')}
                </p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={handleSuccessModalClose}>
{t('auth.goToLogin')}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      
      </div>
      
      <Footer />
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}
