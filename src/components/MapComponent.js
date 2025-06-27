'use client';

import { useEffect, useState, useRef } from 'react';
import styles from './MapComponent.module.css';

export default function MapComponent({ onLocationSelect, initialLocation }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const containerRef = useRef(null);
  const defaultPosition = initialLocation || [44.4268, 26.1025];

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;

    let L;
    async function initializeMap() {
      try {
        const leaflet = await import('leaflet');
        L = leaflet.default;

        if (mapRef.current) return;

        const map = L.map(containerRef.current).setView(defaultPosition, 13);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        const icon = L.icon({
          iconUrl: '/marker-icon.png',
          iconRetinaUrl: '/marker-icon-2x.png',
          shadowUrl: '/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const marker = L.marker(defaultPosition, { icon }).addTo(map);
        markerRef.current = marker;

        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          marker.setLatLng([lat, lng]);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
            );
            const data = await response.json();
            
            const locationData = {
              address: data.display_name,
              city: data.address.city || data.address.town || data.address.village || '',
              country: data.address.country || '',
              lat,
              lng
            };
            
            onLocationSelect(locationData);
          } catch (error) {
            console.error('Error fetching location data:', error);
          }
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }

    initializeMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [defaultPosition, onLocationSelect]);

  const handleSearch = async (searchQuery) => {
    if (!mapRef.current || !markerRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        const { lat, lon } = data[0];
        const newLatLng = [parseFloat(lat), parseFloat(lon)];
        markerRef.current.setLatLng(newLatLng);
        mapRef.current.setView(newLatLng, 13);
        
        const reverseResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`
        );
        const reverseData = await reverseResponse.json();
        
        onLocationSelect({
          address: reverseData.display_name,
          city: reverseData.address.city || reverseData.address.town || reverseData.address.village || '',
          country: reverseData.address.country || '',
          lat: parseFloat(lat),
          lng: parseFloat(lon)
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  return (
    <div className={styles.mapContainer}>
      <div ref={containerRef} className={styles.map}></div>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search location..."
          className={styles.searchInput}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSearch(e.target.value);
              e.preventDefault();
            }
          }}
        />
      </div>
    </div>
  );
} 