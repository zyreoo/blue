'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import { useSession } from 'next-auth/react';
import { AmenityIcons } from '@/components/icons/AmenityIcons';

const DateRangePicker = dynamic(() => import('@/components/DateRangePicker'), {
  ssr: false,
});

const PhotoViewer = dynamic(() => import('@/components/PhotoViewer'), {
  ssr: false
});

export default function PropertyPage() {
  const { data: session } = useSession();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDates, setSelectedDates] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);
  const [bookingForm, setBookingForm] = useState({
    firstName: '',
    lastName: '',
    guestEmail: '',
    guestPhone: '',
    idNumber: '',
    specialRequests: ''
  });
  const params = useParams();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const adults = parseInt(searchParams.get('adults') || '0');
    const teens = parseInt(searchParams.get('teens') || '0');
    const babies = parseInt(searchParams.get('babies') || '0');
    const rooms = parseInt(searchParams.get('rooms') || '1');

    if (checkIn && checkOut) {
      const dates = {
        startDate: new Date(checkIn),
        endDate: new Date(checkOut),
        persons: {
          adults,
          teens,
          babies
        },
        rooms
      };
      setSelectedDates(dates);
      localStorage.setItem('searchFilters', JSON.stringify({
        checkIn: dates.startDate,
        checkOut: dates.endDate,
        guests: dates.persons,
        rooms: dates.rooms
      }));
    } else {
      const savedFilters = localStorage.getItem('searchFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters.checkIn && parsedFilters.checkOut) {
          setSelectedDates({
            startDate: new Date(parsedFilters.checkIn),
            endDate: new Date(parsedFilters.checkOut),
            persons: parsedFilters.guests,
            rooms: parsedFilters.rooms
          });
        }
      }
    }
  }, [searchParams]);

  const handleDateChange = (ranges) => {
    setSelectedDates(ranges);
    localStorage.setItem('searchFilters', JSON.stringify({
      checkIn: ranges.startDate,
      checkOut: ranges.endDate,
      guests: ranges.persons,
      rooms: ranges.rooms
    }));
  };

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

        if (foundProperty.location && typeof foundProperty.location === 'object') {
          foundProperty.formattedLocation = `${foundProperty.location.city}, ${foundProperty.location.country}`;
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

  useEffect(() => {
    if (session?.user) {
      setBookingForm(prev => ({
        ...prev,
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        guestEmail: session.user.email || '',
        guestPhone: session.user.phoneNumber || '',
        idNumber: session.user.idNumber || ''
      }));
    }
  }, [session]);

  const handleBookingFormChange = (e) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setBookingForm(prev => ({
        ...prev
      }));
    } else {
      setBookingForm({
        firstName: session?.user?.firstName || '',
        lastName: session?.user?.lastName || '',
        guestEmail: session?.user?.email || '',
        guestPhone: session?.user?.phoneNumber || '',
        idNumber: session?.user?.idNumber || '',
        specialRequests: bookingForm.specialRequests
      });
    }
  };

  const handleBooking = async () => {
    try {
      if (!selectedDates || !selectedDates.startDate || !selectedDates.endDate) {
        alert('Please select check-in and check-out dates');
        return;
      }

      if (!bookingForm.firstName || !bookingForm.lastName || !bookingForm.guestEmail || !bookingForm.guestPhone || !bookingForm.idNumber) {
        alert('Please fill in all required guest information');
        return;
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId: params.propertyId,
          checkIn: selectedDates.startDate,
          checkOut: selectedDates.endDate,
          numberOfGuests: selectedDates.persons,
          numberOfRooms: selectedDates.rooms,
          firstName: bookingForm.firstName,
          lastName: bookingForm.lastName,
          guestEmail: bookingForm.guestEmail,
          guestPhone: bookingForm.guestPhone,
          idNumber: bookingForm.idNumber,
          specialRequests: bookingForm.specialRequests
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record booking');
      }

      const result = await response.json();
      
      alert('Booking recorded successfully! You will receive a confirmation email shortly.');
      
      setBookingForm({
        firstName: session?.user?.firstName || '',
        lastName: session?.user?.lastName || '',
        guestEmail: session?.user?.email || '',
        guestPhone: session?.user?.phoneNumber || '',
        idNumber: session?.user?.idNumber || '',
        specialRequests: ''
      });
      setEditMode(false);
      
    } catch (error) {
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
          <h1>{property.name}</h1>
          <p className={styles.location}>
            {property.formattedLocation || (typeof property.location === 'object' 
              ? `${property.location.city}, ${property.location.country}`
              : property.location)}
          </p>
        </div>
        
        <div className={styles.imageGallery}>
          {loading ? (
            <div className={styles.loadingContainer}>
              <div className={styles.loader}></div>
            </div>
          ) : property?.photos?.length > 0 ? (
            <div className={styles.photoGrid}>
              <div 
                className={styles.mainPhotoContainer}
                onClick={() => {
                  setInitialPhotoIndex(0);
                  setShowPhotoViewer(true);
                }}
              >
                <Image 
                  src={property.photos.find(photo => photo.isMain)?.url || property.photos[0].url}
                  alt={`${property.title} - Main`}
                  className={styles.mainPhoto}
                  width={800}
                  height={600}
                  quality={85}
                  priority={true}
                  loading="eager"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU/RUVHUFBQUFtbW1tbW1tbW1tbW1v/2wBDARUXFyAeIB4gHR4dICEgW1FRW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1v/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </div>
              <div className={styles.smallPhotosGrid}>
                {property.photos.slice(1, 5).map((photo, index) => (
                  <div 
                    key={index} 
                    className={`${styles.smallPhotoContainer} ${index === 3 && property.photos.length > 5 ? styles.lastPhotoContainer : ''}`}
                    onClick={() => {
                      setInitialPhotoIndex(index + 1);
                      setShowPhotoViewer(true);
                    }}
                  >
                    <Image
                      src={photo.url}
                      alt={`${property.title} - ${index + 2}`}
                      className={styles.smallPhoto}
                      width={400}
                      height={300}
                      quality={75}
                      loading="lazy"
                      sizes="(max-width: 768px) 50vw, 33vw"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU/RUVHUFBQUFtbW1tbW1tbW1tbW1v/2wBDARUXFyAeIB4gHR4dICEgW1FRW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1v/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                    {index === 3 && property.photos.length > 5 && (
                      <div className={styles.remainingPhotos}>
                        <span>+{property.photos.length - 5} photos</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : property?.imageUrl ? (
            <Image 
              src={property.imageUrl}
              alt={property.title || 'Property Image'}
              className={styles.mainImage}
              width={800}
              height={600}
              quality={85}
              priority={true}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU/RUVHUFBQUFtbW1tbW1tbW1tbW1v/2wBDARUXFyAeIB4gHR4dICEgW1FRW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1v/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            />
          ) : (
            <div className={styles.noImage}>No images available</div>
          )}
        </div>

        {showPhotoViewer && property?.photos && (
          <PhotoViewer
            photos={property.photos}
            onClose={() => setShowPhotoViewer(false)}
            initialPhotoIndex={initialPhotoIndex}
          />
        )}

        <div className={styles.contentContainer}>
          <div className={styles.propertyInfo}>
            <div className={styles.detailsGrid}>
              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#626F47">
                    <path d="M20 9.557V3h-2v2H6V3H4v6.557C2.81 10.25 2 11.525 2 13v8h2v-2h16v2h2v-8c0-1.475-.811-2.75-2-3.443zM18 7v2h-5V7h5zm-7 0v2H6V7h5zm-7 6v-2h16v2H4z"/>
                  </svg>
                </span>
                <div>
                  <h3>{property.details?.bedrooms || property.bedrooms} Bedroom{(property.details?.bedrooms || property.bedrooms) !== 1 ? 's' : ''}</h3>
                  <p>Perfect for your stay</p>
                </div>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#626F47">
                    <path d="M21 13v7h-2v-2H5v2H3v-7c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zM7 19h10v-6H7v6zm3-9c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3h2zm4 0c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3h2z"/>
                  </svg>
                </span>
                <div>
                  <h3>{property.details?.bathrooms || property.bathrooms} Bathroom{(property.details?.bathrooms || property.bathrooms) !== 1 ? 's' : ''}</h3>
                  <p>Fresh and clean</p>
                </div>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#626F47">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                  </svg>
                </span>
                <div>
                  <h3>Up to {property.details?.maxGuests || property.maxGuests} Guests</h3>
                  <p>Spacious accommodation</p>
                </div>
              </div>

              <div className={styles.detailCard}>
                <span className={styles.detailIcon}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="#626F47">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3zm0 13h-2v-2h2v2z"/>
                  </svg>
                </span>
                <div>
                  <h3>{property.propertyType || property.type || 'House'}</h3>
                  <p>Property type</p>
                </div>
              </div>
            </div>

            <div className={styles.description}>
              <h2>About this place</h2>
              <p>{property.description}</p>
            </div>

            {property.amenities && property.amenities.length > 0 && (
              <div className={styles.amenities}>
                <h2>Amenities</h2>
                <div className={styles.amenitiesGrid}>
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className={styles.amenityItem}>
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity.toLowerCase()] || '✨'}
                      </span>
                      <span className={styles.amenityLabel}>
                        {amenity.charAt(0).toUpperCase() + amenity.slice(1).replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.bookingCard}>
            <div className={styles.priceContainer}>
              <span className={styles.price}>${property.price}</span>
              <span className={styles.perNight}>per night</span>
            </div>
            
            <DateRangePicker 
              onDateChange={handleDateChange}
              initialValues={selectedDates}
            />

            <div className={styles.bookingForm}>
              <div className={styles.formHeader}>
                <h3>Guest Information</h3>
                {session?.user && (
                  <button
                    type="button"
                    onClick={toggleEditMode}
                    className={styles.editButton}
                  >
                    {editMode ? 'Use My Info' : 'Edit Info'}
                  </button>
                )}
              </div>

              <div className={styles.nameGroup}>
                <input
                  type="text"
                  name="firstName"
                  value={bookingForm.firstName}
                  onChange={handleBookingFormChange}
                  placeholder="First Name *"
                  className={styles.bookingInput}
                  disabled={!editMode && session?.user}
                  required
                />
                
                <input
                  type="text"
                  name="lastName"
                  value={bookingForm.lastName}
                  onChange={handleBookingFormChange}
                  placeholder="Last Name *"
                  className={styles.bookingInput}
                  disabled={!editMode && session?.user}
                  required
                />
              </div>
              
              <input
                type="email"
                name="guestEmail"
                value={bookingForm.guestEmail}
                onChange={handleBookingFormChange}
                placeholder="Email Address *"
                className={styles.bookingInput}
                disabled={!editMode && session?.user}
                required
              />
              
              <input
                type="tel"
                name="guestPhone"
                value={bookingForm.guestPhone}
                onChange={handleBookingFormChange}
                placeholder="Phone Number *"
                className={styles.bookingInput}
                disabled={!editMode && session?.user}
                required
              />

              <input
                type="text"
                name="idNumber"
                value={bookingForm.idNumber}
                onChange={handleBookingFormChange}
                placeholder="ID/Passport Number *"
                className={styles.bookingInput}
                disabled={!editMode && session?.user}
                required
              />
              
              <textarea
                name="specialRequests"
                value={bookingForm.specialRequests}
                onChange={handleBookingFormChange}
                placeholder="Special Requests (optional)"
                className={styles.bookingTextarea}
                rows={4}
              />
            </div>
            
            <button 
              className={styles.bookButton} 
              onClick={handleBooking}
              disabled={!selectedDates || !bookingForm.firstName || !bookingForm.lastName || !bookingForm.guestEmail || !bookingForm.guestPhone || !bookingForm.idNumber}
            >
              Book Now
            </button>

            <div className={styles.bookingDetails}>
              <p>Free cancellation before check-in</p>
              <p>Self check-in with keypad</p>
              <p>Great location in {property.formattedLocation || (typeof property.location === 'object' 
                ? `${property.location.city}, ${property.location.country}`
                : property.location)}</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 