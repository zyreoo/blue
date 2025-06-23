'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './location-properties.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { LocationPageSkeleton } from '@/components/SkeletonLoader';
import { useLanguage } from '@/hooks/useLanguage';

export default function LocationProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const locationSlug = params.slug;
  const { t } = useLanguage();

  const formatSlugToLocation = (slug) => {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await fetch('/api/properties');
        if (!response.ok) {
          throw new Error('Failed to fetch properties');
        }
        const data = await response.json();
        
        const locationName = formatSlugToLocation(locationSlug);
        const filteredProperties = data.filter(
          property => property.location === locationName
        );
        
        if (filteredProperties.length === 0) {
          throw new Error(`No properties found in ${locationName}`);
        }
        
        setProperties(filteredProperties);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [locationSlug]);

  if (loading) return (
    <div>
      <Header />
      <LocationPageSkeleton />
      <Footer />
    </div>
  );

  if (error) return (
    <div>
      <Header />
      <div className={styles.error}>{error}</div>
      <Footer />
    </div>
  );

  const locationName = formatSlugToLocation(locationSlug);

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>{t('property.location')} {locationName}</h1>
        <div className={styles.contentContainer}>
          <div className={styles.grid}>
            {properties.map((property) => (
              <Link
                key={property._id}
                href={`/${locationSlug}/${property._id}`}
                className={styles.card}
              >
                <div className={styles.imageContainer}>
                  <Image 
                    src={property.imageUrl} 
                    alt={property.title}
                    className={styles.image}
                    width={400}
                    height={300}
                    quality={75}
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkMjU1LS0yMi4qLjgyPjA+OjU/RUVHUFBQUFtbW1tbW1tbW1tbW1v/2wBDARUXFyAeIB4gHR4dICEgW1FRW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1tbW1v/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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
      </main>
      <Footer />
    </div>
  );
} 