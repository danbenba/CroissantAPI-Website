import React, { createContext, useContext, useCallback, ReactNode } from 'react';

interface ImageCacheContextType {
  getCachedImage: (src: string) => string | null;
  loadImage: (src: string) => Promise<string>;
  clearCache: () => void;
}

const ImageCacheContext = createContext<ImageCacheContextType | undefined>(undefined);

// Cache global persistant
const imageCache = new Map<string, string>();
const loadingPromises = new Map<string, Promise<string>>();

export const ImageCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getCachedImage = useCallback((src: string): string | null => {
    return imageCache.get(src) || null;
  }, []);

  const loadImage = useCallback(async (src: string): Promise<string> => {
    // Si l'image est déjà en cache, la retourner immédiatement
    if (imageCache.has(src)) {
      return imageCache.get(src)!;
    }

    // Si l'image est déjà en cours de chargement, attendre la promise existante
    if (loadingPromises.has(src)) {
      return loadingPromises.get(src)!;
    }

    // Créer une nouvelle promise de chargement
    const loadingPromise = new Promise<string>(async (resolve, reject) => {
      try {
        // Fetch l'image
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convertir en blob
        const blob = await response.blob();
        
        // Convertir le blob en URL d'objet
        const blobUrl = URL.createObjectURL(blob);
        
        // Stocker dans le cache PERSISTANT
        imageCache.set(src, blobUrl);
        loadingPromises.delete(src);
        
        resolve(blobUrl);
      } catch (error) {
        loadingPromises.delete(src);
        reject(error);
      }
    });

    loadingPromises.set(src, loadingPromise);
    return loadingPromise;
  }, []);

  const clearCache = useCallback(() => {
    // Nettoyer les blob URLs avant de vider le cache
    imageCache.forEach((blobUrl) => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    });
    imageCache.clear();
    loadingPromises.clear();
  }, []);

  return (
    <ImageCacheContext.Provider value={{ getCachedImage, loadImage, clearCache }}>
      {children}
    </ImageCacheContext.Provider>
  );
};

export const useImageCache = (): ImageCacheContextType => {
  const context = useContext(ImageCacheContext);
  if (!context) {
    throw new Error('useImageCache must be used within an ImageCacheProvider');
  }
  return context;
};