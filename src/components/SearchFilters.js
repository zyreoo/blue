'use client';

import { useState, useEffect } from 'react';
import styles from './SearchFilters.module.css';
import DateRangePicker from './DateRangePicker';

export default function SearchFilters({ onFiltersChange }) {
  const defaultFilters = {
    checkIn: null,
    checkOut: null,
    guests: {
      adults: 0,
      teens: 0,
      babies: 0
    },
    rooms: 1,
    priceRange: [0, 1000],
    propertyType: 'all',
    amenities: []
  };

  const [filters, setFilters] = useState(() => {
    // Try to load initial filters from localStorage
    if (typeof window !== 'undefined') {
      const savedFilters = localStorage.getItem('searchFilters');
      if (savedFilters) {
        try {
          const parsedFilters = JSON.parse(savedFilters);
          // Convert date strings back to Date objects
          if (parsedFilters.checkIn) parsedFilters.checkIn = new Date(parsedFilters.checkIn);
          if (parsedFilters.checkOut) parsedFilters.checkOut = new Date(parsedFilters.checkOut);
          // Ensure all required properties exist
          return {
            ...defaultFilters,
            ...parsedFilters
          };
        } catch (error) {
          console.error('Error parsing saved filters:', error);
          return defaultFilters;
        }
      }
    }
    return defaultFilters;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(`.${styles.filtersContainer}`) && !e.target.closest(`.${styles.toggleButton}`)) {
        setIsOpen(false);
        setActiveModal(null);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Notify parent and save to localStorage whenever filters change
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
    localStorage.setItem('searchFilters', JSON.stringify(filters));
  }, [filters, onFiltersChange]);

  const handleDateChange = ({ startDate, endDate, persons, rooms }) => {
    const newFilters = {
      ...filters,
      checkIn: startDate,
      checkOut: endDate,
      guests: persons,
      rooms
    };
    setFilters(newFilters);
  };

  const handlePriceChange = (event, type) => {
    const value = parseInt(event.target.value);
    let newMin = type === 'min' ? value : filters.priceRange[0];
    let newMax = type === 'max' ? value : filters.priceRange[1];

    if (type === 'min' && value > filters.priceRange[1]) {
      newMin = filters.priceRange[1];
    } else if (type === 'max' && value < filters.priceRange[0]) {
      newMax = filters.priceRange[0];
    }

    const newFilters = {
      ...filters,
      priceRange: [newMin, newMax]
    };
    setFilters(newFilters);
  };

  const handlePropertyTypeChange = (type) => {
    const newFilters = {
      ...filters,
      propertyType: type
    };
    setFilters(newFilters);
  };

  const handleAmenityToggle = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    const newFilters = {
      ...filters,
      amenities: newAmenities
    };
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    localStorage.removeItem('searchFilters');
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.propertyType !== 'all') count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.priceRange[0] > 0) count++;
    if (filters.guests.adults + filters.guests.teens + filters.guests.babies > 0) count++;
    return count;
  };

  return (
    <div className={styles.wrapper}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕ Close Filters' : '☰ Open Filters'}
      </button>

      {isOpen && (
        <div className={styles.filtersContainer}>
          <div className={styles.filtersHeader}>
            <h2>Filters</h2>
            <button 
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className={styles.filtersRow}>
            <button 
              className={`${styles.filterButton} ${activeModal === 'dates' ? styles.active : ''}`}
              onClick={() => setActiveModal(activeModal === 'dates' ? null : 'dates')}
            >
              <span>Dates</span>
              {filters.checkIn && filters.checkOut && (
                <span className={styles.filterValue}>
                  {new Date(filters.checkIn).toLocaleDateString()} - {new Date(filters.checkOut).toLocaleDateString()}
                </span>
              )}
            </button>

            <button 
              className={`${styles.filterButton} ${activeModal === 'guests' ? styles.active : ''}`}
              onClick={() => setActiveModal(activeModal === 'guests' ? null : 'guests')}
            >
              <span>Guests</span>
              {filters.guests.adults + filters.guests.teens + filters.guests.babies > 0 && (
                <span className={styles.filterValue}>
                  {filters.guests.adults + filters.guests.teens + filters.guests.babies} guests
                </span>
              )}
            </button>

            <button 
              className={`${styles.filterButton} ${activeModal === 'price' ? styles.active : ''}`}
              onClick={() => setActiveModal(activeModal === 'price' ? null : 'price')}
            >
              <span>Price</span>
              {filters.priceRange[0] > 0 && (
                <span className={styles.filterValue}>${filters.priceRange[0]}+</span>
              )}
            </button>

            <button 
              className={`${styles.filterButton} ${activeModal === 'type' ? styles.active : ''}`}
              onClick={() => setActiveModal(activeModal === 'type' ? null : 'type')}
            >
              <span>Property Type</span>
              {filters.propertyType !== 'all' && (
                <span className={styles.filterValue}>{filters.propertyType}</span>
              )}
            </button>

            <button 
              className={`${styles.filterButton} ${activeModal === 'amenities' ? styles.active : ''}`}
              onClick={() => setActiveModal(activeModal === 'amenities' ? null : 'amenities')}
            >
              <span>Amenities</span>
              {filters.amenities.length > 0 && (
                <span className={styles.filterValue}>{filters.amenities.length} selected</span>
              )}
            </button>

            {getActiveFiltersCount() > 0 && (
              <button 
                className={styles.clearButton}
                onClick={() => {
                  clearFilters();
                  setActiveModal(null);
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {activeModal === 'dates' && (
            <div className={styles.modal}>
              <DateRangePicker onDateChange={handleDateChange} />
            </div>
          )}

          {activeModal === 'price' && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Price range</h3>
                <div className={styles.priceRange}>
                  <div className={styles.priceInputs}>
                    <div className={styles.priceInputGroup}>
                      <label>min price</label>
                      <div className={styles.priceInputWrapper}>
                        <span>$</span>
                        <input
                          type="number"
                          min="0"
                          max={filters.priceRange[1]}
                          value={filters.priceRange[0]}
                          onChange={(e) => handlePriceChange(e, 'min')}
                        />
                      </div>
                    </div>
                    <div className={styles.priceSeparator}>-</div>
                    <div className={styles.priceInputGroup}>
                      <label>max price</label>
                      <div className={styles.priceInputWrapper}>
                        <span>$</span>
                        <input
                          type="number"
                          min={filters.priceRange[0]}
                          max="1000"
                          value={filters.priceRange[1]}
                          onChange={(e) => handlePriceChange(e, 'max')}
                        />
                      </div>
                    </div>
                  </div>
                  <div className={styles.priceSliders}>
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceChange(e, 'min')}
                      className={styles.minPriceSlider}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1000"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceChange(e, 'max')}
                      className={styles.maxPriceSlider}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'type' && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Property Type</h3>
                <div className={styles.propertyTypes}>
                  {['all', 'house', 'apartment', 'villa', 'cabin'].map(type => (
                    <button
                      key={type}
                      className={`${styles.typeButton} ${filters.propertyType === type ? styles.active : ''}`}
                      onClick={() => handlePropertyTypeChange(type)}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeModal === 'amenities' && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Amenities</h3>
                <div className={styles.amenities}>
                  {['wifi', 'pool', 'parking', 'ac', 'kitchen', 'tv'].map(amenity => (
                    <button
                      key={amenity}
                      className={`${styles.amenityButton} ${filters.amenities.includes(amenity) ? styles.active : ''}`}
                      onClick={() => handleAmenityToggle(amenity)}
                    >
                      {amenity.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 