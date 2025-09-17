"use client"

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'

export default function TermsOfServicePage() {
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
      <main className="relative z-10 flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl">
          <CardHeader className="p-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-700 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-file-contract text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {t('legal.termsOfService.title')}
                </h1>
                <p className="text-gray-400 mt-2">
{t('legal.termsOfService.intro')}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <Divider className="bg-white/10" />
          
          <CardBody className="p-8 space-y-8">
            {/* Acceptation des conditions */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-handshake text-blue-400"></i>
                {t('legal.termsOfService.acceptance')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.termsOfService.acceptanceText')}
                </p>
              </div>
            </section>

            {/* Utilisation du site */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-mouse-pointer text-green-400"></i>
                {t('legal.termsOfService.useOfSite')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.termsOfService.useOfSiteText')}
                </p>
              </div>
            </section>

            {/* Contenu utilisateur */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-user-edit text-purple-400"></i>
                {t('legal.termsOfService.userContent')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.termsOfService.userContentText')}
                </p>
              </div>
            </section>

            {/* Activités interdites */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-ban text-red-400"></i>
                {t('legal.termsOfService.prohibited')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.termsOfService.prohibitedText')}
                </p>
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h4 className="text-red-400 font-semibold mb-2">⚠️ Avertissement</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Utilisation à des fins illégales</li>
                    <li>• Harcèlement ou menaces envers d'autres utilisateurs</li>
                    <li>• Spam ou contenu publicitaire non autorisé</li>
                    <li>• Violation des droits d'auteur</li>
                    <li>• Tentative de contournement des systèmes de sécurité</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Résiliation */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-door-open text-yellow-400"></i>
                {t('legal.termsOfService.termination')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.termsOfService.terminationText')}
                </p>
              </div>
            </section>

            {/* Avis de modification */}
            <section>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  Modification des conditions
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nous nous réservons le droit de modifier ces conditions d'utilisation à tout moment. 
                  Les modifications prendront effet immédiatement après leur publication sur le site. 
                  Il est de votre responsabilité de consulter régulièrement ces conditions.
                </p>
              </div>
            </section>
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
