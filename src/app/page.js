'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { HomePageSkeleton } from '@/components/SkeletonLoader';
import SearchFilters from '@/components/SearchFilters';
import { useLocations, useLocationProperties } from '@/lib/hooks';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'next/navigation';

const PropertyCard = ({ property, locationSlug, filters }) => {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const mainPhotoUrl = property.photos && property.photos.length > 0
    ? property.photos[0].url
    : '/placeholder-property.jpg';

  const price = property.pricing?.basePrice || property.price;
  const { maxGuests, bedrooms, bathrooms } = property;

  return (
    <Link 
      ref={ref}
      href={`/${locationSlug}/${property._id}${formatSearchParams(filters)}`}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        {inView && (
          <Image 
            src={mainPhotoUrl}
            alt={property.name}
            className={styles.image}
            width={300}
            height={200}
            priority={false}
            loading="lazy"
            quality={75}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className={styles.price}>{price} RON/noapte</div>
      </div>
      <div className={styles.content}>
        <h3>{property.name}</h3>
        <p className={styles.description}>{property.description}</p>
        <div className={styles.details}>
          {bedrooms} dormitoare • {bathrooms} băi • Maxim {maxGuests} oaspeți
        </div>
      </div>
    </Link>
  );
};

const LocationSection = ({ location, filters }) => {
  const { properties, isLoading, error } = useLocationProperties(location.slug);
  
  console.log('DEBUG - LocationSection for:', location.slug, {
    location,
    propertiesReceived: properties,
    isLoading,
    error,
    filters
  });

  if (isLoading) return <HomePageSkeleton />;
  if (error) {
    console.error('DEBUG - LocationSection error:', error);
    return null;
  }
  if (!properties?.length) {
    console.log('DEBUG - No properties found for location:', location.slug);
    return null;
  }

  const filteredProperties = properties.filter(property => {
    console.log('DEBUG - Filtering property:', property);
    
    if (!filters) return true;

    if (filters.guests) {
      const totalGuests = (
        (filters.guests.adults || 0) + 
        (filters.guests.teens || 0) + 
        (filters.guests.babies || 0)
      );
      if (property.maxGuests && totalGuests > property.maxGuests) return false;
    }

    if (filters.amenities?.length) {
      if (!property.amenities) return true; 
      const hasAllAmenities = filters.amenities.every(
        amenity => property.amenities?.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    return true;
  });

  console.log('DEBUG - Filtered properties result:', {
    before: properties.length,
    after: filteredProperties.length,
    filters
  });

  return (
    <section className={styles.locationSection}>
      <Link href={`/${location.slug}`} className={styles.locationLink}>
        <h2 className={styles.locationTitle}>
          Cazare în {location.city}, {location.country}
        </h2>
      </Link>
      <div className={styles.cardsContainer}>
        <div className={styles.cardsScroll}>
          {filteredProperties.map(property => (
            <PropertyCard
              key={property._id}
              property={property}
              locationSlug={location.slug}
              filters={filters}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

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

export default function Home() {
  const { locations, isLoading: locationsLoading, error: locationsError } = useLocations();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const searchParams = useSearchParams();

  console.log('DEBUG - All locations:', locations);
  console.log('DEBUG - Loading state:', locationsLoading);
  console.log('DEBUG - Error state:', locationsError);

  useEffect(() => {
    setMounted(true);
    try {
      const savedFilters = localStorage.getItem('searchFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        if (parsedFilters.checkIn) parsedFilters.checkIn = new Date(parsedFilters.checkIn);
        if (parsedFilters.checkOut) parsedFilters.checkOut = new Date(parsedFilters.checkOut);
        setFilters(parsedFilters);
      }

      const propertyType = searchParams.get('propertyType');
      if (propertyType) {
        setFilters(prev => ({
          ...prev || {},
          propertyType
        }));
      }
    } catch (e) {
      console.error('Eroare la încărcarea filtrelor:', e);
    }
  }, [searchParams]);

  const handleTypeChange = useCallback((type) => {
    setSelectedPropertyType(type);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('searchFilters', JSON.stringify(newFilters));
      } catch (e) {
        console.error('Eroare la salvarea filtrelor:', e);
      }
    }
  }, []);

  if (!mounted) {
    return (
      <div>
        <Header />
        <HomePageSkeleton />
        <Footer />
      </div>
    );
  }

  if (locationsLoading) {
    return (
      <div>
        <Header />
        <HomePageSkeleton />
        <Footer />
      </div>
    );
  }

  if (locationsError) {
    return <div className={styles.error}>Error loading locations</div>;
  }

  return (
    <div>
      <Header onTypeChange={handleTypeChange} />
      <main className={styles.main}>
        <h1 className={styles.mainTitle}>Descoperă locuri minunate de cazare</h1>
        <SearchFilters 
          onFiltersChange={handleFiltersChange} 
          selectedQuickFilter={selectedPropertyType}
        />
        <Suspense fallback={<HomePageSkeleton />}>
          {locations.map(location => (
            <LocationSection
              key={location.slug}
              location={location}
              filters={filters}
            />
          ))}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
