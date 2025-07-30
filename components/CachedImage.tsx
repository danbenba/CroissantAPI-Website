import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useImageCache } from '../hooks/ImageCacheContext';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    fallback?: string;
    onLoad?: () => void;
    onError?: () => void;
    blurEffect?: boolean; // Option pour activer/désactiver l'effet de flou
}

const CachedImage: React.FC<CachedImageProps> = ({
    src,
    alt,
    fallback,
    onLoad,
    onError,
    blurEffect = true,
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

                const cachedSrc = await loadImage(imageUrl);

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
                            const fallbackSrc = await loadImage(fallback);
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
    }, [loadImage, fallback, onLoad, onError]);

    useEffect(() => {
        if (!src) return;

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
    }, [src, getCachedImage, debouncedLoadImage, onLoad]);

    if (isLoading && blurEffect) {
        return (
            <img
                src={"/assets/System_Shop.webp"}
                alt={alt}
                {...props}
                style={{ filter: "blur(8px)", ...props.style }}
            />
        );
    }

    if (hasError && !fallback) {
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

    return (
        <img
            src={imageSrc}
            alt={alt}
            {...props}
        />
    );
};

export default CachedImage;