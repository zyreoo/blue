'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import Image from 'next/image';


const translations = {
  common: {
    next: "Continuă",
    back: "Înapoi",
    save: "Salvează",
    cancel: "Anulează",
    loading: "Se încarcă...",
    saving: "Se salvează...",
    success: "Succes!",
    error: "Eroare!",
    required: "Câmp obligatoriu",
    per_night: "pe noapte",
    click_for_upload: "click pentru încărcare"
  },
  become_host: {
    property_type: {
      title: "Care dintre aceste opțiuni descrie cel mai bine locuința ta?",
      house: "Casă",
      apartment: "Apartament",
      barn: "Hambar",
      guesthouse: "Casă de oaspeți",
      boat: "Barcă",
      cabin: "Cabană",
      camper: "Rulotă",
      villa: "Vilă",
      castle: "Castel",
      cave: "Peșteră",
      container: "Container",
      cycladic: "Casă cicladică"
    },
    space_type: {
      title: "Ce tip de locuință vor avea la dispoziție oaspeții?",
      entire_place: "Întreaga locuință",
      private_room: "Cameră privată",
      shared_room: "Cameră comună"
    },
    location: {
      title: "Unde se află locuința?",
      address: "Adresa",
      address_placeholder: "Introduceți adresa",
      city: "Oraș",
      city_placeholder: "Introduceți orașul",
      country: "Țară",
      country_placeholder: "Introduceți țara"
    },
    details: {
      title: "Câți oaspeți pot fi găzduiți?",
      guests: "Număr maxim de oaspeți",
      bedrooms: "Dormitoare",
      beds: "Paturi",
      bathrooms: "Băi"
    },
    amenities: {
      title: "Ce facilități oferă spațiul tău?",
      essential: "Esențiale",
      features: "Caracteristici",
      safety: "Siguranță",
      entertainment: "Divertisment",
      wifi: "Wi-Fi",
      tv: "TV",
      kitchen: "Bucătărie",
      washer: "Mașină de spălat",
      pool: "Piscină",
      parking: "Parcare",
      ac: "Aer condiționat",
      heating: "Încălzire",
      smoke_detector: "Detector de fum",
      first_aid: "Trusă de prim ajutor",
      fire_extinguisher: "Stingător",
      security_cameras: "Camere de supraveghere",
      bbq: "Grătar",
      gym: "Sală de sport",
      bikes: "Biciclete",
      games: "Jocuri"
    },
    photos: {
      title: "Adaugă fotografii ale spațiului tău",
      description: "Fotografiile ajută oaspeții să își imagineze cum ar fi să stea în locul tău. Poți începe cu o fotografie și să adaugi mai multe după publicare.",
      drop_zone_text: "Trage fotografiile aici sau",
      main_photo: "Fotografie principală",
      tips_title: "Sfaturi pentru fotografii grozave:",
      tip1: "Folosește fotografii de înaltă calitate, minim 1024x683 pixeli",
      tip2: "Adaugă o varietate de fotografii: camere, exterior, facilități speciale",
      tip3: "Fotografiază în timpul zilei cu multă lumină naturală",
      tip4: "Arată spațiul exact așa cum îl vor găsi oaspeții"
    },
    pricing: {
      title: "Setează prețul pe noapte",
      price: "Preț pe noapte"
    },
    description: {
      title: "Descrie spațiul tău",
      placeholder: "Oferă o descriere detaliată a spațiului tău (minim 50 caractere)"
    },
    final: {
      title: "Felicitări! Ești aproape gata!",
      message: "Mulțumim că ai ales să devii gazdă pe platforma noastră. Anunțul tău va fi revizuit și publicat în cel mai scurt timp posibil.",
      preview: "Previzualizare anunț",
      type: "Tip proprietate",
      location: "Locație",
      price: "Preț",
      submit: "Publică anunțul"
    }
  }
};


const t = (key) => {
  const keys = key.split('.');
  let value = translations;
  for (const k of keys) {
    value = value[k];
    if (!value) return key;
  }
  return value;
};

