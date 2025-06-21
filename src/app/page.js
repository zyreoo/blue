'use client';

import { useState, useEffect, Suspense, useMemo, useCallback, useRef } from 'react';
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
import { useSearchParams } from 'next/navigation';

const LocationSection = dynamic(() => import('@/components/LocationSection'), {
  loading: () => <HomePageSkeleton />,
  ssr: true
});


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
  const ref = useRef();
  const inView = useInView(ref, {
    triggerOnce: true,
    threshold: 0.1
  });

  // Get the main photo URL
  const mainPhotoUrl = property.photos && property.photos.length > 0
    ? property.photos.find(photo => photo.isMain)?.url || property.photos[0].url
    : property.imageUrl || '/placeholder-property.jpg';

  // Handle location formatting based on the location object structure
  const formattedLocation = property.location && typeof property.location === 'object' 
    ? `${property.location.city}-${property.location.country}`.toLowerCase().replace(/\s+/g, '-')
    : property.location?.toLowerCase().replace(/\s+/g, '-') || locationUrl;

  // Get the price from either the new or old data structure
  const price = property.pricing?.basePrice || property.price;

  // Get property details from either structure
  const details = property.details || {
    maxGuests: property.maxGuests,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms
  };

  return (
    <Link 
      ref={ref}
      href={`/${formattedLocation}/${property._id}${formatSearchParams(filters)}`}
      className={styles.card}
    >
      <div className={styles.imageContainer}>
        {inView && (
          <Image 
            src={mainPhotoUrl}
            alt={property.title}
            className={styles.image}
            width={300}
            height={200}
            priority={false}
            loading="lazy"
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx0eHh0dHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/2wBDAR0XFx4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        <div className={styles.price}>${price}/{t('property.perNight')}</div>
      </div>
      <div className={styles.content}>
        <h3>{property.title}</h3>
        <p className={styles.description}>{property.description}</p>
        <p className={styles.location}>
          {typeof property.location === 'object' 
            ? `${property.location.city}, ${property.location.country}`
            : property.location}
        </p>
        <p className={styles.details}>
          {details.bedrooms} {t('property.bedrooms')} • {details.bathrooms} {t('property.bathrooms')} • {t('property.maxGuests')} {details.maxGuests}
        </p>
      </div>
    </Link>
  );
};

export default function Home() {
  const { properties = [], isLoading: propertiesLoading, isError: propertiesError } = useProperties();
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [filters, setFilters] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const searchParams = useSearchParams();

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

    }
  }, [searchParams]);

  const handleTypeChange = useCallback((type) => {
    setSelectedPropertyType(type);
  }, []);

  const filteredProperties = useMemo(() => {
    if (!Array.isArray(properties)) return [];

    return properties.filter(property => {
      if (filters) {
        if (filters.propertyType && filters.propertyType !== 'all') {
          if (property.type !== filters.propertyType) {
            return false;
          }
        }

        if (filters.priceRange) {
          const [minPrice, maxPrice] = filters.priceRange;
          if (property.price < minPrice || property.price > maxPrice) {
            return false;
          }
        }

        if (filters.guests) {
          const totalGuests = filters.guests.adults + filters.guests.teens + filters.guests.babies;
          if (totalGuests > property.maxGuests) {
            return false;
          }
        }

        if (filters.amenities && filters.amenities.length > 0) {
          const hasAllAmenities = filters.amenities.every(amenity => 
            property.amenities?.includes(amenity)
          );
          if (!hasAllAmenities) {
            return false;
          }
        }
      }

      return true;
    });
  }, [properties, filters]);


  const groupedProperties = useMemo(() => {
    return filteredProperties.reduce((acc, property) => {
      // Get the location key for grouping
      const locationKey = property.location && typeof property.location === 'object'
        ? `${property.location.city}, ${property.location.country}`
        : property.location;

      // Initialize the array if it doesn't exist
      if (!acc[locationKey]) {
        acc[locationKey] = [];
      }

      // Add the property to its location group
      acc[locationKey].push(property);
      return acc;
    }, {});
  }, [filteredProperties]);

  const formatLocationUrl = useCallback((location) => {
    if (typeof location === 'object') {
      return encodeURIComponent(`${location.city}-${location.country}`.toLowerCase().replace(/\s+/g, '-'));
    }
    
    // If location is a string, it's already in "City, Country" format
    return encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'));
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('searchFilters', JSON.stringify(newFilters));
      } catch (e) {
  
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
  
  if (propertiesLoading) return (
    <div>
      <Header />
      <HomePageSkeleton />
      <Footer />
    </div>
  );
  
  if (propertiesError) return <div className={styles.error}>{propertiesError.message}</div>;

  return (
    <div>
      <Header onTypeChange={handleTypeChange} />
      <main className={styles.main}>
        <h1 className={styles.mainTitle}>{t('home.title')}</h1>
        <SearchFilters 
          onFiltersChange={handleFiltersChange} 
          selectedQuickFilter={selectedPropertyType}
        />
        <Suspense fallback={<HomePageSkeleton />}>
          {Object.entries(groupedProperties).map(([location, locationProperties]) => {
            const locationUrl = formatLocationUrl(location);
            
            return (
              <section key={location} className={styles.locationSection}>
                <Link href={`/${locationUrl}`} className={styles.locationLink}>
                  <h2 className={styles.locationTitle}>
                    {t('property.location')} {location}
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
