'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import styles from './Header.module.css';

export default function Header({ onTypeChange }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const suggestionsRef = useRef(null);
  const profileMenuRef = useRef(null);
  const pathname = usePathname();
  const isLocationPage = pathname !== '/';

  const handleSignOut = async () => {
    try {
      setShowProfileMenu(false);
      await signOut({ 
        redirect: true,
        callbackUrl: '/'
      });
    } catch (error) {
      console.error('Eroare la deconectare:', error);
    }
  };

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
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
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
        const response = await fetch('/api/locations');
        if (!response.ok) throw new Error('Failed to fetch locations');
        const data = await response.json();
        
        // Filter locations based on search query
        const filteredLocations = data.filter(location => 
          location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.country.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSuggestions(filteredLocations);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching locations:', error);
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
      'hotel': 'Hotel',
      'pensiune': 'Pensiune',
      'cabana': 'Cabană'
    };
    
    onTypeChange?.(newType ? typeMap[newType] : null);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const selectedLocation = suggestions.find(loc => 
        `${loc.city}, ${loc.country}`.toLowerCase() === searchQuery.toLowerCase()
      );
      
      if (selectedLocation) {
        router.push(`/${selectedLocation.slug}`);
      } else {
        // If no exact match, use the first suggestion if available
        const firstSuggestion = suggestions[0];
        if (firstSuggestion) {
          router.push(`/${firstSuggestion.slug}`);
          setSearchQuery(`${firstSuggestion.city}, ${firstSuggestion.country}`);
        }
      }
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (location) => {
    router.push(`/${location.slug}`);
    setSearchQuery(`${location.city}, ${location.country}`);
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
                aria-label="Înapoi"
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
            <Link href="/" className={styles.homeLink}>
              Cazări România
            </Link>
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
              <span>Cabană</span>
            </button>
          </div>
          <div className={styles.profileSection} ref={profileMenuRef}>
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)} 
              className={styles.profileButton} 
              aria-label="Meniu profil"
            >
              {status === 'authenticated' && session?.user ? (
                <div className={styles.userAvatar}>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </div>
              ) : (
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
              )}
            </button>
            {showProfileMenu && (
              <div className={styles.profileMenu}>
                {status === 'authenticated' && session?.user ? (
                  <>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{session.user.name || session.user.email}</span>
                      <span className={styles.userEmail}>{session.user.email}</span>
                    </div>
                    <Link href="/profile" className={styles.menuItem} onClick={() => setShowProfileMenu(false)}>
                      Profilul Meu
                    </Link>
                    <button onClick={handleSignOut} className={`${styles.menuItem} ${styles.signOutButton}`}>
                      Deconectare
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/signin" className={styles.menuItem} onClick={() => setShowProfileMenu(false)}>
                      Conectare
                    </Link>
                    <Link href="/auth/signup" className={styles.menuItem} onClick={() => setShowProfileMenu(false)}>
                      Înregistrare
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        <div className={styles.searchContainer} ref={suggestionsRef}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <div className={styles.searchWrapper}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Caută locații..."
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
            {showSuggestions && suggestions.length > 0 && (
              <ul className={styles.suggestions}>
                {suggestions.map((location, index) => (
                  <li key={location.slug}>
                    <button 
                      className={styles.suggestionButton}
                      onClick={() => handleSuggestionClick(location)}
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
                      {location.city}, {location.country}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>
        </div>
      </div>
    </header>
  );
}