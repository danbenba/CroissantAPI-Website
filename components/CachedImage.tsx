import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useImageCache } from '../hooks/ImageCacheContext';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    fallback?: string;
    onLoad?: () => void;
    onError?: () => void;
    blurEffect?: boolean; // Option pour activer/désactiver l'effet de flou
    directLoad?: boolean; // Option pour charger directement sans cache
}

const CachedImage: React.FC<CachedImageProps> = ({
    src,
    alt,
    fallback,
    onLoad,
    onError,
    blurEffect = true,
    directLoad = false,
    ...props
}) => {
    const { getCachedImage, loadImage } = useImageCache();
    const [imageSrc, setImageSrc] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const mountedRef = useRef(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const debouncedLoadImage = useCallback((imageUrl: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(async () => {
            if (!mountedRef.current) return;

            try {
                setIsLoading(true);
                setHasError(false);

                let cachedSrc: string;

                if (directLoad) {
                    // Chargement direct sans cache ni blob
                    cachedSrc = imageUrl;
                } else {
                    // Utiliser le cache avec blob
                    cachedSrc = await loadImage(imageUrl);
                }

                if (mountedRef.current) {
                    setImageSrc(cachedSrc);
                    setIsLoading(false);
                    onLoad?.();
                }
            } catch (error) {
                if (mountedRef.current) {
                    setIsLoading(false);
                    setHasError(true);

                    if (fallback) {
                        try {
                            let fallbackSrc: string;
                            
                            if (directLoad) {
                                fallbackSrc = fallback;
                            } else {
                                fallbackSrc = await loadImage(fallback);
                            }
                            
                            if (mountedRef.current) {
                                setImageSrc(fallbackSrc);
                                setHasError(false);
                            }
                        } catch {
                            onError?.();
                        }
                    } else {
                        onError?.();
                    }
                }
            }
        }, 50); // Debounce de 50ms
    }, [loadImage, fallback, onLoad, onError, directLoad]);

    useEffect(() => {
        if (!src || src.includes('undefined')) return;

        if (directLoad) {
            // Chargement direct sans cache
            setImageSrc(src);
            setIsLoading(false);
            setHasError(false);
            onLoad?.();
            return;
        }

        // Vérifier immédiatement le cache
        const cached = getCachedImage(src);
        if (cached) {
            setImageSrc(cached);
            setIsLoading(false);
            setHasError(false);
            onLoad?.();
            return;
        }

        // Sinon, charger avec debounce
        debouncedLoadImage(src);
    }, [src, getCachedImage, debouncedLoadImage, onLoad, directLoad]);

    if (!directLoad && isLoading && blurEffect && !hasError) {
        return (
            <img
                src={"/assets/System_Shop.webp"}
                alt={alt}
                {...props}
                style={{ filter: "blur(8px)", ...props.style }}
            />
        );
    }

    if (!directLoad && hasError && !fallback) {
        return (
            <div
                style={{
                    ...props.style,
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                }}
                {...(props as any)}
            >
                ⚠️
            </div>
        );
    }

    // Don't render if no valid image source
    if (!imageSrc) {
        return null;
    }

    return (
        <img
            src={imageSrc}
            alt={alt}
            {...props}
        />
    );
};

export default CachedImage;