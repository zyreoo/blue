'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './PropertyList.module.css';

export default function PropertyList({ properties, setProperties }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const handleDelete = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete property');
      
      setProperties(properties.filter(p => p._id !== propertyId));
    } catch (err) {
      alert('Error deleting property: ' + err.message);
    }
  };

  const handleStatusChange = async (propertyId, newStatus) => {
    const property = properties.find(p => p._id === propertyId);
    console.log(`Changing status for property ${propertyId} from ${property.status} to ${newStatus}`);
    
    setUpdatingStatus(propertyId);
    try {
      const response = await fetch(`/api/properties/${propertyId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      const data = await response.json();
      console.log('Status update response:', data);

      setProperties(properties.map(p => 
        p._id === propertyId ? { ...p, status: newStatus } : p
      ));
      
      console.log(`Successfully updated status in UI for property ${propertyId}`);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (!session) return <div className={styles.error}>Please sign in to access the admin panel</div>;
  if (loading) return <div className={styles.loading}>Loading properties...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!properties || properties.length === 0) return <div className={styles.empty}>No properties found. Add your first property to get started!</div>;

  const statusOptions = ['draft', 'pending', 'active', 'inactive'];

  return (
    <div className={styles.propertyList}>
      <div className={styles.header}>
        <h2>My Properties</h2>
      </div>

      <div className={styles.propertiesGrid}>
        {properties.map((property) => (
          <div key={property._id} className={styles.propertyCard}>
            <div className={styles.imageContainer}>
              <img 
                src={property.photos?.[0]?.url || '/placeholder-property.jpg'} 
                alt={property.description}
                className={styles.propertyImage}
              />
              <div className={styles.price}>
                ${property.pricing.basePrice}/night
              </div>
            </div>
            
            <div className={styles.cardContent}>
              <div className={styles.propertyTitle}>
                {property.description}
              </div>
              
              <div className={styles.location}>
                {property.location.city}, {property.location.country}
              </div>
              
              <div className={styles.details}>
                <span>{property.details.bedrooms} bedrooms</span>
                <span>•</span>
                <span>{property.details.bathrooms} bathrooms</span>
              </div>
              
              <div className={styles.propertyType}>
                {property.propertyType}
              </div>

              <div className={styles.statusContainer}>
                <select
                  className={`${styles.statusSelect} ${styles[property.status]}`}
                  value={property.status}
                  onChange={(e) => handleStatusChange(property._id, e.target.value)}
                  disabled={updatingStatus === property._id}
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.cardActions}>
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
          </div>
        ))}
      </div>
    </div>
  );
} 