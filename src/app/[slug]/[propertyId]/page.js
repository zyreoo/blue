'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';


const DateRangePicker = dynamic(() => import('@/components/DateRangePicker'), {
  ssr: false,
});

export default function PropertyPage() {
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);
  const params = useParams();

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await fetch(`/api/properties`);
        if (!response.ok) {
          throw new Error('Failed to fetch property');
        }
        const data = await response.json();
        const foundProperty = data.find(p => p._id === params.propertyId);
        
        if (!foundProperty) {
          throw new Error('Property not found');
        }
        
        setProperty(foundProperty);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.propertyId]);
  const handleBooking = async () => {
    try {
      console.log('📚 Attempting to book property:', {
        propertyId: params.propertyId,
        location: property.location,
        propertyTitle: property.title,
        checkIn: selectedDates.startDate,
        checkOut: selectedDates.endDate
      });

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: params.propertyId,
          location: property.location,
          checkIn: selectedDates.startDate,
          checkOut: selectedDates.endDate
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record booking');
      }

      const result = await response.json();
      console.log('✅ Booking successful:', {
        location: property.location,
        newBookingCount: result.booking.bookingCount,
        checkIn: selectedDates.startDate,
        checkOut: selectedDates.endDate
      });

      // You could add additional booking flow here
      alert(`Booking recorded successfully for ${new Date(selectedDates.startDate).toLocaleDateString()} to ${new Date(selectedDates.endDate).toLocaleDateString()}! This location now has ${result.booking.bookingCount} bookings.`);
    } catch (error) {
      console.error('❌ Error recording booking:', error);
      alert('Failed to record booking. Please try again.');
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <div>
        <Header />
        <div className={styles.errorContainer}>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <div className={styles.titleSection}>
          <h1>{property.title}</h1>
          <p className={styles.location}>{property.location}</p>
        </div>
        
        <div className={styles.imageGallery}>
          <Image 
            src={property.imageUrl} 
            alt={property.title} 
            className={styles.mainImage}
            width={1200}
            height={800}
            quality={85}
            priority={true}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU/RUVHUFBQUFtbW1tbW1tbW1tbW1v/2wBDARUXFyAeIB4gHR4dICEgW1FRW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1v/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
        
        <div className={styles.contentContainer}>
          <div className={styles.propertyInfo}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>🛏️</span>
                <div>
                  <h3>{property.bedrooms} Bedroom{property.bedrooms !== 1 ? 's' : ''}</h3>
                  <p>Perfect for your stay</p>
                </div>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>🚿</span>
                <div>
                  <h3>{property.bathrooms} Bathroom{property.bathrooms !== 1 ? 's' : ''}</h3>
                  <p>Fresh and clean</p>
                </div>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>👥</span>
                <div>
                  <h3>Up to {property.maxGuests} Guests</h3>
                  <p>Spacious accommodation</p>
                </div>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>🏠</span>
                <div>
                  <h3>{property.type || 'House'}</h3>
                  <p>Property type</p>
                </div>
              </div>
            </div>

            <div className={styles.description}>
              <h2>About this place</h2>
              <p>{property.description}</p>
            </div>
          </div>

          <div className={styles.bookingCard}>
            <div className={styles.priceContainer}>
              <span className={styles.price}>${property.price}</span>
              <span className={styles.perNight}>per night</span>
            </div>
            
            <DateRangePicker 
              onDateChange={(ranges) => setSelectedDates(ranges)}
            />
            
            <button 
              className={styles.bookButton} 
              onClick={handleBooking}
              disabled={!selectedDates}
            >
              Book Now
            </button>

            <div className={styles.bookingDetails}>
              <p>Free cancellation before check-in</p>
              <p>Self check-in with keypad</p>
              <p>Great location with high ratings</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 