"use client"

import { Card, CardBody, CardHeader, Chip, Divider, Button, Link } from '@heroui/react'
import { Github, Globe, Mail, Heart, Code, Users, Shield, Zap } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AboutPage() {
  const { t } = useLanguage()
  const sponsors = [
    {
      name: "PotionGang",
      url: "https://potiongang.fr",
      banner: "https://i.ibb.co/GfcyshJ6/Design-sans-titre-1.png",
      description: "Les géants du jeux"
    },
    {
      name: "Croissant API", 
      url: "https://croissant-api.fr",
      banner: "https://i.ibb.co/1DNtKSb/CROISSANT-1.png",
      description: "Creative and Reusable Opensource Inventory System, Scalable, APIful, and Network Technology"
    },
    {
      name: "0xAcademy",
      url: "https://0xacademy.dev", 
      banner: "/storage/sponsors/discord-banner.png",
      description: "Plateforme de communication gaming"
    }
  ]

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: t('about.features.performance'),
      description: t('about.features.performanceDesc')
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('about.features.security'), 
      description: t('about.features.securityDesc')
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: t('about.features.community'),
      description: t('about.features.communityDesc')
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: t('about.features.technology'),
      description: t('about.features.technologyDesc')
    }
  ]

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative flex flex-col">
      <Navigation />

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">

      {/* voile violet en arrière-plan, identique à la page d'accueil */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      {/* Hero Section */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Titre principal */}
          <h1 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight text-white" 
              style={{textShadow: '2px 2px 20px rgba(0,0,0,0.5)'}}>
{t('about.title')}
          </h1>
          
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-12" 
              style={{textShadow: '1px 1px 10px rgba(0,0,0,0.5)'}}>
            d'<span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Koalyx</span>
          </h2>
          
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-8 leading-relaxed"
             style={{textShadow: '1px 1px 5px rgba(0,0,0,0.5)'}}>
{t('about.subtitle')}
          </p>
          
          <div className="flex justify-center">
            <Chip 
              color="warning" 
              variant="shadow" 
              size="lg"
              startContent={<Heart className="w-4 h-4" />}
              className="text-lg px-6 py-2"
            >
{t('about.version')}
            </Chip>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 bg-background">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          {/* Description du site */}
          <Card className="mb-12 bg-default-50/80 backdrop-blur-sm border-default-200">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{t('about.mission')}</h2>
                  <p className="text-default-600">{t('about.missionSubtitle')}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <p className="text-lg leading-relaxed mb-6">
<strong>Koalyx</strong> {t('about.missionDescription1')}
              </p>
              <p className="text-lg leading-relaxed mb-6">
{t('about.downloadCount')} <strong>10 000+ {t('about.missionDescription2')}</strong>
              </p>
            </CardBody>
          </Card>

          {/* Fonctionnalités */}
          <div className="mb-12">
            <h3 className="text-3xl font-bold text-center mb-8">{t('about.whyChoose')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-default-50/80 backdrop-blur-sm border-default-200 hover:bg-default-100/80 transition-all duration-300">
                  <CardBody className="text-center p-6">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white">
                      {feature.icon}
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{feature.title}</h4>
                    <p className="text-default-600 text-sm">{feature.description}</p>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          {/* Informations techniques */}
          <Card className="mb-12 bg-default-50/80 backdrop-blur-sm border-default-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('about.techInfo')}</h3>
                  <p className="text-default-600">{t('about.techInfoSubtitle')}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">{t('about.frontend')}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="primary" variant="flat" size="sm">Next.js 14</Chip>
                    <Chip color="primary" variant="flat" size="sm">React 18</Chip>
                    <Chip color="primary" variant="flat" size="sm">TypeScript</Chip>
                    <Chip color="primary" variant="flat" size="sm">Tailwind CSS</Chip>
                    <Chip color="primary" variant="flat" size="sm">HeroUI</Chip>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">{t('about.backend')}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="success" variant="flat" size="sm">Node.js</Chip>
                    <Chip color="success" variant="flat" size="sm">MySQL 8</Chip>
                    <Chip color="success" variant="flat" size="sm">JWT Auth</Chip>
                    <Chip color="success" variant="flat" size="sm">bcrypt</Chip>
                    <Chip color="success" variant="flat" size="sm">API REST</Chip>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">{t('about.security')}</h4>
                  <div className="flex flex-wrap gap-2">
                    <Chip color="warning" variant="flat" size="sm">AES-256 Encryption</Chip>
                    <Chip color="warning" variant="flat" size="sm">Rate Limiting</Chip>
                    <Chip color="warning" variant="flat" size="sm">Input Validation</Chip>
                    <Chip color="warning" variant="flat" size="sm">CSRF Protection</Chip>
                    <Chip color="warning" variant="flat" size="sm">SQL Injection Prevention</Chip>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Copyright et crédits */}
          <Card className="mb-12 bg-default-50/80 backdrop-blur-sm border-default-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{t('about.credits')}</h3>
                  <p className="text-default-600">{t('about.creditsSubtitle')}</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <span>{t('about.contact')}: <strong>team@Koalyx.xyz</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Github className="w-5 h-5 text-default-600" />
                  <span>{t('about.developedBy')} <strong>{t('about.team')}</strong></span>
                </div>
                <Divider className="my-4" />
                <p className="text-sm text-default-600">
© 2024 Koalyx. {t('about.copyright1')}
                </p>
                <p className="text-sm text-default-600">
Koalyx™ {t('about.copyright2')}
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Section Sponsors avec bannières PNG */}
          <Card className="bg-default-50/80 backdrop-blur-sm border-default-200">
            <CardHeader>
              <div className="text-center">
                <h3 className="text-3xl font-bold mb-2">{t('about.sponsors')}</h3>
                <p className="text-default-600">
                  {t('about.sponsorsSubtitle')}
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sponsors.map((sponsor, index) => (
                  <div key={index} className="group">
                    <Link
                      href={sponsor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      <img
                        src={sponsor.banner}
                        alt={`${sponsor.name} - ${sponsor.description}`}
                        className="w-full h-24 object-contain bg-transparent border border-default-200/50 rounded-lg p-2"
                        onError={(e) => {
                          // Fallback vers une bannière placeholder
                          (e.target as HTMLImageElement).src = `/storage/ads/placeholder-banner.png`
                        }}
                      />
                    </Link>
                    <p className="text-xs text-default-600 text-center mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {sponsor.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-sm text-default-600">
{t('about.partnership')} <Link href="mailto:team@Koalyx.xyz" className="text-primary hover:underline">{t('about.contactUs')}</Link>
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-16">
            <Card className="bg-blue-600 text-white border-0">
              <CardBody className="p-8">
                <h3 className="text-2xl font-bold mb-4">{t('about.joinCommunity')}</h3>
                <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                  {t('about.joinCommunityDesc')}
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button 
                    as={Link}
                    href="/register"
                    color="warning" 
                    size="lg" 
                    className="font-semibold"
                    startContent={<Users className="w-5 h-5" />}
                  >
{t('about.signUpFree')}
                  </Button>
                  <Button 
                    as={Link}
                    href="/explore"
                    variant="bordered" 
                    size="lg" 
                    className="font-semibold text-white border-white hover:bg-white hover:text-blue-600"
                    startContent={<Globe className="w-5 h-5" />}
                  >
{t('about.exploreGames')}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
      
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  )
}
