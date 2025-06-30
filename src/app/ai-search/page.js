'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AISearch() {
  const [prompt, setPrompt] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');
    setSuggestions([]);

    try {
      const response = await fetch('/api/ai/location-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to get suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError('Sorry, something went wrong. Please try again.');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.container}>
        <main className={styles.main}>
          <div className={styles.content}>
            <div className={styles.heroSection}>
              <div className={styles.heroImageWrapper}>
                <Image
                  src="/robot-large.svg"
                  alt="AI Assistant"
                  width={120}
                  height={120}
                  className={styles.heroIcon}
                  priority
                />
                <div className={styles.glowEffect} />
              </div>
              <h1 className={styles.title}>AI Travel Assistant</h1>
              <p className={styles.subtitle}>
                Describe your ideal destination, and let our AI help you find the perfect place to stay
              </p>
            </div>

            <div className={styles.searchSection}>
              <div className={styles.searchCard}>
                <h2 className={styles.searchTitle}>How would you describe your perfect destination?</h2>
                <p className={styles.searchDescription}>
                  Try something like:
                  <br />
                  "A quiet mountain town with hiking trails and traditional restaurants"
                  <br />
                  "A beach destination with water sports and nightlife"
                </p>

                <form onSubmit={handleSubmit} className={styles.searchForm}>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your ideal destination..."
                    className={styles.searchInput}
                  />
                  <button 
                    type="submit" 
                    className={styles.searchButton}
                    disabled={isLoading}
                  >
                    Get Suggestions
                  </button>
                </form>

                {isLoading && (
                  <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Finding perfect matches for you...</p>
                  </div>
                )}

                {error && (
                  <div className={styles.error}>
                    {error}
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className={styles.suggestionCard}>
                        <h3>{suggestion.location}</h3>
                        <span className={styles.suggestionType}>{suggestion.type}</span>
                        <p className={styles.suggestionDescription}>{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
} 