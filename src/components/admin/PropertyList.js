'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import styles from './PropertyList.module.css';

export default function PropertyList({ properties, setProperties }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (session) {
      fetchProperties();
    }
  }, [session]);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties?admin=true');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete property');
      
      // Remove the property from the list
      setProperties(properties.filter(p => p._id !== propertyId));
    } catch (err) {
      alert('Error deleting property: ' + err.message);
    }
  };

  if (!session) return <div className={styles.error}>Please sign in to access the admin panel</div>;
  if (loading) return <div className={styles.loading}>Loading properties...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (properties.length === 0) return <div className={styles.empty}>No properties found.</div>;

  return (
    <div className={styles.propertyList}>
      <div className={styles.header}>
        <h2>My Properties</h2>
        <button className={styles.addButton}>Add New Property</button>
      </div>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.cell}>Property</div>
          <div className={styles.cell}>Location</div>
          <div className={styles.cell}>Price</div>
          <div className={styles.cell}>Type</div>
          <div className={styles.cell}>Actions</div>
        </div>

        {properties.map((property) => (
          <div key={property._id} className={styles.tableRow}>
            <div className={styles.cell}>
              <div className={styles.propertyInfo}>
                <img 
                  src={property.imageUrl} 
                  alt={property.title}
                  className={styles.propertyImage}
                />
                <div>
                  <div className={styles.propertyTitle}>{property.title}</div>
                  <div className={styles.propertyDescription}>{property.description}</div>
                </div>
              </div>
            </div>
            <div className={styles.cell}>{property.location}</div>
            <div className={styles.cell}>${property.price}/night</div>
            <div className={styles.cell}>{property.type}</div>
            <div className={styles.cell}>
              <button 
                className={styles.editButton}
                onClick={() => window.location.href = `/admin/properties/${property._id}/edit`}
              >
                Edit
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDelete(property._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 