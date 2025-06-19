'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './admin.module.css';
import PropertyList from '@/components/admin/PropertyList';
import BookingsList from '@/components/admin/BookingsList';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState('properties');

  if (status === 'loading') {
    return (
      <div>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <Header />
        <div className={styles.unauthorizedContainer}>
          <h1>Unauthorized Access</h1>
          <p>Please sign in to access the admin panel.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <div className={styles.adminHeader}>
          <h1>Admin Dashboard</h1>
          <div className={styles.adminNav}>
            <button
              className={`${styles.navButton} ${activeSection === 'properties' ? styles.active : ''}`}
              onClick={() => setActiveSection('properties')}
            >
              Properties
            </button>
            <button
              className={`${styles.navButton} ${activeSection === 'bookings' ? styles.active : ''}`}
              onClick={() => setActiveSection('bookings')}
            >
              Bookings
            </button>
          </div>
        </div>

        <div className={styles.adminContent}>
          {activeSection === 'properties' ? (
            <PropertyList />
          ) : (
            <BookingsList />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 