"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Card,
  CardBody,
  Button,
  Chip,
  Divider
} from "@heroui/react";

export default function Success() {
  const router = useRouter();
  const [redirected, setRedirected] = useState(false);

  // Ajouter les styles CSS pour les animations personnalisées (identiques à HomePage)
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes progressWave {
        0% { 
          transform: scaleX(0);
        }
        100% { 
          transform: scaleX(1);
        }
      }
  
      @keyframes subtleGlow {
        0%, 100% { 
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
        50% { 
          box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.1);
        }
      }
  
      @keyframes fadeInUp {
        0% { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }

      @keyframes fadeIn {
        0% { 
          opacity: 0; 
        }
        100% { 
          opacity: 1; 
        }
      }

      .animate-fade-in {
        animation: fadeIn 800ms ease-in-out forwards;
      }
  
      @keyframes slideUpDelay {
        0% { 
          opacity: 0; 
          transform: translateY(20px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
  
      .active-game-glow {
        border: 1px solid rgba(255, 255, 255, 0.2);
        animation: subtleGlow 5s ease-in-out infinite;
      }
  
      .progress-wave {
        animation: progressWave 10s linear infinite;
        transform: scaleX(0);
        transform-origin: left;
      }
  
      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out forwards;
      }
  
      .animate-slide-up-delay-1 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.1s forwards;
      }
  
      .animate-slide-up-delay-2 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.2s forwards;
      }
  
      .animate-slide-up-delay-3 {
        opacity: 0;
        animation: slideUpDelay 0.5s ease-out 0.3s forwards;
      }
    `
    document.head.appendChild(style)

    setRedirected(true);
  
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [router, redirected]);

  return (
    <main className="bg-background text-foreground font-sans relative min-h-screen">
      {/* Background violet en arrière-plan, identique à la HomePage */}
      <div
        className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top"
        style={{ inset: 0 as unknown as number }}
      />

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
        {/* Header Section avec animation fade-in-up */}
        <div className="flex flex-col gap-8 animate-fade-in-up">
          {/* Section Hero avec icône de succès */}
          <section className="text-center py-8 animate-slide-up-delay-1">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-medium active-game-glow">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="white" viewBox="0 0 256 256">
                  <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 drop-shadow-2xl">
              Merci pour votre achat !
            </h1>
            <Chip 
              size="lg"
              variant="shadow" 
              startContent={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
                </svg>
              }
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
            >
              Transaction Réussie
            </Chip>
          </section>

          {/* Section principale avec grid layout */}
          <div className="flex gap-5 max-lg:flex-col animate-slide-up-delay-2">
            {/* Carte principale des informations */}
            <div className="flex-1">
              <Card className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large">
                <CardBody className="relative flex w-full flex-auto flex-col h-auto p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,16,16,0,0,1-16-16V128a8,8,0,0,1,0-16,16,16,0,0,1,16,16v40A8,8,0,0,1,144,176ZM112,84a12,12,0,1,1,12,12A12,12,0,0,1,112,84Z"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground mb-4">Détails de votre transaction</h2>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-default-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-yellow-500">
                            <path d="M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v88c0,25.08,37.83,44,88,44s88-18.92,88-44V132.43c2.21-1.94,4-4.15,4-6.43v-30C188,93.72,186.21,91.51,184,89.57ZM232,104H216v-8a8,8,0,0,0-16,0v8H184a8,8,0,0,0,0,16h16v8a8,8,0,0,0,16,0v-8h16a8,8,0,0,0,0-16Z"></path>
                          </svg>
                          <p>Vos crédits ont été ajoutés à votre compte avec succès.</p>
                        </div>
                        <div className="flex items-center gap-3 text-default-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                            <path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path>
                            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                          </svg>
                          <p>Votre transaction a été traitée de manière sécurisée.</p>
                        </div>
                        <div className="flex items-center gap-3 text-default-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
                            <path d="M140,128a12,12,0,1,1-12-12A12,12,0,0,1,140,128ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                          </svg>
                          <p>Si vous avez des questions, notre équipe de support est là pour vous aider.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Sidebar avec conseils */}
            <div className="max-w-[256px] flex-col justify-between gap-5 max-lg:hidden lg:flex">
              <Card className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large">
                <CardBody className="p-6">
                  <div className="flex items-center gap-2.5 text-lg font-semibold mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M176,232a8,8,0,0,1-8,8H88a8,8,0,0,1,0-16h80A8,8,0,0,1,176,232Zm40-128a87.55,87.55,0,0,1-33.64,69.21A16.24,16.24,0,0,0,176,186v6a16,16,0,0,1-16,16H96a16,16,0,0,1-16-16v-6a16.24,16.24,0,0,0-6.36-12.79A87.55,87.55,0,0,1,40,104.49C39.74,56.83,78.26,17.14,125.88,16A88,88,0,0,1,216,104Z"></path>
                    </svg>
                    Conseils
                  </div>
                  <div className="space-y-3 text-sm text-default-600">
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-purple-500 mt-0.5 flex-shrink-0">
                        <path d="M183.89,153.34a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68ZM216,144a88,88,0,0,1-176,0c0-27.92,11-56.47,32.66-84.85a8,8,0,0,1,11.93-.89l24.12,23.41,22-60.41a8,8,0,0,1,12.63-3.41C165.21,36,216,84.55,216,144Zm-16,0c0-46.09-35.79-85.92-58.21-106.33L119.52,98.74a8,8,0,0,1-13.09,3L80.06,76.16C64.09,99.21,56,122,56,144a72,72,0,0,0,144,0Z"></path>
                      </svg>
                      <p>Explorez les nouvelles applications ajoutées chaque semaine</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500 mt-0.5 flex-shrink-0">
                        <path d="M117.25,157.92a60,60,0,1,0-66.50,0A95.83,95.83,0,0,0,3.53,195.63a8,8,0,1,0,13.4,8.74,80,80,0,0,1,134.14,0,8,8,0,0,0,13.4-8.74A95.83,95.83,0,0,0,117.25,157.92ZM40,108a44,44,0,1,1,44,44A44.05,44.05,0,0,1,40,108Zm210.27,98.63a8,8,0,0,1-11.07,2.22A79.71,79.71,0,0,0,168,184a8,8,0,0,1,0-16,44,44,0,1,0-16.34-84.87,8,8,0,1,1-5.94-14.85,60,60,0,0,1,55.53,105.64,95.83,95.83,0,0,1,47.22,37.71A8,8,0,0,1,250.27,206.63Z"></path>
                      </svg>
                      <p>Rejoignez notre communauté Discord</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>

          {/* Section Actions avec layout identique aux autres sections */}
          <section className="flex flex-col gap-4 animate-slide-up-delay-3">
            <header className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
                Que souhaitez-vous faire maintenant ?
              </div>
            </header>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Retour à l'accueil */}
              <Card 
                as={Link}
                href="/"
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background motion-reduce:transition-none hover:scale-[0.98]"
                isPressable
              >
                <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                  <div className="absolute top-4 right-4 z-20">
                    <Chip 
                      size="sm" 
                      variant="shadow" 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold"
                    >
                      Accueil
                    </Chip>
                  </div>
                  <div 
                    className="z-10 h-[161px] bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="text-blue-500">
                      <path d="M224,115.55V208a16,16,0,0,1-16,16H168a16,16,0,0,1-16-16V168a8,8,0,0,0-8-8H112a8,8,0,0,0-8,8v40a16,16,0,0,1-16,16H48a16,16,0,0,1-16-16V115.55a16,16,0,0,1,5.17-11.78l80-75.48.11-.11a16,16,0,0,1,21.53,0l80,75.48A16,16,0,0,1,224,115.55Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 px-5 py-4">
                    <h2 className="z-10 text-xl font-semibold">Retour à l'accueil</h2>
                    <p className="text-sm text-default-600">Explorez notre catalogue d'applications</p>
                  </div>
                </CardBody>
              </Card>

              {/* Dashboard */}
              <Card 
                as={Link}
                href="/dashboard"
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background motion-reduce:transition-none hover:scale-[0.98]"
                isPressable
              >
                <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                  <div className="absolute top-4 right-4 z-20">
                    <Chip 
                      size="sm" 
                      variant="shadow" 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold"
                    >
                      Dashboard
                    </Chip>
                  </div>
                  <div 
                    className="z-10 h-[161px] bg-gradient-to-br from-green-500/20 to-emerald-600/20 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                      <path d="M104,40H56A16,16,0,0,0,40,56v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,104,40Zm0,112H56a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V168A16,16,0,0,0,104,152ZM200,40H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V56A16,16,0,0,0,200,40Zm0,112H152a16,16,0,0,0-16,16v48a16,16,0,0,0,16,16h48a16,16,0,0,0,16-16V168A16,16,0,0,0,200,152Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 px-5 py-4">
                    <h2 className="z-10 text-xl font-semibold">Dashboard</h2>
                    <p className="text-sm text-default-600">Gérez votre compte et vos applications</p>
                  </div>
                </CardBody>
              </Card>

              {/* Support */}
              <Card 
                as={Link}
                href="/contact"
                className="flex flex-col relative overflow-hidden h-auto text-foreground box-border bg-content1 outline-solid outline-transparent shadow-medium rounded-large cursor-pointer transition-transform-background motion-reduce:transition-none hover:scale-[0.98]"
                isPressable
              >
                <CardBody className="relative flex w-full flex-auto flex-col h-auto p-0">
                  <div className="absolute top-4 right-4 z-20">
                    <Chip 
                      size="sm" 
                      variant="shadow" 
                      className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold"
                    >
                      Support
                    </Chip>
                  </div>
                  <div 
                    className="z-10 h-[161px] bg-gradient-to-br from-orange-500/20 to-red-600/20 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256" className="text-orange-500">
                      <path d="M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128ZM128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 px-5 py-4">
                    <h2 className="z-10 text-xl font-semibold">Support</h2>
                    <p className="text-sm text-default-600">Contactez notre équipe d'aide</p>
                  </div>
                </CardBody>
              </Card>
            </div>
          </section>

          {/* Footer avec informations additionnelles */}
          <div className="text-center py-8 border-t border-divider">
            <p className="text-default-500 text-sm flex items-center justify-center gap-4 flex-wrap">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path>
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path>
                </svg>
                Transaction sécurisée
              </span>
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128ZM128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                </svg>
                Support 24/7
              </span>
              <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M225.86,102.82c-3.77-3.94-7.67-8-9.14-11.57-1.36-3.27-1.44-8.69-1.52-13.94-.15-9.76-.31-20.82-8-28.51s-18.75-7.85-28.51-8c-5.25-.08-10.67-.16-13.94-1.52-3.56-1.47-7.63-5.37-11.57-9.14C146.28,23.51,138.44,16,128,16s-18.27,7.51-25.18,14.14c-3.94,3.77-8,7.67-11.57,9.14C88,40.64,82.56,40.72,77.31,40.8c-9.76.15-20.82.31-28.51,8S41,67.55,40.8,77.31c-.08,5.25-.16,10.67-1.52,13.94-1.47,3.56-5.37,7.63-9.14,11.57C23.51,109.72,16,117.56,16,128s7.51,18.27,14.14,25.18c3.77,3.94,7.67,8,9.14,11.57,1.36,3.27,1.44,8.69,1.52,13.94.15,9.76.31,20.82,8,28.51s18.75,7.85,28.51,8c5.25.08,10.67.16,13.94,1.52,3.56,1.47,7.63,5.37,11.57,9.14C109.72,232.49,117.56,240,128,240s18.27-7.51,25.18-14.14c3.94-3.77,8-7.67,11.57-9.14,3.27-1.36,8.69-1.44,13.94-1.52,9.76-.15,20.82-.31,28.51-8s7.85-18.75,8-28.51c.08-5.25.16-10.67,1.52-13.94,1.47-3.56,5.37-7.63,9.14-11.57C232.49,146.28,240,138.44,240,128S232.49,109.72,225.86,102.82Zm-11.55,39.29c-4.79,5-9.75,10.17-12.38,16.52-2.52,6.1-2.63,13.07-2.73,19.82-.1,7-.21,14.33-3.32,17.43s-10.39,3.22-17.43,3.32c-6.75.1-13.72.21-19.82,2.73-6.35,2.63-11.52,7.59-16.52,12.38S132,224,128,224s-9.15-4.92-14.11-9.69-10.17-9.75-16.52-12.38c-6.1-2.52-13.07-2.63-19.82-2.73-7-.1-14.33-.21-17.43-3.32s-3.22-10.39-3.32-17.43c-.1-6.75-.21-13.72-2.73-19.82-2.63-6.35-7.59-11.52-12.38-16.52S32,132,32,128s4.92-9.15,9.69-14.11,9.75-10.17,12.38-16.52c2.52-6.1,2.63-13.07,2.73-19.82.1-7,.21-14.33,3.32-17.43S70.51,56.9,77.55,56.8c6.75-.1,13.72-.21,19.82-2.73,6.35-2.63,11.52-7.59,16.52-12.38S124,32,128,32s9.15,4.92,14.11,9.69,10.17,9.75,16.52,12.38c6.1,2.52,13.07,2.63,19.82,2.73,7,.1,14.33.21,17.43,3.32s3.22,10.39,3.32,17.43c.1,6.75.21,13.72,2.73,19.82,2.63,6.35,7.59,11.52,12.38,16.52S224,124,224,128S219.08,137.15,214.31,142.11ZM173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34Z"></path>
                </svg>
                Satisfaction garantie
              </span>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
