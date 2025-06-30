'use client';

import { useState } from 'react';
import styles from './AILocationSearch.module.css';
import LoadingSpinner from './LoadingSpinner';

export default function AILocationSearch({ onLocationSelect }) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/location-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Failed to get location suggestions');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError('Failed to get location suggestions. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearch} className={styles.form}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Describe your ideal destination (e.g., 'beach town with good restaurants')"
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : 'Get Suggestions'}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {results && (
        <div className={styles.results}>
          <h3>Suggested Locations:</h3>
          {results.suggestions.map((suggestion, index) => (
            <div key={index} className={styles.suggestion}>
              <h4>{suggestion.name}</h4>
              <p>{suggestion.description}</p>
              {suggestion.matchingProperties && (
                <p>{suggestion.matchingProperties} properties available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 