'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import PropertyList from '@/components/admin/PropertyList';
import BookingsList from '@/components/admin/BookingsList';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('properties');
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProperties = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/properties`);
          if (response.ok) {
            const data = await response.json();
            setProperties(data.properties || []);
          } else {
            console.error('Failed to fetch properties:', await response.text());
          }
        } catch (error) {
          console.error('Error fetching properties:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProperties();
  }, [session]);

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
          <div className={styles.adminControls}>
            {activeSection === 'properties' && (
              <button
                className={styles.addButton}
                onClick={() => router.push('/become-host?isExistingHost=true')}
              >
                Add New Property
              </button>
            )}
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
        </div>

        <div className={styles.adminContent}>
          {activeSection === 'properties' ? (
            <PropertyList properties={properties} setProperties={setProperties} />
          ) : (
            <BookingsList />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}            