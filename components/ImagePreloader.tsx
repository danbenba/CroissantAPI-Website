import { useEffect } from 'react';
import { useImageCache } from '../hooks/ImageCacheContext';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean; // Précharger immédiatement ou en idle
}

const ImagePreloader: React.FC<ImagePreloaderProps> = ({ images, priority = false }) => {
  const { preloadImages } = useImageCache();

  useEffect(() => {
    if (priority) {
      // Précharger immédiatement
      preloadImages(images);
    } else {
      // Précharger quand le navigateur est en idle
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          preloadImages(images);
        });
      } else {
        // Fallback pour les navigateurs qui ne supportent pas requestIdleCallback
        setTimeout(() => {
          preloadImages(images);
        }, 1000);
      }
    }
  }, [images, priority, preloadImages]);

  return null; // Ce composant ne rend rien
};

export default ImagePreloader;