const propertyTypes = [
  { id: 'house', label: t('become_host.property_type.house'), icon: '🏠' },
  { id: 'apartment', label: t('become_host.property_type.apartment'), icon: '🏢' },
  { id: 'barn', label: t('become_host.property_type.barn'), icon: '🏚' },
  { id: 'guesthouse', label: t('become_host.property_type.guesthouse'), icon: '🏨' },
  { id: 'boat', label: t('become_host.property_type.boat'), icon: '⛵' },
  { id: 'cabin', label: t('become_host.property_type.cabin'), icon: '🏡' },
  { id: 'camper', label: t('become_host.property_type.camper'), icon: '🚐' },
  { id: 'villa', label: t('become_host.property_type.villa'), icon: '🏘' },
  { id: 'castle', label: t('become_host.property_type.castle'), icon: '🏰' },
  { id: 'cave', label: t('become_host.property_type.cave'), icon: '🗿' },
  { id: 'container', label: t('become_host.property_type.container'), icon: '📦' },
  { id: 'cycladic', label: t('become_host.property_type.cycladic'), icon: '🏠' },
];

const spaceTypes = [
  {
    id: 'entire_place',
    title: t('become_host.space_type.entire_place'),
    description: 'Oaspeții au toată locuința la dispoziție.',
    icon: '🏠'
  },
  {
    id: 'private_room',
    title: t('become_host.space_type.private_room'),
    description: 'Oaspeții au propria cameră într-o locuință, plus acces la spațiile comune.',
    icon: '🚪'
  },
  {
    id: 'shared_room',
    title: t('become_host.space_type.shared_room'),
    description: 'Oaspeții dorm într-o cameră comună dintr-un hostel administrat profesionist, cu personal disponibil nonstop.',
    icon: '👥'
  }
];

const getPropertyTypeLabel = (type) => {
  const propertyType = propertyTypes.find(p => p.id === type);
  return propertyType ? propertyType.label : type;
};

const getSpaceTypeLabel = (type) => {
  const spaceType = spaceTypes.find(s => s.id === type);
  return spaceType ? spaceType.title : type;
};

