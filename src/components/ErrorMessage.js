import { useEffect, useState } from 'react';
import styles from './LoadingSpinner.module.css';

export default function ErrorMessage({ message, onClose, autoHideDuration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHideDuration) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [autoHideDuration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12" y2="16" />
        </svg>
      </div>
      <p className={styles.errorMessage}>{message}</p>
      <button 
        className={styles.closeButton}
        onClick={() => {
          setIsVisible(false);
          onClose?.();
        }}
        aria-label="Close error message"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
} 