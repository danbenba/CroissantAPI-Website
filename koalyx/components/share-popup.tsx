'use client';

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@heroui/modal';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Tooltip } from '@heroui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

interface SharePopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
}

interface SharePlatform {
  name: string;
  icon: string;
  color: string;
  hoverColor: string;
  shareUrl: string;
  description: string;
}

export default function SharePopup({ isOpen, onClose, title, description, url }: SharePopupProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Encoder les paramètres pour les URLs
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || 'Découvrez cet article sur Koalyx');

  const platforms: SharePlatform[] = [
    {
      name: 'Facebook',
      icon: 'fab fa-facebook-f',
      color: 'bg-blue-600',
      hoverColor: 'hover:bg-blue-700',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      description: 'Partager sur Facebook'
    },
    {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: 'bg-sky-500',
      hoverColor: 'hover:bg-sky-600',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      description: 'Partager sur Twitter'
    },
    {
      name: 'LinkedIn',
      icon: 'fab fa-linkedin-in',
      color: 'bg-blue-700',
      hoverColor: 'hover:bg-blue-800',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      description: 'Partager sur LinkedIn'
    },
    {
      name: 'WhatsApp',
      icon: 'fab fa-whatsapp',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      shareUrl: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      description: 'Partager sur WhatsApp'
    },
    {
      name: 'Telegram',
      icon: 'fab fa-telegram-plane',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      shareUrl: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      description: 'Partager sur Telegram'
    },
    {
      name: 'Reddit',
      icon: 'fab fa-reddit-alien',
      color: 'bg-orange-600',
      hoverColor: 'hover:bg-orange-700',
      shareUrl: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      description: 'Partager sur Reddit'
    },
    {
      name: 'Discord',
      icon: 'fab fa-discord',
      color: 'bg-indigo-600',
      hoverColor: 'hover:bg-indigo-700',
      shareUrl: '', // Discord n'a pas d'URL de partage direct, on copiera le lien
      description: 'Copier pour Discord'
    },
    {
      name: 'Email',
      icon: 'fas fa-envelope',
      color: 'bg-gray-600',
      hoverColor: 'hover:bg-gray-700',
      shareUrl: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      description: 'Partager par email'
    }
  ];

  const handlePlatformShare = (platform: SharePlatform) => {
    if (platform.name === 'Discord') {
      // Pour Discord, on copie juste le lien
      copyToClipboard();
    } else {
      // Ouvrir dans une nouvelle fenêtre
      window.open(platform.shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || 'Découvrez cet article sur Koalyx',
          url: url,
        });
        onClose();
      } catch (err) {
        console.error('Erreur lors du partage natif:', err);
      }
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="2xl"
      classNames={{
        base: "bg-gray-900/95 backdrop-blur-md border border-white/20",
        header: "border-b border-white/20",
        body: "py-6",
        closeButton: "text-white hover:bg-white/10"
      }}
    >
      <ModalContent className="modal-modern">
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <i className="fas fa-share text-blue-400 mr-3"></i>
{t('popups.share.title')}
          </h2>
          <p className="text-gray-400 text-sm font-normal">
            Choisissez votre plateforme préférée
          </p>
        </ModalHeader>
        
        <ModalBody>
          {/* Titre de l'article */}
          <Card className="bg-gray-800/50 border border-white/10 mb-4">
            <CardBody className="p-4">
              <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
              {description && (
                <p className="text-gray-400 text-sm">{description}</p>
              )}
            </CardBody>
          </Card>

          {/* Grille des plateformes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {platforms.map((platform) => (
              <Tooltip 
                key={platform.name} 
                content={platform.description}
                placement="top"
                className="bg-black/90 text-white border border-white/20"
                classNames={{
                  content: "bg-black/90 text-white border border-white/20 px-3 py-2"
                }}
              >
                <Button
                  className={`${platform.color} ${platform.hoverColor} text-white border-none h-20 flex-col gap-2 transition-all duration-300 transform hover:scale-105`}
                  onClick={() => handlePlatformShare(platform)}
                >
                  <i className={`${platform.icon} text-2xl`}></i>
                  <span className="text-xs font-medium">{platform.name}</span>
                </Button>
              </Tooltip>
            ))}
          </div>

          {/* Section copier le lien */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gray-800/50 border border-white/10 rounded-lg p-4">
              <div className="flex-1 mr-4">
                <p className="text-white font-medium mb-1">{t('popups.share.copyLink')}</p>
                <p className="text-gray-400 text-sm truncate">{url}</p>
              </div>
              <Button
                color={copied ? "success" : "primary"}
                variant="shadow"
                onClick={copyToClipboard}
                startContent={
                  <i className={copied ? "fas fa-check" : "fas fa-copy"}></i>
                }
                className="min-w-32"
              >
{copied ? t('popups.share.linkCopied') : t('popups.share.copyLink')}
              </Button>
            </div>

            {/* Partage natif pour mobiles */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <Button
                color="secondary"
                variant="shadow"
                className="w-full"
                startContent={<i className="fas fa-mobile-alt"></i>}
                onClick={handleNativeShare}
              >
                Utiliser le partage natif
              </Button>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
