'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './AddPropertyForm.module.css';

const propertyTypes = ['Apartment', 'House', 'Villa', 'Cabin', 'Loft'];

export default function AddPropertyForm({ onClose, onPropertyAdded }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    imageUrl: '',
    type: 'Apartment',
    description: '',
    bedrooms: '',
    bathrooms: '',
    maxGuests: '',
    roomCapacity: '',
    personCapacity: '',
    petsAllowed: false,
    maxPets: '0',
    amenities: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          bedrooms: parseInt(formData.bedrooms),
          bathrooms: parseFloat(formData.bathrooms),
          maxGuests: parseInt(formData.maxGuests),
          roomCapacity: parseInt(formData.roomCapacity),
          personCapacity: parseInt(formData.personCapacity),
          maxPets: parseInt(formData.maxPets),
          adminEmail: session.user.email
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add property');
      }

      const newProperty = await response.json();
      onPropertyAdded(newProperty);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Add New Property</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">Price per Night</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="type">Property Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
              >
                {propertyTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                min="1"
                value={formData.bedrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                min="1"
                step="0.5"
                value={formData.bathrooms}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="maxGuests">Maximum Guests</label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                min="1"
                value={formData.maxGuests}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="roomCapacity">Room Capacity</label>
              <input
                type="number"
                id="roomCapacity"
                name="roomCapacity"
                min="1"
                value={formData.roomCapacity}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="personCapacity">Person Capacity</label>
              <input
                type="number"
                id="personCapacity"
                name="personCapacity"
                min="1"
                value={formData.personCapacity}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageUrl">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="petsAllowed"
                checked={formData.petsAllowed}
                onChange={handleChange}
              />
              Pets Allowed
            </label>
          </div>

          {formData.petsAllowed && (
            <div className={styles.formGroup}>
              <label htmlFor="maxPets">Maximum Pets</label>
              <input
                type="number"
                id="maxPets"
                name="maxPets"
                min="1"
                value={formData.maxPets}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Amenities</label>
            <div className={styles.amenitiesGrid}>
              {['WiFi', 'Kitchen', 'Air Conditioning', 'Heating', 'Pool', 'Parking', 
                'TV', 'Washer', 'Dryer', 'Gym', 'BBQ', 'Ocean View', 'Garden'].map(amenity => (
                <label key={amenity} className={styles.amenityLabel}>
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Adding...' : 'Add Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 