'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { AmenityIcons } from '@/components/icons/AmenityIcons';
import ErrorMessage from '@/components/ErrorMessage';

const PhotoViewer = dynamic(() => import('@/components/PhotoViewer'), {
  ssr: false
});

const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);

const propertyTypes = [
  { id: 'house', label: 'House', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zM10 10c0-1.1.9-2 2-2s2 .9 2 2h-4z"/></svg> },
  { id: 'apartment', label: 'Apartment', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M17 11V3H7v4H3v14h8v-4h2v4h8V11h-4zM7 19H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm4 4H9v-2h2v2zm0-4H9V9h2v2zm0-4H9V5h2v2zm4 8h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm4 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/></svg> },
  { id: 'barn', label: 'Barn', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M20 10v11H4V10L12 4l8 6zm-8-4.6c-.8 0-1.5.5-1.8 1.2-.3.7-.1 1.6.5 2.1.6.5 1.4.5 2 0 .6-.5.8-1.4.5-2.1-.3-.7-1-1.2-1.8-1.2z"/></svg> },
  { id: 'guesthouse', label: 'Guesthouse', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zM10 10c0-1.1.9-2 2-2s2 .9 2 2h-4z"/></svg> },
  { id: 'boat', label: 'Boat', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.9-6.68c.11-.37.04-1.06-.66-1.28L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.63.19-.81.84-.66 1.28L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/></svg> },
  { id: 'cabin', label: 'Cabin', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zM10 10c0-1.1.9-2 2-2s2 .9 2 2h-4z"/></svg> },
  { id: 'camper', label: 'Camper', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg> },
  { id: 'villa', label: 'Villa', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zM10 10c0-1.1.9-2 2-2s2 .9 2 2h-4z"/></svg> },
  { id: 'castle', label: 'Castle', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M21 9v2h-2V3h-2v2h-2V3h-2v2h-2V3H9v2H7V3H5v8H3V9H1v12h9v-3c0-1.1.9-2 2-2s2 .9 2 2v3h9V9h-2zm-10 3H9V9h2v3zm4 0h-2V9h2v3z"/></svg> },
  { id: 'cave', label: 'Cave', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M20 6h-3V4c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v12h20V8c0-1.1-.9-2-2-2zM9 4h6v2H9V4zm10 14H5V8h14v10z"/></svg> },
  { id: 'container', label: 'Container', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg> },
  { id: 'cycladic', label: 'Cycladic', icon: <svg viewBox="0 0 24 24" fill="#626F47"><path d="M19 9.3V4h-3v2.6L12 3 2 12h3v8h5v-6h4v6h5v-8h3l-3-2.7zM10 10c0-1.1.9-2 2-2s2 .9 2 2h-4z"/></svg> }
];

const amenityGroups = {
  essential: {
    title: 'Essential',
    amenities: ['wifi', 'tv', 'kitchen', 'washer', 'workspace', 'dryer', 'dishwasher']
  },
  bathroom: {
    title: 'Bathroom & Spa',
    amenities: ['hair_dryer', 'toiletries', 'hot_tub']
  },
  bedroom: {
    title: 'Bedroom',
    amenities: ['iron', 'hangers', 'extra_pillows']
  },
  outdoor: {
    title: 'Outdoor',
    amenities: ['pool', 'parking', 'balcony', 'garden', 'beach_access', 'bbq', 'outdoor_dining']
  },
  entertainment: {
    title: 'Entertainment',
    amenities: ['smart_tv', 'streaming', 'games', 'board_games', 'sound_system']
  },
  kitchen: {
    title: 'Kitchen & Dining',
    amenities: ['coffee_maker', 'microwave', 'wine_glasses', 'dining_table']
  },
  safety: {
    title: 'Safety',
    amenities: ['smoke_detector', 'first_aid', 'security_cameras']
  },
  climate: {
    title: 'Climate Control',
    amenities: ['ac', 'heating']
  }
};

export default function EditPropertyPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return;
      try {
        const response = await fetch(`/api/properties/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          
          // Ensure each photo has an ID and isMain flag
          const photosWithIds = (data.photos || []).map((photo, index) => ({
            ...photo,
            id: photo.id || `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            isMain: photo.isMain || index === 0 // First photo is main if none is marked
          }));
          
          // Update all states with the fetched data
          setProperty({
            ...data,
            photos: photosWithIds,
            name: data.name || '',
            description: data.description || '',
            price: data.price || '',
            type: data.type || 'house',
            amenities: data.amenities || [],
            address: data.address || '',
            city: data.city || '',
            country: data.country || ''
          });
          setSelectedAmenities(data.amenities || []);
          
          // Safely handle location data
          if (data.location && Array.isArray(data.location.coordinates) && data.location.coordinates.length >= 2) {
            setLocation({
              lat: data.location.coordinates[1],
              lng: data.location.coordinates[0],
              address: data.address || '',
              city: data.city || '',
              country: data.country || ''
            });
          } else {
            setLocation({
              lat: 0,
              lng: 0,
              address: data.address || '',
              city: data.city || '',
              country: data.country || ''
            });
          }
        } else {
          setErrorMessage('Failed to fetch property');
          console.error('Failed to fetch property');
        }
      } catch (error) {
        setErrorMessage(error.message);
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchProperty();
    }
  }, [session, params.id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const newValue = type === 'number' 
      ? (value === '' ? '' : Number(value))
      : type === 'checkbox' 
        ? checked 
        : value;

    setProperty(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingPhotos(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('photos', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload photos');
      }

      const { urls } = await response.json();
      
      const newPhotos = urls.map(url => ({
        id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url,
        isMain: false
      }));

      const updatedPhotos = [...(property.photos || []), ...newPhotos];
      
      const updateResponse = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: updatedPhotos
        }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update property photos');
      }

      const updatedProperty = await updateResponse.json();
      setProperty(prev => ({
        ...prev,
        photos: updatedProperty.photos
      }));
    } catch (error) {
      console.error('Error uploading photos:', error);
      setErrorMessage(error.message || 'Failed to upload photos. Please try again.');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleSetMainPhoto = async (photoId) => {

    if (!property.photos || !photoId) {
      console.error('Invalid photo data');
      return;
    }


    const updatedPhotos = property.photos.map(photo => ({
      ...photo,
      isMain: photo.id === photoId ? true : false,
      id: photo.id // Preserve existing IDs
    }));

    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: updatedPhotos
        }),
      });

      if (!response.ok) throw new Error('Failed to set main photo');

      const updatedProperty = await response.json();
      

      setProperty(prev => ({
        ...prev,
        photos: updatedProperty.photos.map(photo => ({
          ...photo,
          id: photo.id || `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }))
      }));
    } catch (error) {
      console.error('Error setting main photo:', error);
      alert('Failed to set main photo. Please try again.');
    }
  };

  const handlePhotoDelete = async (photoId) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const updatedPhotos = property.photos.filter(photo => photo.id !== photoId);
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photos: updatedPhotos
        }),
      });

      if (!response.ok) throw new Error('Failed to update property photos');

      const updatedProperty = await response.json();
      setProperty(prev => ({
        ...prev,
        photos: updatedProperty.photos
      }));
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const movePhoto = async (fromIndex, toIndexOrDirection) => {
    if (!property.photos || fromIndex < 0 || fromIndex >= property.photos.length) {
      console.error('Invalid photo index for moving');
      return;
    }

    const newPhotos = [...property.photos];
    
    if (toIndexOrDirection === 'up' && fromIndex > 0) {
      // Move up
      [newPhotos[fromIndex], newPhotos[fromIndex - 1]] = [newPhotos[fromIndex - 1], newPhotos[fromIndex]];
    } else if (toIndexOrDirection === 'down' && fromIndex < newPhotos.length - 1) {
      // Move down
      [newPhotos[fromIndex], newPhotos[fromIndex + 1]] = [newPhotos[fromIndex + 1], newPhotos[fromIndex]];
    } else if (typeof toIndexOrDirection === 'number') {
      // Move to specific position (used for setting main photo)
      const photoToMove = newPhotos[fromIndex];
      newPhotos.splice(fromIndex, 1); // Remove from current position
      newPhotos.splice(toIndexOrDirection, 0, photoToMove); // Insert at new position
    } else {
      return; // Invalid move
    }

    try {
      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photos: newPhotos }),
      });

      if (!response.ok) throw new Error('Failed to reorder photos');

      const updatedProperty = await response.json();
      setProperty(prev => ({
        ...prev,
        photos: updatedProperty.photos
      }));
    } catch (error) {
      console.error('Error reordering photos:', error);
      alert('Failed to reorder photos. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedProperty = {
        name: property.name,
        description: property.description,
        price: parseFloat(property.price),
        type: property.type,
        amenities: selectedAmenities,
        photos: property.photos,
        location: location && location.lat && location.lng ? {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        } : undefined,
        address: location?.address || '',
        city: location?.city || '',
        country: location?.country || ''
      };

      const response = await fetch(`/api/properties/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProperty)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update property');
      }

      const updatedData = await response.json();
      setProperty(updatedData);
      router.push('/admin');
    } catch (error) {
      setErrorMessage(error.message);
      console.error('Error updating property:', error);
      alert('Failed to update property. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleLocationSelect = (locationData) => {
    setLocation(locationData);
  };

  if (status === 'loading' || loading) {
    return (
      <div>
        <Header />
        <div className={styles.loadingContainer}>
          <LoadingSpinner />
        </div>
        <Footer />
      </div>
    );
  }

  if (!session) {
    return (
      <div>
        <Header />
        <div className={styles.unauthorizedContainer}>
          <h1>Unauthorized Access</h1>
          <p>Please sign in to access this page.</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMessage) return <ErrorMessage message={errorMessage} onClose={() => setErrorMessage(null)} />;
  if (!property) return <div>Property not found</div>;

  return (
    <div className={styles.pageContainer}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Edit Property</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formSection}>
            <h2>Photos</h2>
            <p className={styles.sectionDescription}>
              High-quality photos help guests imagine staying in your place.
            </p>
            <div className={styles.photoSection}>
              <div className={styles.currentPhotos}>
                {property.photos && property.photos.length > 0 && (
                  <div className={styles.photoGrid}>
                    {property.photos.map((photo, index) => (
                      <div
                        key={photo.id || index}
                        className={`${styles.photoItem} ${
                          index === 0 ? styles.mainPhoto : ''
                        }`}
                        onClick={() => {
                          setInitialPhotoIndex(index);
                          setShowPhotoViewer(true);
                        }}
                      >
                        <Image
                          src={photo.url}
                          alt={`Property photo ${index + 1}`}
                          fill
                          style={{ objectFit: 'cover' }}
                          className={styles.photo}
                        />
                        <div className={styles.photoActions}>
                          <button
                            type="button"
                            className={`${styles.setPrimary} ${index === 0 ? styles.isPrimary : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              movePhoto(index, 0); // Move to first position instead of setting isMain
                            }}
                          >
                            {index === 0 ? 'Main photo' : 'Set as main'}
                          </button>
                          <div className={styles.orderButtons}>
                            <button
                              type="button"
                              className={styles.orderButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                movePhoto(index, 'up');
                              }}
                              disabled={index === 0}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className={styles.orderButton}
                              onClick={(e) => {
                                e.stopPropagation();
                                movePhoto(index, 'down');
                              }}
                              disabled={index === property.photos.length - 1}
                            >
                              ↓
                            </button>
                          </div>
                          <button
                            type="button"
                            className={styles.removePhoto}
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePhotoDelete(photo.id);
                            }}
                          >
                            ×
                          </button>
                        </div>
                        {index === 0 && (
                          <div className={styles.mainPhotoLabel}>
                            Main photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {typeof window !== 'undefined' && showPhotoViewer && (
                <PhotoViewer
                  photos={property.photos}
                  onClose={() => setShowPhotoViewer(false)}
                  initialPhotoIndex={initialPhotoIndex}
                />
              )}
              <div className={styles.uploadSection}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className={styles.fileInput}
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className={styles.uploadButton}>
                  {uploadingPhotos ? 'Uploading...' : 'Add Photos'}
                </label>
                <p className={styles.uploadInfo}>
                  First photo will be the main photo. You can reorder photos by dragging.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Basic Information</h2>
            <p className={styles.sectionDescription}>
              Share some basic information about your property.
            </p>
            <div className={styles.formGroup}>
              <label htmlFor="name">Property Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={property.name}
                onChange={handleChange}
                required
                placeholder="Give your property a catchy name"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={property.description}
                onChange={handleChange}
                required
                placeholder="Describe what makes your place special"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price per Night (€)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={property.price}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="Enter price per night"
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Property Type</h2>
            <p className={styles.sectionDescription}>
              Choose the category that best describes your property.
            </p>
            <div className={styles.propertyTypes}>
              {propertyTypes.map(type => (
                <label
                  key={type.id}
                  className={`${styles.propertyType} ${property.type === type.id ? styles.selected : ''}`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.id}
                    checked={property.type === type.id}
                    onChange={handleChange}
                  />
                  <span className={styles.propertyTypeIcon}>{type.icon}</span>
                  <span className={styles.propertyTypeLabel}>{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Location</h2>
            <p className={styles.sectionDescription}>
              Help guests find your property by providing accurate location details.
            </p>
            <div className={styles.mapWrapper}>
              <MapComponent
                onLocationSelect={handleLocationSelect}
                initialLocation={location ? [location.lat, location.lng] : undefined}
              />
            </div>
            <div className={styles.locationDetails}>
              <div className={styles.formGroup}>
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={location?.address || ''}
                  onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                  required
                  placeholder="Enter the full street address"
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={location?.city || ''}
                    onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    required
                    placeholder="Enter the city"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="country">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={location?.country || ''}
                    onChange={(e) => setLocation(prev => ({ ...prev, country: e.target.value }))}
                    required
                    placeholder="Enter the country"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h2>Amenities</h2>
            <p className={styles.sectionDescription}>
              Select the amenities available at your property.
            </p>
            <div className={styles.amenityGroups}>
              {Object.entries(amenityGroups).map(([groupKey, group]) => (
                <div key={groupKey} className={styles.amenityGroup}>
                  <h3>{group.title}</h3>
                  <div className={styles.amenities}>
                    {group.amenities.map(amenity => (
                      <label
                        key={amenity}
                        className={`${styles.amenity} ${selectedAmenities.includes(amenity) ? styles.selected : ''}`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                        />
                        <span className={styles.amenityIcon}>
                          {AmenityIcons[amenity]}
                        </span>
                        <span className={styles.amenityLabel}>
                          {amenity.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => router.back()}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={styles.saveButton}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 