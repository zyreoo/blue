'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function EditProfile() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    location: '',
    phoneNumber: '',
    profileImage: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (status === 'loading') {
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await response.json();
        

        const [firstName = '', lastName = ''] = (userData.fullName || '').split(' ');
        
        setFormData({
          firstName,
          lastName,
          email: userData.email || '',
          bio: userData.bio || '',
          location: userData.location || '',
          phoneNumber: userData.phoneNumber || '',
          profileImage: userData.profileImage || ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim();
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fullName,
          firstName: undefined,
          lastName: undefined
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      router.push('/profile');
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingSpinner}>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => router.back()} className={styles.cancelButton}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.editProfileCard}>
        <h1 className={styles.title}>Edit Profile</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              {formData.profileImage ? (
                <Image
                  src={formData.profileImage}
                  alt="Profile"
                  width={120}
                  height={120}
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>Upload Photo</span>
                </div>
              )}
            </div>
            <button type="button" className={styles.uploadButton}>
              Change Photo
            </button>
          </div>

          <div className={styles.nameGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Your first name"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
                placeholder="Your last name"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              placeholder="Your email address"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={styles.input}
              placeholder="Your phone number"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={styles.input}
              placeholder="Your location"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className={styles.textarea}
              rows={4}
              placeholder="Tell us about yourself"
            />
          </div>

          <div className={styles.buttonGroup}>
            <button type="button" onClick={() => router.back()} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 