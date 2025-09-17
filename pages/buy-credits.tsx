"use client"

import React from "react";
import { Card, CardBody, Button, Divider } from "@heroui/react";
import CachedImage from "../components/utils/CachedImage";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

interface Tier {
  credits: string;
  price: string;
  id: string;
  popular?: boolean;
}

const BuyCredits: React.FC = () => {
  const { t } = useTranslation("common");

  const tiers: Tier[] = [
    { credits: "200", price: "0.99€", id: "tier1" },
    { credits: "400", price: "1.98€", id: "tier2", popular: true },
    { credits: "1000", price: "4.95€", id: "tier3" },
    { credits: "2000", price: "9.90€", id: "tier4" },
  ];

  const handlePurchase = async (tier: Tier) => {
    try {
      const response = await fetch(`/api/stripe/checkout?tier=${tier.id}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative">
      {/* Background Koalyx */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-indigo-900/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-900/5 to-transparent"></div>
      </div>

      <div className="z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-18 mx-auto relative">
        {/* Header */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="bg-gradient-to-r bg-clip-text pb-1 text-4xl font-semibold text-transparent from-[#e0e0e0] to-[#d08ed6]">
            Acheter des Crédits
          </h1>
          <p className="text-white/70">Choisissez votre pack de crédits pour débloquer des fonctionnalités.</p>
        </div>

        <div className="flex flex-col gap-10">
          {/* Cards Section */}
          <section className="flex flex-col gap-6 max-md:items-center md:flex-row md:justify-center">
            {tiers.map((tier, index) => (
              <div key={tier.id} className={`
                ${tier.popular 
                  ? "w-full max-w-[350px] rounded-[26px] bg-gradient-to-r p-0.5 md:-mt-8 from-[#e0e0e0] to-[#d08ed6] shadow-[0_0px_24px_hsla(295,47%,70%,0.5)]"
                  : ""
                }
              `}>
                <Card className={`
                  ${tier.popular 
                    ? "bg-content1 rounded-3xl p-2 border-0"
                    : "bg-content1 border-default-400 w-full max-w-[350px] rounded-3xl border-2 p-2"
                  }
                  transition-transform hover:scale-105
                `}>
                  <CardBody className="gap-3 p-3">
                    {/* Header */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <div className="relative shadow-black/5 shadow-none rounded-small" style={{maxWidth: '25px'}}>
                          <CachedImage 
                            src="/assets/credit.avif" 
                            width="25" 
                            alt="Crédits" 
                            className="relative z-10 transition-transform-opacity motion-reduce:transition-none !duration-300 rounded-small"
                          />
                        </div>
                        <span className={`text-xl text-white ${tier.popular ? 'bg-gradient-to-r bg-clip-text text-transparent from-[#e0e0e0] to-[#d08ed6]' : ''}`}>
                          {tier.credits} Crédits
                        </span>
                      </div>
                      <p className="text-white/70">
                        <span className="text-white text-xl">{tier.price}</span> paiement unique.
                      </p>
                    </div>

                    <Divider className="bg-divider" />

                    {/* Features */}
                    <ul className="flex flex-col gap-2">
                      <li className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                          <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                        </svg>
                        <span className="text-sm text-white">Achat d'items exclusifs</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                          <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                        </svg>
                        <span className="text-sm text-white">Échange avec d'autres utilisateurs</span>
                      </li>
                      <li className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-green-500">
                          <path d="M229.66,77.66l-128,128a8,8,0,0,1-11.32,0l-56-56a8,8,0,0,1,11.32-11.32L96,188.69,218.34,66.34a8,8,0,0,1,11.32,11.32Z"/>
                        </svg>
                        <span className="text-sm text-white">Participation aux enchères</span>
                      </li>
                      {tier.popular && (
                        <li className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256" className="text-yellow-500">
                            <path d="M239.18,97.26A16.38,16.38,0,0,0,224.92,86l-59-4.76L143.14,26.15a16.36,16.36,0,0,0-30.27,0L90.11,81.23,31.08,86a16.46,16.46,0,0,0-9.37,28.86l45,38.83L53,211.75a16.38,16.38,0,0,0,24.5,17.82L128,198.49l50.53,31.08A16.4,16.4,0,0,0,203,211.75l-13.76-58.07,45-38.83A16.43,16.43,0,0,0,239.18,97.26Z"/>
                          </svg>
                          <span className="text-sm text-white font-bold">Pack populaire</span>
                        </li>
                      )}
                    </ul>

                    {/* Button */}
                    <div className="p-3 h-auto flex w-full items-center">
                      <Button 
                        className={`w-full ${tier.popular 
                          ? 'bg-gradient-to-r text-black from-[#e0e0e0] to-[#d08ed6]'
                          : 'bg-default text-white'
                        }`}
                        onPress={() => handlePurchase(tier)}
                      >
                        Acheter
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              </div>
            ))}
          </section>

          {/* Security Note */}
          <p className="text-white/50 text-center text-sm">
            🔒 Le paiement s'effectue via le service Stripe sécurisé. À aucun moment, nous n'avons accès à vos données bancaires.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyCredits;
