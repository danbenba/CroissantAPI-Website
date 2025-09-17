import type React from "react"
import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/hooks/use-auth"
import { LanguageProvider } from "@/contexts/LanguageContext"
import TopLoadingBar from "@/components/top-loading-bar"
import AdManager from "@/components/ads/ad-manager"
import "@fortawesome/fontawesome-free/css/all.min.css"

const lexend = Lexend({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-lexend',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Koalyx",
  description: "Plateforme de recommandation de logiciels avec système de support intégré",
  generator: "v0.app",
    icons: {
        icon: "/favicon.ico",
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="fr"
      className={`${lexend.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0000000000000000"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="font-sans antialiased min-h-screen bg-gradient-main text-gray-900">
        <TopLoadingBar />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              <AdManager />
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
