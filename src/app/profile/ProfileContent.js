'use client';

import { useLanguage } from '@/components/LanguageProvider';
import styles from './page.module.css';

export default function ProfileContent({ session }) {
  const { t } = useLanguage();

  return (
    <div className={styles.container}>
      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarPlaceholder}>
            {session.user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <h1 className={styles.title}>{t('profile.welcome')}, {session.user.name}!</h1>
        </div>
        <div className={styles.profileInfo}>
          <div className={styles.infoItem}>
            <span className={styles.label}>{t('profile.email')}:</span>
            <span className={styles.value}>{session.user.email}</span>
          </div>
          <div className={styles.stats}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t('profile.stats.bookings')}</span>
              <span className={styles.statValue}>0</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>{t('profile.stats.reviews')}</span>
              <span className={styles.statValue}>0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 