"use client"

import { useLanguage } from '@/contexts/LanguageContext'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
} from "@heroui/react"

interface VipPopupProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

type PlanColor = "default" | "primary" | "secondary" | "success" | "warning" | "danger"

interface Plan {
  id: string
  name: string
  price: string
  period: string
  features: string[]
  color: PlanColor
  badge?: string
}

export default function VipPopup({ isOpen, onOpenChange }: VipPopupProps) {
  const { t } = useLanguage()
  
  const plans: Plan[] = [
    {
      id: "free",
      name: t('vip.free'),
      price: t('vip.freePrice'),
      period: t('vip.lifetime'),
      color: "primary",
      badge: t('vip.classic'),
      features: [
        t('vip.features.standardDownloads'),
        t('vip.features.fewerAds'),
        t('vip.features.classicSupport'),
      ],
    },
    {
      id: "plus",
      name: t('vip.plus'),
      price: "5,99€",
      period: t('vip.lifetime'),
      color: "warning",
      badge: t('vip.mostPopular'),
      features: [
        t('vip.features.prioritySpeed'),
        t('vip.features.exclusiveContent'),
        t('vip.features.prioritySupport'),
        t('vip.features.profileBadge'),
      ],
    },
    {
      id: "ultra",
      name: t('vip.ultra'),
      price: "9,00€",
      period: t('vip.monthly'),
      color: "success",
      badge: t('vip.premium'),
      features: [
        t('vip.features.allUltraFeatures'),
        t('vip.features.lifetimeUpdates'),
        t('vip.features.noRecurring'),
      ],
    },
  ]

  const openShop = (planId?: string) => {
    if (typeof window !== "undefined") {
      window.location.href = planId ? `/shop?plan=${planId}` : "/shop"
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-gradient-to-br from-gray-900 to-black",
        header: "border-b border-gray-700",
        body: "py-6",
        footer: "border-t border-gray-700",
      }}
    >
      <ModalContent className="modal-modern">
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col items-center gap-1 text-center">
              <h2 className="text-2xl font-bold text-white">{t('vip.title')}</h2>
              <p className="text-gray-300 text-sm">{t('vip.subtitle')}</p>
            </ModalHeader>

            <ModalBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((p) => (
                  <Card
                    key={p.id}
                    className="bg-gray-800/80 shadow-sm hover:shadow-md transition-shadow border border-gray-700"
                  >
                    <CardBody className="p-5 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-white text-lg font-semibold">{p.name}</h3>
                        {p.badge && (
                          <Chip color={p.color} variant="shadow" size="sm">
                            {p.badge}
                          </Chip>
                        )}
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-white">{p.price}</span>
                        <span className="text-sm text-gray-400">{p.period}</span>
                      </div>

                      <Divider className="my-1" />

                      <ul className="space-y-2">
                        {p.features.map((f, i) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2">
                            <i className="fas fa-check mt-0.5 text-green-400" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        color={p.color}
                        variant="shadow"
                        fullWidth
                        className="font-semibold mt-2"
                        onPress={() => openShop(p.id)}
                      >
{t('vip.chooseThis')}
                      </Button>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </ModalBody>

            <ModalFooter className="flex flex-col gap-2">
              <Button variant="light" fullWidth onPress={() => openShop()}>
                {t('nav.shop')}
              </Button>
              <Button variant="light" fullWidth onPress={onClose}>
                {t('common.close')}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}
