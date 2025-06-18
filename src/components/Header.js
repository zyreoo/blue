'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import styles from './Header.module.css';

export default function Header({ onTypeChange }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const suggestionsRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();
  const isLocationPage = pathname !== '/';

  useEffect(() => {
    if (isLocationPage) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLocationPage]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        return;
      }

      try {
        const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleTypeClick = (type) => {
    if (isLocationPage) {
      router.push('/');
    }
    
    const newType = type === selectedType ? null : type;
    setSelectedType(newType);
    
    const typeMap = {
      'hotel': 'House',
      'pensiune': 'Villa',
      'cabana': 'Cabin'
    };
    
    onTypeChange?.(newType ? typeMap[newType] : null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const formattedLocation = searchQuery.toLowerCase().replace(/\s+/g, '-');
      router.push(`/${formattedLocation}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location) => {
    const formattedLocation = location.toLowerCase().replace(/\s+/g, '-');
    router.push(`/${formattedLocation}`);
    setSearchQuery(location);
    setShowSuggestions(false);
  };

  return (
    <header className={`${styles.header} ${isScrolled && !isLocationPage ? styles.scrolled : ''} ${isLocationPage ? styles.static : ''}`}>
      <div className={styles.container}>
        <div className={styles.headerTop}>
          <div className={styles.navigation}>
            {isLocationPage && (
              <button 
                onClick={() => window.history.back()} 
                className={styles.backButton}
                aria-label="Go back"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>
            )}
            <a href="/" className={styles.homeLink}>
              Cazari Romania
            </a>
          </div>
          <div className={styles.accommodationTypes}>
            <button 
              className={`${styles.typeButton} ${selectedType === 'hotel' ? styles.selected : ''}`}
              onClick={() => handleTypeClick('hotel')}
            >
              <span className={styles.typeIcon}>🏨</span>
              <span>Hotel</span>
            </button>
            <button 
              className={`${styles.typeButton} ${selectedType === 'pensiune' ? styles.selected : ''}`}
              onClick={() => handleTypeClick('pensiune')}
            >
              <span className={styles.typeIcon}>🏡</span>
              <span>Pensiune</span>
            </button>
            <button 
              className={`${styles.typeButton} ${selectedType === 'cabana' ? styles.selected : ''}`}
              onClick={() => handleTypeClick('cabana')}
            >
              <span className={styles.typeIcon}>🌲</span>
              <span>Cabana</span>
            </button>
          </div>
          <a href="/profile" className={styles.profileButton} aria-label="Profile">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </a>
        </div>
        <div className={styles.searchContainer} ref={suggestionsRef}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Unde..."
                className={styles.searchInput}
                aria-label="Caută locații"
              />
              <button type="submit" className={styles.searchButton} aria-label="Caută">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className={styles.searchIcon}
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </div>
          </form>
          {showSuggestions && suggestions.length > 0 && (
            <ul className={styles.suggestions}>
              {suggestions.map((location, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(location)}
                    className={styles.suggestionButton}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className={styles.locationIcon}
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {location}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}