export default function BecomeHostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('property_type');
  const [formData, setFormData] = useState({
    propertyType: '',
    spaceType: '',
    location: {
      address: '',
      city: '',
      country: ''
    },
    description: '',
    amenities: [],
    photos: [],
    pricePerNight: '',
    maxGuests: '1',
    bedrooms: '1',
    beds: '1',
    bathrooms: '1',
  });
  const [draggedPhoto, setDraggedPhoto] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    'property_type',
    'space_type',
    'location',
    'details',
    'amenities',
    'photos',
    'pricing',
    'description',
    'final'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'address' || name === 'city' || name === 'country') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const nextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handlePropertyTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, propertyType: type }));
    nextStep();
  };

  const handleSpaceTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, spaceType: type }));
    nextStep();
  };

  const handleAmenitiesChange = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            photos: [...prev.photos, {
              id: `photo-${Date.now()}-${prev.photos.length}`,
              url: e.target.result,
              file: file
            }]
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(formData.photos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFormData(prev => ({
      ...prev,
      photos: items
    }));
  };

  const handleRemovePhoto = (photoId) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo.id !== photoId)
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/hosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyType: formData.propertyType,
          spaceType: formData.spaceType,
          location: formData.location,
          maxGuests: parseInt(formData.maxGuests),
          bedrooms: parseInt(formData.bedrooms),
          beds: parseInt(formData.beds),
          bathrooms: parseInt(formData.bathrooms),
          amenities: formData.amenities,
          photos: formData.photos,
          pricePerNight: parseFloat(formData.pricePerNight),
          description: formData.description
        }),
      });

      if (response.ok) {
        const result = await response.json();
        router.push('/profile?success=true&propertyId=' + result.property._id);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create property');
      }
    } catch (error) {

      alert(t('common.error') + ': ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'property_type':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.property_type.title')}</h2>
            <div className={styles.propertyTypeGrid}>
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  className={`${styles.propertyTypeCard} ${
                    formData.propertyType === type.id ? styles.selected : ''
                  }`}
                  onClick={() => handlePropertyTypeSelect(type.id)}
                >
                  <span className={styles.propertyIcon}>{type.icon}</span>
                  <span className={styles.propertyLabel}>{type.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'space_type':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.space_type.title')}</h2>
            <div className={styles.spaceTypeGrid}>
              {spaceTypes.map((type) => (
                <button
                  key={type.id}
                  className={`${styles.spaceTypeCard} ${
                    formData.spaceType === type.id ? styles.selected : ''
                  }`}
                  onClick={() => handleSpaceTypeSelect(type.id)}
                >
                  <span className={styles.spaceIcon}>{type.icon}</span>
                  <div className={styles.spaceInfo}>
                    <h3>{type.title}</h3>
                    <p>{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        );

      case 'location':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.location.title')}</h2>
            <div className={styles.locationForm}>
              <div className={styles.formGroup}>
                <label htmlFor="address">{t('become_host.location.address')}</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.location.address}
                  onChange={handleChange}
                  placeholder={t('become_host.location.address_placeholder')}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">{t('become_host.location.city')}</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.location.city}
                    onChange={handleChange}
                    placeholder={t('become_host.location.city_placeholder')}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="country">{t('become_host.location.country')}</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.location.country}
                    onChange={handleChange}
                    placeholder={t('become_host.location.country_placeholder')}
                    required
                  />
                </div>
              </div>
              <button
                className={styles.nextButton}
                onClick={() => setCurrentStep('details')}
              >
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        );

      case 'details':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.details.title')}</h2>
            <div className={styles.guestDetailsForm}>
              <div className={styles.formGroup}>
                <label>{t('become_host.details.guests')}</label>
                <div className={styles.counterInput}>
                  <button 
                    type="button"
                    onClick={() => handleChange({ 
                      target: { 
                        name: 'maxGuests', 
                        value: Math.max(1, parseInt(formData.maxGuests || 1) - 1)
                      }
                    })}
                    className={styles.counterButton}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="maxGuests"
                    value={formData.maxGuests || 1}
                    onChange={handleChange}
                    min="1"
                    className={styles.counterValue}
                    readOnly
                  />
                  <button 
                    type="button"
                    onClick={() => handleChange({ 
                      target: { 
                        name: 'maxGuests', 
                        value: parseInt(formData.maxGuests || 1) + 1
                      }
                    })}
                    className={styles.counterButton}
                  >
                    +
                  </button>
                </div>
              </div>

              {formData.spaceType !== 'private_room' && (
                <>
                  <div className={styles.formGroup}>
                    <label>{t('become_host.details.bedrooms')}</label>
                    <div className={styles.counterInput}>
                      <button 
                        type="button"
                        onClick={() => handleChange({ 
                          target: { 
                            name: 'bedrooms', 
                            value: Math.max(1, parseInt(formData.bedrooms || 1) - 1)
                          }
                        })}
                        className={styles.counterButton}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        name="bedrooms"
                        value={formData.bedrooms || 1}
                        onChange={handleChange}
                        min="1"
                        className={styles.counterValue}
                        readOnly
                      />
                      <button 
                        type="button"
                        onClick={() => handleChange({ 
                          target: { 
                            name: 'bedrooms', 
                            value: parseInt(formData.bedrooms || 1) + 1
                          }
                        })}
                        className={styles.counterButton}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>{t('become_host.details.beds')}</label>
                    <div className={styles.counterInput}>
                      <button 
                        type="button"
                        onClick={() => handleChange({ 
                          target: { 
                            name: 'beds', 
                            value: Math.max(1, parseInt(formData.beds || 1) - 1)
                          }
                        })}
                        className={styles.counterButton}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        name="beds"
                        value={formData.beds || 1}
                        onChange={handleChange}
                        min="1"
                        className={styles.counterValue}
                        readOnly
                      />
                      <button 
                        type="button"
                        onClick={() => handleChange({ 
                          target: { 
                            name: 'beds', 
                            value: parseInt(formData.beds || 1) + 1
                          }
                        })}
                        className={styles.counterButton}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label>{t('become_host.details.bathrooms')}</label>
                <div className={styles.counterInput}>
                  <button 
                    type="button"
                    onClick={() => handleChange({ 
                      target: { 
                        name: 'bathrooms', 
                        value: Math.max(1, parseInt(formData.bathrooms || 1) - 1)
                      }
                    })}
                    className={styles.counterButton}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms || 1}
                    onChange={handleChange}
                    min="1"
                    className={styles.counterValue}
                    readOnly
                  />
                  <button 
                    type="button"
                    onClick={() => handleChange({ 
                      target: { 
                        name: 'bathrooms', 
                        value: parseInt(formData.bathrooms || 1) + 1
                      }
                    })}
                    className={styles.counterButton}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={styles.nextButton}
                onClick={() => setCurrentStep('amenities')}
              >
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        );

      case 'amenities':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.amenities.title')}</h2>
            <div className={styles.amenitiesForm}>
              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.essential')}</h3>
                <div className={styles.amenityGrid}>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('wifi') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('wifi')}
                  >
                    <span className={styles.amenityIcon}>📶</span>
                    <span>{t('become_host.amenities.wifi')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('tv') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('tv')}
                  >
                    <span className={styles.amenityIcon}>📺</span>
                    <span>{t('become_host.amenities.tv')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('kitchen') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('kitchen')}
                  >
                    <span className={styles.amenityIcon}>🍳</span>
                    <span>{t('become_host.amenities.kitchen')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('washer') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('washer')}
                  >
                    <span className={styles.amenityIcon}>🧺</span>
                    <span>{t('become_host.amenities.washer')}</span>
                  </button>
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.features')}</h3>
                <div className={styles.amenityGrid}>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('pool') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('pool')}
                  >
                    <span className={styles.amenityIcon}>🏊‍♂️</span>
                    <span>{t('become_host.amenities.pool')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('parking') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('parking')}
                  >
                    <span className={styles.amenityIcon}>🅿️</span>
                    <span>{t('become_host.amenities.parking')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('ac') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('ac')}
                  >
                    <span className={styles.amenityIcon}>❄️</span>
                    <span>{t('become_host.amenities.ac')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('heating') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('heating')}
                  >
                    <span className={styles.amenityIcon}>🔥</span>
                    <span>{t('become_host.amenities.heating')}</span>
                  </button>
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.safety')}</h3>
                <div className={styles.amenityGrid}>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('smoke_detector') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('smoke_detector')}
                  >
                    <span className={styles.amenityIcon}>🚭</span>
                    <span>{t('become_host.amenities.smoke_detector')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('first_aid') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('first_aid')}
                  >
                    <span className={styles.amenityIcon}>🏥</span>
                    <span>{t('become_host.amenities.first_aid')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('fire_extinguisher') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('fire_extinguisher')}
                  >
                    <span className={styles.amenityIcon}>🧯</span>
                    <span>{t('become_host.amenities.fire_extinguisher')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('security_cameras') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('security_cameras')}
                  >
                    <span className={styles.amenityIcon}>📹</span>
                    <span>{t('become_host.amenities.security_cameras')}</span>
                  </button>
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.entertainment')}</h3>
                <div className={styles.amenityGrid}>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('bbq') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('bbq')}
                  >
                    <span className={styles.amenityIcon}>🍖</span>
                    <span>{t('become_host.amenities.bbq')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('gym') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('gym')}
                  >
                    <span className={styles.amenityIcon}>💪</span>
                    <span>{t('become_host.amenities.gym')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('bikes') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('bikes')}
                  >
                    <span className={styles.amenityIcon}>🚲</span>
                    <span>{t('become_host.amenities.bikes')}</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.amenityButton} ${
                      formData.amenities.includes('games') ? styles.selected : ''
                    }`}
                    onClick={() => handleAmenitiesChange('games')}
                  >
                    <span className={styles.amenityIcon}>🎮</span>
                    <span>{t('become_host.amenities.games')}</span>
                  </button>
                </div>
              </div>

              <button
                className={styles.nextButton}
                onClick={() => setCurrentStep('photos')}
              >
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        );

      case 'photos':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.photos.title')}</h2>
            <p className={styles.stepDescription}>
              {t('become_host.photos.description')}
            </p>

            <div className={styles.photoUploadSection}>
              <div 
                className={styles.dropZone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.add(styles.dragOver);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.dragOver);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.currentTarget.classList.remove(styles.dragOver);
                  const files = Array.from(e.dataTransfer.files);
                  const imageFiles = files.filter(file => file.type.startsWith('image/'));
                  if (imageFiles.length > 0) {
                    handleFileUpload({ target: { files: imageFiles } });
                  }
                }}
              >
                <div className={styles.uploadIcon}>📸</div>
                <p>{t('become_host.photos.drop_zone_text')} <span>{t('common.click_for_upload')}</span></p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className={styles.fileInput}
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                />
              </div>

              {formData.photos.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="photos" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={styles.photoGrid}
                      >
                        {formData.photos.map((photo, index) => (
                          <Draggable
                            key={photo.id}
                            draggableId={photo.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${styles.photoItem} ${
                                  index === 0 ? styles.mainPhoto : ''
                                } ${snapshot.isDragging ? styles.dragging : ''}`}
                              >
                                <img src={photo.url} alt={`Property photo ${index + 1}`} />
                                <button
                                  type="button"
                                  className={styles.removePhoto}
                                  onClick={() => handleRemovePhoto(photo.id)}
                                >
                                  ✕
                                </button>
                                {index === 0 && (
                                  <div className={styles.mainPhotoLabel}>
                                    {t('become_host.photos.main_photo')}
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>

            <div className={styles.photoTips}>
              <h3>{t('become_host.photos.tips_title')}</h3>
              <ul>
                <li>{t('become_host.photos.tip1')}</li>
                <li>{t('become_host.photos.tip2')}</li>
                <li>{t('become_host.photos.tip3')}</li>
                <li>{t('become_host.photos.tip4')}</li>
              </ul>
            </div>

            <button
              className={styles.nextButton}
              onClick={() => setCurrentStep('pricing')}
              disabled={formData.photos.length === 0}
            >
              {t('common.next')}
            </button>
          </motion.div>
        );

      case 'pricing':
        return (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={styles.stepContainer}
          >
            <h2 className={styles.stepTitle}>{t('become_host.pricing.title')}</h2>
            <div className={styles.guestDetailsForm}>
              <div className={styles.formGroup}>
                <label>{t('become_host.pricing.price')}</label>
                <div className={styles.counterInput}>
                  <button 
                    type="button"
                    onClick={() => handleChange({ 
                      target: { 
                        name: 'pricePerNight', 
                        value: Math.max(0, parseFloat(formData.pricePerNight || 0) - 0.1)
                      }
                    })}
                    className={styles.counterButton}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight || 0}
                    onChange={handleChange}
                    min="0"
                    className={styles.counterValue}
                    readOnly
                  />
                  <button 
                    type="button"
                    onClick={() => handleChange({ 
                      target: { 
                        name: 'pricePerNight', 
                        value: parseFloat(formData.pricePerNight || 0) + 0.1
                      }
                    })}
                    className={styles.counterButton}
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                className={styles.nextButton}
                onClick={() => setCurrentStep('description')}
              >
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        );

      case 'description':
        return (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={styles.formStep}
          >
            <h2>{t('become_host.description.title')}</h2>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('become_host.description.placeholder')}
              className={styles.textarea}
              rows={6}
            />
            <div className={styles.navigationButtons}>
              <button onClick={() => setCurrentStep('amenities')} className={styles.backButton}>
                {t('common.back')}
              </button>
              <button 
                onClick={() => setCurrentStep('final')}
                className={styles.nextButton}
                disabled={!formData.description || formData.description.length < 50}
              >
                {t('common.next')}
              </button>
            </div>
          </motion.div>
        );

      case 'final':
        return (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`${styles.formStep} ${styles.finalStep}`}
          >
            <div className={styles.thankYouContainer}>
              <h2>{t('become_host.final.title')}</h2>
              <p>{t('become_host.final.message')}</p>
              <div className={styles.propertyPreview}>
                <h3>{t('become_host.final.preview')}</h3>
                <div className={styles.previewDetails}>
                  <div>
                    <strong>{t('become_host.final.type')}:</strong> {getPropertyTypeLabel(formData.propertyType)}
                  </div>
                  <div>
                    <strong>Space Type:</strong> {getSpaceTypeLabel(formData.spaceType)}
                  </div>
                  <div>
                    <strong>{t('become_host.final.location')}:</strong> {formData.location?.city || formData.location.city}, {formData.location?.country || formData.location.country}
                  </div>
                  <div>
                    <strong>Address:</strong> {formData.location?.address || formData.location.address}
                  </div>
                  <div>
                    <strong>{t('become_host.final.price')}:</strong> ${formData.pricePerNight} {t('common.per_night')}
                  </div>
                  <div>
                    <strong>Details:</strong> {formData.bedrooms} bedrooms, {formData.bathrooms} bathrooms, up to {formData.maxGuests} guests
                  </div>
                  {formData.amenities.length > 0 && (
                    <div>
                      <strong>Amenities:</strong> {formData.amenities.join(', ')}
                    </div>
                  )}
                </div>
                {formData.photos.length > 0 && (
                  <div className={styles.previewPhoto}>
                    <Image
                      src={formData.photos[0].url}
                      alt="Property preview"
                      width={300}
                      height={200}
                      objectFit="cover"
                    />
                  </div>
                )}
              </div>
              <div className={styles.navigationButtons}>
                <button onClick={prevStep} className={styles.backButton}>
                  {t('common.back')}
                </button>
                <button 
                  onClick={handleSubmit}
                  className={`${styles.submitButton} ${styles.pulsingButton}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className={styles.loadingSpinner}>
                      <div className={styles.spinner}></div>
                      {t('common.saving')}
                    </div>
                  ) : (
                    t('become_host.final.submit')
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!session) {
    return (
      <div>
        <Header />
        <div className={styles.container}>
          <h1>Please sign in to become a host</h1>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className={styles.container}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${(steps.indexOf(currentStep) / steps.length) * 100}%` }}
          />
        </div>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
} 