"use client"

import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Divider } from '@heroui/divider'

export default function LegalNoticePage() {
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
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <i className="fas fa-gavel text-white text-2xl"></i>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {t('legal.legalNotice.title')}
                </h1>
                <p className="text-gray-400 mt-2">
{t('legal.legalNotice.intro')}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <Divider className="bg-white/10" />
          
          <CardBody className="p-8 space-y-8">
            {/* Informations sur le site */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-info-circle text-blue-400"></i>
                {t('legal.legalNotice.siteInfo')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400">{t('legal.legalNotice.siteName')} :</span>
                  <span className="text-white font-medium">Koalyx</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-gray-400">{t('legal.legalNotice.siteUrl')} :</span>
                  <span className="text-white font-medium">https://koalyx.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('legal.legalNotice.siteNature')} :</span>
                  <span className="text-white font-medium">{t('legal.legalNotice.siteNatureText')}</span>
                </div>
              </div>
            </section>

            {/* Éditeur du site */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-user-tie text-green-400"></i>
                {t('legal.legalNotice.publisher')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300">
                  {t('legal.legalNotice.publisherText')}
                </p>
              </div>
            </section>

            {/* Hébergement */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-server text-purple-400"></i>
                {t('legal.legalNotice.hosting')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300">
                  {t('legal.legalNotice.hostingText')}
                </p>
              </div>
            </section>

            {/* Responsabilité */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-shield-alt text-yellow-400"></i>
                {t('legal.legalNotice.responsibility')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.legalNotice.responsibilityText')}
                </p>
              </div>
            </section>

            {/* Propriété intellectuelle */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-copyright text-red-400"></i>
                {t('legal.legalNotice.intellectualProperty')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.legalNotice.intellectualPropertyText')}
                </p>
              </div>
            </section>

            {/* Données personnelles */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <i className="fas fa-user-shield text-cyan-400"></i>
                {t('legal.legalNotice.personalData')}
              </h2>
              <div className="bg-gray-900/50 rounded-lg p-6">
                <p className="text-gray-300 leading-relaxed">
                  {t('legal.legalNotice.personalDataText')}
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
