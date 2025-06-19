'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './BookingsList.module.css';

export default function BookingsList() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?role=admin');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking status');
      }
      
      // Update booking in the list
      setBookings(bookings.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: newStatus }
          : booking
      ));

      // Show success message
      alert('Booking status updated successfully');
    } catch (err) {
      console.error('Error updating booking status:', err);
      alert('Error updating booking status: ' + err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!session) return <div className={styles.error}>Please sign in to access the admin panel</div>;
  if (loading) return <div className={styles.loading}>Loading bookings...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (bookings.length === 0) return <div className={styles.empty}>No bookings found.</div>;

  return (
    <div className={styles.bookingsList}>
      <div className={styles.header}>
        <h2>Property Bookings</h2>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.cell}>Property</div>
          <div className={styles.cell}>Guest</div>
          <div className={styles.cell}>Dates</div>
          <div className={styles.cell}>Status</div>
          <div className={styles.cell}>Actions</div>
        </div>

        {bookings.map((booking) => (
          <div key={booking._id} className={styles.tableRow}>
            <div className={styles.cell}>
              <div className={styles.propertyInfo}>
                <img 
                  src={booking.propertyId?.imageUrl} 
                  alt={booking.propertyId?.title}
                  className={styles.propertyImage}
                />
                <div>
                  <div className={styles.propertyTitle}>{booking.propertyId?.title}</div>
                  <div className={styles.propertyLocation}>{booking.propertyId?.location}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.cell}>
              <div className={styles.guestInfo}>
                <div className={styles.guestName}>{booking.customer.name}</div>
                <div className={styles.guestEmail}>{booking.customer.email}</div>
                <div className={styles.guestPhone}>{booking.customer.phone}</div>
              </div>
            </div>
            
            <div className={styles.cell}>
              <div className={styles.dates}>
                <div>Check-in: {formatDate(booking.checkIn)}</div>
                <div>Check-out: {formatDate(booking.checkOut)}</div>
              </div>
              <div className={styles.guests}>
                {booking.numberOfGuests.adults + booking.numberOfGuests.teens} adults
                {booking.numberOfGuests.babies > 0 && `, ${booking.numberOfGuests.babies} infants`}
              </div>
            </div>

            <div className={styles.cell}>
              <div className={`${styles.status} ${styles[booking.status]}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </div>
            </div>

            <div className={styles.cell}>
              <select
                value={booking.status}
                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 