'use client';

import { useState, useEffect } from 'react';
import styles from './BookingsList.module.css';

export default function BookingsList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings?role=owner');
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

      if (!response.ok) throw new Error('Failed to update booking status');
      
      // Refresh bookings list
      fetchBookings();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatGuestCount = (booking) => {
    const guests = booking.numberOfGuests || {};
    const adults = (guests.adults || 0) + (guests.teens || 0);
    const babies = guests.babies || 0;
    
    let guestText = `${adults} adult${adults !== 1 ? 's' : ''}`;
    if (babies > 0) {
      guestText += `, ${babies} ${babies === 1 ? 'child' : 'children'}`;
    }
    return guestText;
  };

  if (loading) {
    return <div className={styles.loading}>Loading bookings...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (bookings.length === 0) {
    return <div className={styles.empty}>No bookings found.</div>;
  }

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
                  src={booking.propertyId?.imageUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='} 
                  alt={booking.propertyId?.title || 'Property'}
                  className={styles.propertyImage}
                />
                <div>
                  <div className={styles.propertyTitle}>{booking.propertyId?.title || 'Property Unavailable'}</div>
                  <div className={styles.propertyLocation}>{booking.propertyId?.location || 'Location Unavailable'}</div>
                </div>
              </div>
            </div>
            
            <div className={styles.cell}>
              <div className={styles.guestInfo}>
                <div>{booking.firstName} {booking.lastName}</div>
                <div className={styles.guestEmail}>{booking.guestEmail}</div>
                <div className={styles.guestPhone}>{booking.guestPhone}</div>
              </div>
            </div>
            
            <div className={styles.cell}>
              <div className={styles.dates}>
                <div>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</div>
                <div>Check-out: {new Date(booking.checkOut).toLocaleDateString()}</div>
                <div className={styles.guests}>
                  Guests: {formatGuestCount(booking)}
                </div>
              </div>
            </div>
            
            <div className={styles.cell}>
              <span className={`${styles.status} ${styles[booking.status || 'pending']}`}>
                {booking.status || 'pending'}
              </span>
            </div>
            
            <div className={styles.cell}>
              <select
                value={booking.status || 'pending'}
                onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                className={styles.statusSelect}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirm</option>
                <option value="cancelled">Cancel</option>
                <option value="completed">Complete</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 