'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function SuperAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('SuperAdmin Page: Current status:', status);
    console.log('SuperAdmin Page: Full session object:', session);
    console.log('SuperAdmin Page: User object:', session?.user);
    console.log('SuperAdmin Page: isSuperAdmin value:', session?.user?.isSuperAdmin);

    if (status === 'unauthenticated') {
      console.log('SuperAdmin Page: Redirecting - unauthenticated');
      router.push('/auth/signin');
      return;
    }

    if (status === 'loading') {
      console.log('SuperAdmin Page: Session is still loading');
      return;
    }

    if (!session?.user?.isSuperAdmin) {
      console.log('SuperAdmin Page: Redirecting - not superadmin');
      console.log('SuperAdmin Page: Session user data:', {
        email: session?.user?.email,
        isSuperAdmin: session?.user?.isSuperAdmin
      });
      router.push('/');
      return;
    }

    console.log('SuperAdmin Page: Access granted, fetching properties');

    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties/pending');
        console.log('SuperAdmin Page: Properties API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('SuperAdmin Page: Fetched properties:', data.properties);
          setProperties(data.properties);
        } else {
          const errorData = await response.json();
          console.error('SuperAdmin Page: Failed to fetch properties:', errorData);
        }
      } catch (error) {
        console.error('SuperAdmin Page: Error fetching properties:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProperties();
  }, [session, status, router]);

  const handlePropertyStatus = async (propertyId, status) => {
    try {
      console.log('SuperAdmin Page: Updating property status:', { propertyId, status });
      const response = await fetch(`/api/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      console.log('SuperAdmin Page: Update status response:', response.status);

      if (response.ok) {
        setProperties(properties.map(prop => 
          prop._id === propertyId ? { ...prop, status } : prop
        ));
        console.log('SuperAdmin Page: Property status updated successfully');
      } else {
        const errorData = await response.json();
        console.error('SuperAdmin Page: Failed to update property status:', errorData);
      }
    } catch (error) {
      console.error('SuperAdmin Page: Error updating property status:', error);
    }
  };

  if (isLoading) {
    console.log('SuperAdmin Page: Rendering loading state');
    return (
      <div>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.loader}></div>
          <p>Loading superadmin dashboard...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!session?.user?.isSuperAdmin) {
    console.log('SuperAdmin Page: Rendering unauthorized state');
    console.log('SuperAdmin Page: Current session:', session);
    return (
      <div>
        <Header />
        <div className={styles.unauthorizedContainer}>
          <h1>Unauthorized Access</h1>
          <p>You do not have permission to access this page.</p>
          <p>Current user: {session?.user?.email}</p>
          <p>Superadmin status: {String(session?.user?.isSuperAdmin)}</p>
        </div>
        <Footer />
      </div>
    );
  }

  console.log('SuperAdmin Page: Rendering main content');
  return (
    <div>
      <Header />
      <main className={styles.main}>
        <div className={styles.adminHeader}>
          <h1>Super Admin Dashboard</h1>
          <p>Manage Property Approvals</p>
          <p>Logged in as: {session.user.email} (Superadmin)</p>
        </div>

        <div className={styles.propertiesGrid}>
          {properties.length === 0 ? (
            <div className={styles.noProperties}>
              <p>No properties pending approval</p>
            </div>
          ) : (
            properties.map((property) => (
              <div key={property._id} className={styles.propertyCard}>
                <div className={styles.propertyImage}>
                  {property.photos && property.photos[0] && (
                    <img src={property.photos[0]} alt={property.title} />
                  )}
                </div>
                <div className={styles.propertyInfo}>
                  <h3>{property.title}</h3>
                  <p>Location: {property.location.city}, {property.location.country}</p>
                  <p>Host: {property.hostEmail}</p>
                  <p>Status: {property.status}</p>
                  <div className={styles.propertyActions}>
                    {property.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handlePropertyStatus(property._id, 'approved')}
                          className={styles.approveButton}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handlePropertyStatus(property._id, 'rejected')}
                          className={styles.rejectButton}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 