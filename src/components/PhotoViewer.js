'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import styles from './PhotoViewer.module.css';

export default function PhotoViewer({ photos, onClose, initialPhotoIndex = 0 }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(initialPhotoIndex);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentPhotoIndex(prev => 
          prev === 0 ? photos.length - 1 : prev - 1
        );
      } else if (e.key === 'ArrowRight') {
        setCurrentPhotoIndex(prev => 
          prev === photos.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [mounted, photos.length, onClose]);

  if (!mounted || !photos || photos.length === 0 || typeof window === 'undefined') return null;

  const viewer = (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <div className={styles.photoCount}>
          {currentPhotoIndex + 1} / {photos.length}
        </div>

        <div className={styles.mainPhoto}>
          <div 
            className={`${styles.photoWrapper} ${isZoomed ? styles.zoomed : ''}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <Image
              src={photos[currentPhotoIndex].url}
              alt={`Photo ${currentPhotoIndex + 1}`}
              fill
              style={{ objectFit: isZoomed ? 'contain' : 'cover' }}
              quality={isZoomed ? 90 : 75}
              priority={true}
              sizes="100vw"
            />
          </div>

          {photos.length > 1 && (
            <>
              <button 
                className={`${styles.navButton} ${styles.prevButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(prev => 
                    prev === 0 ? photos.length - 1 : prev - 1
                  );
                }}
              >
                ←
              </button>
              <button 
                className={`${styles.navButton} ${styles.nextButton}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex(prev => 
                    prev === photos.length - 1 ? 0 : prev + 1
                  );
                }}
              >
                →
              </button>
            </>
          )}
        </div>

        <div className={styles.thumbnails}>
          {photos.map((photo, index) => (
            <div
              key={index}
              className={`${styles.thumbnail} ${index === currentPhotoIndex ? styles.active : ''}`}
              onClick={() => setCurrentPhotoIndex(index)}
            >
              <Image
                src={photo.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                quality={60}
                sizes="100px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(viewer, document.body);
} 