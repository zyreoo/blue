'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/auth/signin');
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [properties, setProperties] = useState([]);
  const [editingProperty, setEditingProperty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
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

  const propertyTypes = ['Villa', 'Apartment', 'Cabin', 'House', 'Loft', 'Other'];


  useEffect(() => {
    if (session) {
      fetchUserProperties();
    }
  }, [session]);


  const fetchUserProperties = async () => {
    try {
      const response = await fetch('/api/properties/user');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError('Failed to load properties: ' + err.message);
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = value;
    
    if (type === 'text' && value && name !== 'imageUrl') {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const url = editingProperty ? `/api/properties/${editingProperty._id}` : '/api/properties';
      const method = editingProperty ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${editingProperty ? 'update' : 'add'} property`);
      }

      setSuccess(editingProperty ? 'Property updated successfully!' : 'Property added successfully!');
      resetForm();
      fetchUserProperties();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      location: property.location,
      price: property.price,
      imageUrl: property.imageUrl,
      type: property.type,
      description: property.description || '',
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      maxGuests: property.maxGuests,
      roomCapacity: property.roomCapacity,
      personCapacity: property.personCapacity,
      petsAllowed: property.petsAllowed,
      maxPets: property.maxPets
    });
    setShowForm(true);
  };

  const handleDelete = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete property');

      setProperties(prevProperties => prevProperties.filter(prop => prop._id !== propertyId));
      setSuccess('Property deleted successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePreview = (property) => {
    const locationSlug = property.location.toLowerCase().replace(/\s+/g, '-');
    window.open(`/${locationSlug}/${property._id}`, '_blank');
  };

  const resetForm = () => {
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
    setEditingProperty(null);
    setShowForm(false);
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className={styles.adminPage}>
      <Header />
      <main className={styles.main}>
        <div className={styles.adminHeader}>
          <h1>My Properties</h1>
          <button 
            onClick={() => {
              if (showForm && !editingProperty) {
                setShowForm(false);
              } else {
                resetForm();
                setShowForm(true);
              }
            }} 
            className={styles.addPropertyButton}
          >
            {showForm && !editingProperty ? 'Cancel' : 'Add New Property'}
          </button>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}

        <div className={styles.propertiesList}>
          {properties.map((property) => (
            <div key={property._id} className={styles.propertyCard}>
              <img src={property.imageUrl} alt={property.title} className={styles.propertyImage} />
              <div className={styles.propertyInfo}>
                <h3>{property.title}</h3>
                <p>{property.location}</p>
                <p>Price: ${property.price} per night</p>
                <p>Type: {property.type}</p>
                <div className={styles.propertyStats}>
                  <span>{property.bedrooms} beds</span>
                  <span>{property.bathrooms} baths</span>
                  <span>Max guests: {property.maxGuests}</span>
                </div>
                <div className={styles.propertyActions}>
                  <button 
                    onClick={() => handlePreview(property)}
                    className={styles.previewButton}
                  >
                    Preview
                  </button>
                  <button 
                    onClick={() => handleEdit(property)}
                    className={styles.editButton}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(property._id)}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {properties.length === 0 && !loading && (
            <p className={styles.noProperties}>You haven't listed any properties yet.</p>
          )}
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2>{editingProperty ? 'Edit Property' : 'Add New Property'}</h2>
            
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

            <div className={styles.formActions}>
              <button 
                type="button" 
                onClick={resetForm}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading 
                  ? (editingProperty ? 'Updating...' : 'Adding...') 
                  : (editingProperty ? 'Update Property' : 'Add Property')}
              </button>
            </div>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
} 