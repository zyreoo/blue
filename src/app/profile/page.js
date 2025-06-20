'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log('🔵 Profile Page Status:', {
    authStatus: status,
    hasSession: !!session,
    userEmail: session?.user?.email
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('🚫 User not authenticated, redirecting to sign in');
      router.push('/auth/signin');
      return;
    }

    if (status === 'authenticated' && session) {
      console.log('✅ User authenticated, fetching bookings');
      const fetchBookings = async () => {
        try {
          const response = await fetch('/api/bookings?role=guest');
          if (!response.ok) {
            throw new Error('Failed to fetch bookings');
          }
          const data = await response.json();
          console.log('📚 Bookings fetched:', data);
          setBookings(data);
        } catch (err) {
          console.error('💥 Error fetching bookings:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchBookings();
    }
  }, [session, status, router]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#4CAF50',
      cancelled: '#F44336',
      completed: '#2196F3'
    };
    return colors[status] || '#000000';
  };

  // Show loading state while checking session
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

  // Show loading state while fetching bookings
  if (loading && status === 'authenticated') {
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

  // Handle error state
  if (error) {
    return (
      <div>
        <Header />
        <div className={styles.container}>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Show unauthorized message if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div>
        <Header />
        <div className={styles.container}>
          <h1>Please sign in to view your profile</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className={styles.container}>
        <div className={styles.profileHeader}>
          <div className={styles.userInfo}>
            <h1>Welcome, {session.user.name || session.user.email}!</h1>
            <p className={styles.email}>{session.user.email}</p>
          </div>
        </div>

        <div className={styles.bookingsSection}>
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <div className={styles.noBookings}>
              <h3>No bookings found</h3>
              <p>You haven't made any bookings yet.</p>
            </div>
          ) : (
            <div className={styles.bookingsList}>
              {bookings.map((booking) => (
                <div key={booking._id} className={styles.bookingCard}>
                  <div className={styles.bookingHeader}>
                    <div className={styles.propertyInfo}>
                      <img 
                        src={booking.propertyId?.imageUrl} 
                        alt={booking.propertyId?.title}
                        className={styles.propertyImage}
                      />
                      <div>
                        <h3>{booking.propertyId?.title}</h3>
                        <p>{booking.propertyId?.location}</p>
                      </div>
                    </div>
                    <div 
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </div>
                  </div>

                  <div className={styles.bookingDetails}>
                    <div className={styles.detail}>
                      <span>Booking Number:</span>
                      <strong>{booking.bookingNumber}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>Check-in:</span>
                      <strong>{formatDate(booking.checkIn)}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>Check-out:</span>
                      <strong>{formatDate(booking.checkOut)}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>Guests:</span>
                      <strong>
                        {booking.numberOfGuests.adults + booking.numberOfGuests.teens} adults
                        {booking.numberOfGuests.babies > 0 && `, ${booking.numberOfGuests.babies} infants`}
                      </strong>
                    </div>
                    <div className={styles.detail}>
                      <span>Total Price:</span>
                      <strong>${booking.totalPrice}</strong>
                    </div>
                  </div>

                  {booking.specialRequests && (
                    <div className={styles.specialRequests}>
                      <span>Special Requests:</span>
                      <p>{booking.specialRequests}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 