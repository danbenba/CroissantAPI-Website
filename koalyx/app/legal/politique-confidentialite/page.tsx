"use client"

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'

export default function PrivacyPolicyPage() {
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
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-user-shield text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {t('legal.privacyPolicy.title')}
                </h1>
                <p className="text-gray-400 mt-2">
{t('legal.privacyPolicy.subtitle')}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <Divider className="bg-white/10" />
          
          <CardBody className="p-8 space-y-8">
            {/* Introduction */}
            <section>
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.privacyPolicy.intro')}
                </p>
              </div>
            </section>

            {/* Collecte des données */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-database text-blue-400"></i>
                {t('legal.privacyPolicy.dataCollection')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6 space-y-4">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.privacyPolicy.dataCollectionText')}
                </p>
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-semibold mb-2">Types de données collectées :</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Informations d'inscription (nom d'utilisateur, email)</li>
                    <li>• Données de navigation (pages visitées, temps de session)</li>
                    <li>• Préférences utilisateur (langue, favoris)</li>
                    <li>• Métadonnées techniques (adresse IP, navigateur)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Utilisation des données */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-cogs text-green-400"></i>
                {t('legal.privacyPolicy.dataUse')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('legal.privacyPolicy.dataUseText')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="text-green-400 font-semibold mb-2">✅ Utilisations légitimes</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Personnalisation de l'expérience</li>
                      <li>• Amélioration des services</li>
                      <li>• Support technique</li>
                      <li>• Communications importantes</li>
                    </ul>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="text-red-400 font-semibold mb-2">❌ Nous ne faisons jamais</h4>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Vente de données à des tiers</li>
                      <li>• Spam publicitaire</li>
                      <li>• Partage non autorisé</li>
                      <li>• Utilisation abusive</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Protection des données */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-shield-alt text-purple-400"></i>
                {t('legal.privacyPolicy.dataProtection')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('legal.privacyPolicy.dataProtectionText')}
                </p>
                <div className="bg-main-overlay/10 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-semibold mb-2">🔒 Mesures de sécurité</h4>
                  <ul className="text-gray-300 space-y-1 text-sm">
                    <li>• Chiffrement des données sensibles</li>
                    <li>• Connexions sécurisées (HTTPS)</li>
                    <li>• Accès restreint aux données</li>
                    <li>• Sauvegardes régulières</li>
                    <li>• Surveillance continue</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-cookie-bite text-yellow-400"></i>
                {t('legal.privacyPolicy.cookies')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed mb-4">
                  {t('legal.privacyPolicy.cookiesText')}
                </p>
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">🍪 Types de cookies utilisés</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-green-400 font-medium">Essentiels :</span>
                      <span className="text-gray-300 ml-2">Authentification, préférences de langue</span>
                    </div>
                    <div>
                      <span className="text-blue-400 font-medium">Fonctionnels :</span>
                      <span className="text-gray-300 ml-2">Favoris, paramètres personnalisés</span>
                    </div>
                    <div>
                      <span className="text-purple-400 font-medium">Analytiques :</span>
                      <span className="text-gray-300 ml-2">Statistiques d'utilisation (anonymisées)</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Divulgation à des tiers */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-users text-red-400"></i>
                {t('legal.privacyPolicy.thirdParty')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.privacyPolicy.thirdPartyText')}
                </p>
              </div>
            </section>

            {/* Consentement */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-check-circle text-cyan-400"></i>
                {t('legal.privacyPolicy.consent')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.privacyPolicy.consentText')}
                </p>
              </div>
            </section>

            {/* Vos droits */}
            <section>
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg p-6">
                <h3 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
                  <i className="fas fa-user-check"></i>
                  Vos droits concernant vos données
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-eye text-blue-400"></i>
                      <span className="text-gray-300">Droit d'accès à vos données</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-edit text-green-400"></i>
                      <span className="text-gray-300">Droit de rectification</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-trash text-red-400"></i>
                      <span className="text-gray-300">Droit à l'effacement</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-download text-purple-400"></i>
                      <span className="text-gray-300">Droit à la portabilité</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-ban text-yellow-400"></i>
                      <span className="text-gray-300">Droit d'opposition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <i className="fas fa-pause text-orange-400"></i>
                      <span className="text-gray-300">Droit à la limitation</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-400 text-xs mt-4">
                  Pour exercer ces droits, contactez-nous via notre page de contact.
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
