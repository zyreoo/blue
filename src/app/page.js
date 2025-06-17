'use client';

import { useState, useEffect, Suspense } from 'react';
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

const LocationSection = dynamic(() => import('@/components/LocationSection'), {
  loading: () => <HomePageSkeleton />,
  ssr: true
});

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [topLocations, setTopLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();
  const [filters, setFilters] = useState(() => {
    // Try to load initial filters from localStorage
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('searchFilters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        // Convert date strings back to Date objects
        if (parsedFilters.checkIn) parsedFilters.checkIn = new Date(parsedFilters.checkIn);
        if (parsedFilters.checkOut) parsedFilters.checkOut = new Date(parsedFilters.checkOut);
        return parsedFilters;
      }
    }
    return null;
  });

  useEffect(() => {
    const controller = new AbortController();
    
    fetchData(controller.signal);
    
    return () => controller.abort();
  }, []);

  const fetchData = async (signal) => {
    try {
      const [propertiesResponse, bookingsResponse] = await Promise.all([
        fetch('/api/properties', { 
          signal,
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
          }
        }),
        fetch('/api/bookings', { 
          signal,
          headers: {
            'Cache-Control': 'public, max-age=31536000, immutable',
          }
        })
      ]);

      if (!propertiesResponse.ok || !bookingsResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const propertiesData = await propertiesResponse.json();
      const bookingsData = await bookingsResponse.json();

      setProperties(propertiesData);
      setTopLocations(bookingsData);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatLocationUrl = (location) => {
    return encodeURIComponent(location.toLowerCase().replace(/\s+/g, '-'));
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

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const groupedProperties = properties.reduce((acc, property) => {
    if (!acc[property.location]) {
      acc[property.location] = [];
    }
    acc[property.location].push(property);
    return acc;
  }, {});

  if (loading) return (
    <div>
      <Header />
      <HomePageSkeleton />
      <Footer />
    </div>
  );
  
  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.mainTitle}>{t('home.title')}</h1>
        <SearchFilters onFiltersChange={handleFiltersChange} />
        <Suspense fallback={<HomePageSkeleton />}>
          {topLocations.map((locationData) => {
            const locationProperties = groupedProperties[locationData.location] || [];
            return (
              <section key={locationData.location} className={styles.locationSection}>
                <Link href={`/${formatLocationUrl(locationData.location)}`} className={styles.locationLink}>
                  <h2 className={styles.locationTitle}>
                    {t('property.location')} {locationData.location}
                  </h2>
                </Link>
                <div className={styles.cardsContainer}>
                  <div className={styles.cardsScroll}>
                    {locationProperties.map((property) => (
                      <Link 
                        key={property._id} 
                        href={`/${formatLocationUrl(locationData.location)}/${property._id}${formatSearchParams(filters)}`}
                        className={styles.card}
                      >
                        <div className={styles.imageContainer}>
                          <Image 
                            src={property.imageUrl} 
                            alt={property.title}
                            className={styles.image}
                            width={300}
                            height={200}
                            priority={false}
                            loading="lazy"
                            quality={75}
                          />
                          <div className={styles.price}>${property.price}/{t('property.perNight')}</div>
                        </div>
                        <div className={styles.content}>
                          <h3>{property.title}</h3>
                          <p className={styles.description}>{property.description}</p>
                        </div>
                      </Link>
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
