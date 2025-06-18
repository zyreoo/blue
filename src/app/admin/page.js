'use client';

import { useState } from 'react';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    imageUrl: '',
    type: 'House',
    description: '',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    roomCapacity: 1,
    personCapacity: 1,
    petsAllowed: false,
    maxPets: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const propertyTypes = ['Villa', 'Apartment', 'Cabin', 'House', 'Loft', 'Other'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add property');
      }

      setSuccess(true);
      setFormData({
        title: '',
        location: '',
        price: '',
        imageUrl: '',
        type: 'House',
        description: '',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        roomCapacity: 1,
        personCapacity: 1,
        petsAllowed: false,
        maxPets: 0
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header />
      <main className={styles.main}>
        <h1>Add New Property</h1>
        
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>Property added successfully!</div>}
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              minLength={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location *</label>
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
            <label htmlFor="price">Price per night *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageUrl">Image URL *</label>
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
            <label htmlFor="type">Property Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="bedrooms">Bedrooms</label>
              <input
                type="number"
                id="bedrooms"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="bathrooms">Bathrooms</label>
              <input
                type="number"
                id="bathrooms"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="maxGuests">Max Guests</label>
              <input
                type="number"
                id="maxGuests"
                name="maxGuests"
                value={formData.maxGuests}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="roomCapacity">Room Capacity *</label>
              <input
                type="number"
                id="roomCapacity"
                name="roomCapacity"
                value={formData.roomCapacity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="personCapacity">Person Capacity *</label>
              <input
                type="number"
                id="personCapacity"
                name="personCapacity"
                value={formData.personCapacity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="petsAllowed"
                name="petsAllowed"
                checked={formData.petsAllowed}
                onChange={handleChange}
              />
              <label htmlFor="petsAllowed">Pets Allowed</label>
            </div>
          </div>

          {formData.petsAllowed && (
            <div className={styles.formGroup}>
              <label htmlFor="maxPets">Maximum Pets</label>
              <input
                type="number"
                id="maxPets"
                name="maxPets"
                value={formData.maxPets}
                onChange={handleChange}
                min="0"
              />
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Adding Property...' : 'Add Property'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
} 