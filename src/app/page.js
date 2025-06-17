'use client';

import { useState, useEffect, Suspense, useMemo, useCallback } from 'react';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { HomePageSkeleton } from '@/components/SkeletonLoader';
import { useLanguage } from '@/components/LanguageProvider';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import SearchFilters from '@/components/SearchFilters';
import { useProperties, useBookings } from '@/lib/hooks';
import { useInView } from 'react-intersection-observer';

const LocationSection = dynamic(() => import('@/components/LocationSection'), {
  loading: () => <HomePageSkeleton />,
  ssr: true
});

// Move formatSearchParams outside components since it doesn't depend on component state
const formatSearchParams = (filters) => {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  if (filters.checkIn) params.set('checkIn', filters.checkIn.toISOString());
  if (filters.checkOut) params.set('checkOut', filters.checkOut.toISOString());
  if (filters.guests) {
    params.set('adults', filters.guests.adults || 0);
    params.set('teens', filters.guests.teens || 0);
    params.set('babies', filters.guests.babies || 0);
  }
  if (filters.rooms) params.set('rooms', filters.rooms);
  
  return params.toString() ? `?${params.toString()}` : '';
};

const PropertyCard = ({ property, locationUrl, filters, t }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <Link 
      ref={ref}
      href={`/${locationUrl}/${property._id}${formatSearchParams(filters)}`}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        {inView && (
          <Image 
            src={property.imageUrl} 
            alt={property.title}
            className={styles.image}
            width={300}
            height={200}
            priority={false}
            loading="lazy"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0eHh0dHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR0XFx4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className={styles.price}>${property.price}/{t('property.perNight')}</div>
      </div>
      <div className={styles.content}>
        <h3>{property.title}</h3>
        <p className={styles.description}>{property.description}</p>
      </div>
    </Link>
  );
};

export default function Home() {
  const { properties = [], isLoading: propertiesLoading, isError: propertiesError } = useProperties();
  const { bookings: topLocations = [], isLoading: bookingsLoading, isError: bookingsError } = useBookings();
  const { t } = useLanguage();
  
  // Memoize the filters initialization
  const [filters, setFilters] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedFilters = localStorage.getItem('searchFilters');
      if (!savedFilters) return null;
      const parsedFilters = JSON.parse(savedFilters);
      if (parsedFilters.checkIn) parsedFilters.checkIn = new Date(parsedFilters.checkIn);
      if (parsedFilters.checkOut) parsedFilters.checkOut = new Date(parsedFilters.checkOut);
      return parsedFilters;
    } catch (e) {
      console.error('Error loading filters:', e);
      return null;
    }
  });

  // Memoize expensive computations
  const groupedProperties = useMemo(() => {
    if (!Array.isArray(properties)) return {};
    return properties.reduce((acc, property) => {
      if (!acc[property.location]) {
        acc[property.location] = [];
      }
      acc[property.location].push(property);
      return acc;
    }, {});
  }, [properties]);

  // Memoize the format functions
  const formatLocationUrl = useCallback((location) => {
    return encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'));
  }, []);

  // Memoize the filters change handler
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('searchFilters', JSON.stringify(newFilters));
      } catch (e) {
        console.error('Error saving filters:', e);
      }
    }
  }, []);

  const loading = propertiesLoading || bookingsLoading;
  const error = propertiesError || bookingsError;

  if (loading) return (
    <div>
      <Header />
      <HomePageSkeleton />
      <Footer />
    </div>
  );
  
  if (error) return <div className={styles.error}>{error.message}</div>;

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.mainTitle}>{t('home.title')}</h1>
        <SearchFilters onFiltersChange={handleFiltersChange} />
        <Suspense fallback={<HomePageSkeleton />}>
          {topLocations.map((locationData) => {
            const locationProperties = groupedProperties[locationData.location] || [];
            const locationUrl = formatLocationUrl(locationData.location);
            
            return (
              <section key={locationData.location} className={styles.locationSection}>
                <Link href={`/${locationUrl}`} className={styles.locationLink}>
                  <h2 className={styles.locationTitle}>
                    {t('property.location')} {locationData.location}
                  </h2>
                </Link>
                <div className={styles.cardsContainer}>
                  <div className={styles.cardsScroll}>
                    {locationProperties.map((property) => (
                      <PropertyCard
                        key={property._id}
                        property={property}
                        locationUrl={locationUrl}
                        filters={filters}
                        t={t}
                      />
                    ))}
                  </div>
                </div>
              </section>
            );
          })}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
