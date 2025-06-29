'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../auth.module.css';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Failed to send verification code');
      }

      setShowVerification(true);
      setLoading(false);
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      const verifyResponse = await fetch('/api/auth/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.email,
          code: verificationCode
        })
      });

      if (!verifyResponse.ok) {
        const data = await verifyResponse.json();
        throw new Error(data.error || 'Invalid verification code');
      }


      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      setError(error.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResendCode = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to resend code');
      }

      setError('New verification code sent!');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1>Sign In</h1>
        
        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {!showVerification ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.input}
                disabled={loading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.input}
                disabled={loading}
              />
              <Link href="/auth/forgot-password" className={styles.linkButton}>
                Forgot Password?
              </Link>
            </div>

            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Sending code...' : 'Continue'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerificationSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                required
                className={styles.input}
                disabled={loading}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <p className={styles.helperText}>
                Please enter the verification code sent to your email.
              </p>
              <button
                type="button"
                onClick={handleResendCode}
                className={styles.linkButton}
                disabled={loading}
              >
                Resend Code
              </button>
            </div>

            <button 
              type="submit" 
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Sign In'}
            </button>
          </form>
        )}

        <p className={styles.switchText}>
          Don't have an account? <Link href="/auth/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
} 