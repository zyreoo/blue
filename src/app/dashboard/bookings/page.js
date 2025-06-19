'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function BookingsDashboard() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('guest'); // 'guest' or 'owner'

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`/api/bookings?role=${viewMode}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchBookings();
    }
  }, [session, viewMode]);

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

  if (status === 'loading' || loading) {
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
        <div className={styles.container}>
          <h1>Please sign in to view bookings</h1>
        </div>
        <Footer />
      </div>
    );
  }

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

  return (
    <div>
      <Header />
      <main className={styles.container}>
        <div className={styles.header}>
          <h1>My Bookings</h1>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'guest' ? styles.active : ''}`}
              onClick={() => setViewMode('guest')}
            >
              My Stays
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'owner' ? styles.active : ''}`}
              onClick={() => setViewMode('owner')}
            >
              Property Bookings
            </button>
          </div>
        </div>

        <div className={styles.bookingsList}>
          {bookings.length === 0 ? (
            <div className={styles.noBookings}>
              <h2>No bookings found</h2>
              <p>{viewMode === 'guest' ? 
                "You haven't made any bookings yet." : 
                "No bookings have been made for your properties."}
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div key={booking._id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.propertyInfo}>
                    <img 
                      src={booking.property.imageUrl} 
                      alt={booking.property.title}
                      className={styles.propertyImage}
                    />
                    <div>
                      <h3>{booking.property.title}</h3>
                      <p>{booking.property.location}</p>
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
                      {booking.numberOfGuests.adults} Adults, 
                      {booking.numberOfGuests.teens} Teens, 
                      {booking.numberOfGuests.babies} Babies
                    </strong>
                  </div>
                  <div className={styles.detail}>
                    <span>Total Price:</span>
                    <strong>${booking.totalPrice}</strong>
                  </div>
                </div>

                {viewMode === 'owner' && (
                  <div className={styles.guestInfo}>
                    <h4>Guest Information</h4>
                    <div className={styles.detail}>
                      <span>Name:</span>
                      <strong>{booking.guestName}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>Email:</span>
                      <strong>{booking.guestEmail}</strong>
                    </div>
                    <div className={styles.detail}>
                      <span>Phone:</span>
                      <strong>{booking.guestPhone}</strong>
                    </div>
                    {booking.specialRequests && (
                      <div className={styles.specialRequests}>
                        <span>Special Requests:</span>
                        <p>{booking.specialRequests}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
} 