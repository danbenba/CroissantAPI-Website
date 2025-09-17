"use client"

import Link from 'next/link'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'

export default function NotFound() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      <Navigation />

      {/* voile violet en arrière-plan */}
      <div
        className="absolute h-screen w-full opacity-20 max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top bg-purple-500"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Contenu principal */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <Card className="bg-gray-800/50 backdrop-blur-lg border border-white/10 shadow-2xl max-w-2xl w-full">
          <CardBody className="text-center p-12">
            {/* Icône 404 */}
            <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <span className="text-6xl font-bold text-white">404</span>
            </div>

            {/* Titre */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {t('errors.pageNotFound')}
            </h1>

            {/* Description */}
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              {t('errors.pageNotFoundDesc')}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                as={Link}
                href="/"
                color="primary"
                variant="shadow"
                size="lg"
                startContent={<i className="fas fa-home"></i>}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {t('errors.backToHome')}
              </Button>

              <Button
                as={Link}
                href="/explore"
                color="default"
                variant="bordered"
                size="lg"
                startContent={<i className="fas fa-gamepad"></i>}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {t('nav.games')}
              </Button>
            </div>

            {/* Suggestions */}
            <div className="mt-12 p-6 bg-gray-900/50 rounded-lg border border-white/10">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <i className="fas fa-lightbulb text-yellow-400"></i>
                Suggestions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Link
                  href={"/explore" as any}
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-gamepad text-blue-400"></i>
                  {t('nav.games')}
                </Link>
                <Link
                  href="/articles"
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-newspaper text-green-400"></i>
                  {t('nav.articles')}
                </Link>
                <Link
                  href="/legal/contact"
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-envelope text-purple-400"></i>
                  {t('footer.contact')}
                </Link>
                <Link
                  href="/about"
                  className="flex items-center gap-2 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <i className="fas fa-info-circle text-orange-400"></i>
                  {t('nav.about')}
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </main>

      <Footer />
    </div>
  )
}