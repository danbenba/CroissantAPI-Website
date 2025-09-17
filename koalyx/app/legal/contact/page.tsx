"use client"

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'
import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'

export default function ContactPage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-main-overlay"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Contenu principal */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Informations de contact */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardHeader className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg">
                    <i className="fas fa-envelope text-white text-2xl"></i>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white">
                      {t('legal.contact.title')}
                    </h1>
                    <p className="text-gray-400 mt-2">
                      {t('legal.contact.intro')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <Divider className="bg-white/10" />
              
              <CardBody className="p-8 space-y-6">
                {/* Support technique */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                  <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-headset"></i>
                    {t('legal.contact.support')}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {t('legal.contact.supportText')}
                  </p>
                  <Button
                    color="success"
                    variant="shadow"
                    startContent={<i className="fas fa-ticket-alt"></i>}
                    className="bg-gradient-to-r from-green-500 to-emerald-600"
                    onClick={() => {
                      // Ouvrir le système de support intégré
                      const event = new CustomEvent('openSupportPopup')
                      window.dispatchEvent(event)
                    }}
                  >
                    Ouvrir un ticket de support
                  </Button>
                </div>

                {/* Discord */}
                <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-lg p-6">
                  <h3 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                    <i className="fab fa-discord"></i>
                    {t('legal.contact.discord')}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Rejoignez notre communauté Discord pour obtenir de l'aide rapidement et échanger avec d'autres utilisateurs.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button
                      color="secondary"
                      variant="shadow"
                      startContent={<i className="fab fa-discord"></i>}
                      className="bg-gradient-to-r from-indigo-500 to-purple-600"
                      onClick={() => window.open('https://discord.gg/votre-serveur', '_blank')}
                    >
                      Rejoindre Discord
                    </Button>
                    <Chip color="success" variant="dot" size="sm">
                      En ligne
                    </Chip>
                  </div>
                </div>

                {/* Email général */}
                <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-envelope"></i>
                    {t('legal.contact.general')}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {t('legal.contact.generalText')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-900/50 px-3 py-2 rounded text-blue-400 font-mono text-sm">
                      contact@koalyx.com
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => navigator.clipboard.writeText('contact@koalyx.com')}
                      className="text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-copy"></i>
                    </Button>
                  </div>
                </div>

                {/* Partenariats */}
                <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-6">
                  <h3 className="text-yellow-400 font-semibold mb-3 flex items-center gap-2">
                    <i className="fas fa-handshake"></i>
                    {t('legal.contact.business')}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {t('legal.contact.businessText')}
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-900/50 px-3 py-2 rounded text-yellow-400 font-mono text-sm">
                      business@koalyx.com
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onClick={() => navigator.clipboard.writeText('business@koalyx.com')}
                      className="text-gray-400 hover:text-white"
                    >
                      <i className="fas fa-copy"></i>
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Informations complémentaires */}
          <div className="space-y-6">
            {/* Temps de réponse */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardHeader className="p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-clock text-orange-400"></i>
                  {t('legal.contact.responseTime')}
                </h2>
              </CardHeader>
              <CardBody className="p-6 pt-0">
                <p className="text-gray-300 mb-4">
                  {t('legal.contact.responseTimeText')}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-400">Support technique</span>
                    <Chip color="success" size="sm" variant="flat">
                      &lt; 24h
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-400">Questions générales</span>
                    <Chip color="primary" size="sm" variant="flat">
                      24-48h
                    </Chip>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
                    <span className="text-gray-400">Partenariats</span>
                    <Chip color="warning" size="sm" variant="flat">
                      2-5 jours
                    </Chip>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* FAQ rapide */}
            <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
              <CardHeader className="p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-question-circle text-purple-400"></i>
                  Questions fréquentes
                </h2>
              </CardHeader>
              <CardBody className="p-6 pt-0 space-y-4">
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Comment télécharger un jeu ?</h4>
                  <p className="text-gray-400 text-sm">
                    Connectez-vous à votre compte, trouvez le jeu souhaité et cliquez sur "Télécharger". 
                    Certains contenus nécessitent un abonnement Plus ou Ultra.
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Problème de téléchargement ?</h4>
                  <p className="text-gray-400 text-sm">
                    Vérifiez votre connexion internet et votre niveau d'abonnement. 
                    Si le problème persiste, ouvrez un ticket de support.
                  </p>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Comment signaler un problème ?</h4>
                  <p className="text-gray-400 text-sm">
                    Utilisez le système de tickets intégré au site ou contactez-nous via Discord 
                    pour une réponse plus rapide.
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Réseaux sociaux */}
            <Card className="bg-gradient-to-br from-purple-600/20 to-pink-800/20 border border-purple-500/30 backdrop-blur-sm shadow-2xl">
              <CardHeader className="p-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <i className="fas fa-share-alt text-pink-400"></i>
                  Suivez-nous
                </h2>
              </CardHeader>
              <CardBody className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="light"
                    startContent={<i className="fab fa-discord text-indigo-400"></i>}
                    className="justify-start text-white hover:bg-indigo-500/20"
                    onClick={() => window.open('https://discord.gg/votre-serveur', '_blank')}
                  >
                    Discord
                  </Button>
                  <Button
                    variant="light"
                    startContent={<i className="fab fa-twitter text-blue-400"></i>}
                    className="justify-start text-white hover:bg-blue-500/20"
                    onClick={() => window.open('https://twitter.com/koalyx', '_blank')}
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="light"
                    startContent={<i className="fab fa-youtube text-red-400"></i>}
                    className="justify-start text-white hover:bg-red-500/20"
                    onClick={() => window.open('https://youtube.com/@koalyx', '_blank')}
                  >
                    YouTube
                  </Button>
                  <Button
                    variant="light"
                    startContent={<i className="fab fa-github text-gray-400"></i>}
                    className="justify-start text-white hover:bg-gray-500/20"
                    onClick={() => window.open('https://github.com/koalyx', '_blank')}
                  >
                    GitHub
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
