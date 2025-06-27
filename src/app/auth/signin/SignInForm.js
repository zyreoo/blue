'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: true,
        callbackUrl: '/profile'
      });
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const showSuccessMessage = searchParams.get('registered') === 'true';
  const showErrorMessage = searchParams.get('error') === 'true';

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {showSuccessMessage && (
        <p className={styles.success}>
          Registration successful! Please sign in.
        </p>
      )}
      
      {showErrorMessage && (
        <p className={styles.error}>
          Authentication failed. Please try again.
        </p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.inputGroup}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.inputGroup}>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className={styles.input}
        />
      </div>

      <button
        type="submit"
        className={styles.submitButton}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>

      <p className={styles.switchText}>
        Don't have an account?{' '}
        <Link href="/auth/signup" className={styles.link}>
          Sign Up
        </Link>
      </p>
    </form>
  );
} 