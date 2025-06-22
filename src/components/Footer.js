"use client";
import React, { useState, useEffect } from 'react';
import './Footer.css';
import { useRouter } from 'next/navigation';

const Footer = () => {
  const [activeSection, setActiveSection] = useState('popular');
  const [prevSection, setPrevSection] = useState('popular');
  const [locations, setLocations] = useState({
    popular: { title: "Populare", locations: [] },
    beach: { title: "Litoral", locations: [] },
    mountains: { title: "Munte", locations: [] }
  });
  const router = useRouter();

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/properties');
        const properties = await response.json();
        
        const locationMap = properties.reduce((acc, property) => {
          if (!acc[property.location]) {
            acc[property.location] = {
              name: property.location,
              types: new Set()
            };
          }
          acc[property.location].types.add(property.type || 'Casă');
          return acc;
        }, {});

        const sortedLocations = Object.values(locationMap)
          .map(loc => ({
            name: loc.name,
            type: Array.from(loc.types)[0]
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const bookingsResponse = await fetch('/api/bookings');
        const topBookedLocations = await bookingsResponse.json();
        
        const popularLocations = topBookedLocations.map(booking => ({
          name: booking.location,
          type: locationMap[booking.location]?.types.values().next().value || 'Cazare de Lux'
        }));

        const remainingLocations = sortedLocations.filter(
          loc => !popularLocations.find(pop => pop.name === loc.name)
        );
        
        const midPoint = Math.ceil(remainingLocations.length / 2);
        
        setLocations({
          popular: {
            title: "Populare",
            locations: popularLocations
          },
          beach: {
            title: "Litoral",
            locations: remainingLocations.slice(0, midPoint)
          },
          mountains: {
            title: "Munte",
            locations: remainingLocations.slice(midPoint)
          }
        });
      } catch (error) {
        console.error('Eroare la încărcarea locațiilor:', error);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationClick = (locationName) => {
    const urlLocation = locationName.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${urlLocation}`);
  };

  const handleSectionChange = (newSection) => {
    setPrevSection(activeSection);
    setActiveSection(newSection);
    
    const buttons = Array.from(document.querySelectorAll('.category-button'));
    const prevIndex = buttons.findIndex(btn => btn.textContent.trim() === locations[prevSection].title);
    const newIndex = buttons.findIndex(btn => btn.textContent.trim() === locations[newSection].title);
    
    if (prevIndex !== -1 && newIndex !== -1) {
      const navRect = document.querySelector('.categories-nav').getBoundingClientRect();
      
      const startButton = buttons[prevIndex];
      const endButton = buttons[newIndex];
      const startRect = startButton.getBoundingClientRect();
      const endRect = endButton.getBoundingClientRect();
      
      const startX = startRect.left - navRect.left;
      const endX = endRect.left - navRect.left;
      const totalWidth = endX + endRect.width - startX;
      
      const underline = document.createElement('div');
      underline.style.position = 'absolute';
      underline.style.bottom = '0';
      underline.style.height = '2px';
      underline.style.backgroundColor = '#F0BB78';
      underline.style.transition = 'all 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)';
      
      underline.style.left = `${startX}px`;
      underline.style.width = `${startRect.width}px`;
      
      document.querySelector('.categories-nav').appendChild(underline);

      requestAnimationFrame(() => {
        if (newIndex > prevIndex) {
          underline.style.width = `${totalWidth}px`;
          setTimeout(() => {
            underline.style.left = `${endX}px`;
            underline.style.width = `${endRect.width}px`;
          }, 175);
        } else {
          underline.style.left = `${endX}px`;
          underline.style.width = `${totalWidth}px`;
          setTimeout(() => {
            underline.style.width = `${endRect.width}px`;
          }, 175);
        }
      });
      
      setTimeout(() => {
        underline.remove();
      }, 350);
    }
  };

  return (
    <footer className="footer">
      <div className="destinations-wrapper">
        <h2 className="destinations-header">Inspirație pentru viitoarele tale călătorii</h2>
        <div className="categories-nav">
          {Object.entries(locations).map(([key, { title }]) => (
            <button
              key={key}
              className={`category-button ${activeSection === key ? 'active' : ''}`}
              onClick={() => handleSectionChange(key)}
            >
              {title}
            </button>
          ))}
        </div>
        <div className="destinations-grid">
          {locations[activeSection].locations.map((location, index) => (
            <div 
              key={index} 
              className="destination-card"
              onClick={() => handleLocationClick(location.name)}
            >
              <h3>{location.name}</h3>
              <p>{location.type}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-content">
        <div className="footer-section">
          <h3>Contact</h3>
          <p>Contactează-ne pentru a-ți planifica călătoria perfectă la aceste destinații uimitoare. Experții noștri în călătorii sunt aici pentru a te ajuta să creezi amintiri de neuitat.</p>
        </div>
        <div className="footer-section">
          <h3>Despre Noi</h3>
          <p>Ne specializăm în prezentarea celor mai bune destinații din România, de la munții Carpați până la litoralul Mării Negre.</p>
        </div>
        <div className="footer-section">
          <h3>Link-uri Rapide</h3>
          <p>Descoperă mai multe despre serviciile noastre, ghiduri de călătorie și oferte speciale pentru a face aventura ta în România de neuitat.</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2024 Simone Marton. Toate drepturile rezervate.</p>
      </div>
    </footer>
  );
};

export default Footer;