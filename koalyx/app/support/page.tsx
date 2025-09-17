"use client"

import Navigation from '@/components/navigation'
import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la page */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <i className="fas fa-headset text-blue-600 text-4xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support & Aide</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Notre équipe est là pour vous aider avec tous vos besoins
          </p>
        </div>

        {/* Méthodes de contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Email */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-envelope text-blue-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Email</h3>
            <p className="text-gray-600 mb-4">
              Envoyez-nous un message et nous vous répondrons dans les plus brefs délais
            </p>
            <a
              href="mailto:support@Koalyx.com"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              Envoyer un email
            </a>
          </div>

          {/* Chat */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-comments text-green-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Chat en direct</h3>
            <p className="text-gray-600 mb-4">
              Discutez en temps réel avec notre équipe de support
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <i className="fas fa-comment-dots mr-2"></i>
              Démarrer le chat
            </button>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-question-circle text-purple-600 text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">FAQ</h3>
            <p className="text-gray-600 mb-4">
              Consultez nos questions fréquemment posées pour des réponses rapides
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <i className="fas fa-search mr-2"></i>
              Voir la FAQ
            </button>
          </div>
        </div>

        {/* Horaires et informations */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Informations pratiques</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires de support</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <i className="fas fa-clock text-blue-600 mr-3"></i>
                  Lundi - Vendredi : 9h00 - 18h00
                </li>
                <li className="flex items-center">
                  <i className="fas fa-clock text-blue-600 mr-3"></i>
                  Samedi : 10h00 - 16h00
                </li>
                <li className="flex items-center">
                  <i className="fas fa-clock text-blue-600 mr-3"></i>
                  Dimanche : Fermé
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Temps de réponse</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <i className="fas fa-envelope text-green-600 mr-3"></i>
                  Email : 2-4 heures
                </li>
                <li className="flex items-center">
                  <i className="fas fa-comments text-green-600 mr-3"></i>
                  Chat : Immédiat
                </li>
                <li className="flex items-center">
                  <i className="fas fa-star text-yellow-600 mr-3"></i>
                  VIP : Prioritaire
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Besoin d'aide supplémentaire ?</h3>
            <p className="text-lg mb-6 opacity-90">
              N'hésitez pas à nous contacter, nous sommes là pour vous aider
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/vip"
                className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                <i className="fas fa-crown mr-2"></i>
                Devenir VIP
              </Link>
              <Link
                href="/explore"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
              >
                <i className="fas fa-gamepad mr-2"></i>
                Voir les jeux
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
