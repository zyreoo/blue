'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from './page.module.css';
import Image from 'next/image';
import { AmenityIcons } from '@/components/icons/AmenityIcons';


const MapComponent = dynamic(
  () => import('@/components/MapComponent'),
  { ssr: false }
);

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
      entertainment: "Divertisment & Confort",
      bathroom: "Baie & Spa",
      bedroom: "Dormitor",
      kitchen: "Bucătărie & Dining",
      outdoor: "Exterior",
      accessibility: "Accesibilitate",
      work: "Spațiu de lucru",
      
      // Essential amenities
      wifi: "Wi-Fi",
      tv: "TV",
      kitchen: "Bucătărie",
      washer: "Mașină de spălat",
      workspace: "Spațiu de lucru",
      dryer: "Uscător",
      dishwasher: "Mașină de spălat vase",

      // Bathroom amenities
      hair_dryer: "Uscător de păr",
      toiletries: "Articole de toaletă",
      hot_tub: "Cadă cu hidromasaj",

      // Bedroom amenities
      iron: "Fier de călcat",
      hangers: "Umerașe",
      extra_pillows: "Perne suplimentare",


      pool: "Piscină",
      parking: "Parcare",
      balcony: "Balcon",
      garden: "Grădină",
      beach_access: "Acces la plajă",
      bbq: "Grătar",
      outdoor_dining: "Dining în aer liber",


      smart_tv: "Smart TV",
      streaming: "Servicii streaming",
      games: "Jocuri",
      board_games: "Jocuri de societate",
      sound_system: "Sistem audio",


      coffee_maker: "Espressor",
      microwave: "Cuptor cu microunde",
      wine_glasses: "Pahare de vin",
      dining_table: "Masă de dining",

      // Climate & Safety
      ac: "Aer condiționat",
      heating: "Încălzire",
      smoke_detector: "Detector de fum",
      first_aid: "Trusă de prim ajutor",
      fire_extinguisher: "Stingător",
      security_cameras: "Camere de supraveghere",

      // Accessibility
      elevator: "Lift",
      ground_floor: "Parter",
      wide_doorway: "Uși late",

      // Work & Study
      desk: "Birou",
      monitor: "Monitor",
      printer: "Imprimantă"
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


const propertySpaceTypes = {
  house: [
    {
      id: 'entire_place',
      title: 'Întreaga casă',
      description: 'Oaspeții au acces la întreaga casă, inclusiv toate camerele și facilitățile.',
      icon: '🏠'
    },
    {
      id: 'private_room',
      title: 'Cameră privată',
      description: 'Oaspeții au propria cameră într-o casă, plus acces la spațiile comune.',
      icon: '🚪'
    }
  ],
  apartment: [
    {
      id: 'entire_place',
      title: 'Întregul apartament',
      description: 'Oaspeții au acces la întregul apartament.',
      icon: '🏢'
    },
    {
      id: 'private_room',
      title: 'Cameră privată',
      description: 'Oaspeții au propria cameră într-un apartament, plus acces la spațiile comune.',
      icon: '🚪'
    },
    {
      id: 'shared_room',
      title: 'Cameră comună',
      description: 'Oaspeții împart camera cu alți oaspeți sau cu gazda.',
      icon: '👥'
    }
  ],
  barn: [
    {
      id: 'entire_place',
      title: 'Întregul hambar',
      description: 'Oaspeții au acces la întregul hambar renovat.',
      icon: '🏚'
    }
  ],
  guesthouse: [
    {
      id: 'entire_place',
      title: 'Întreaga casă de oaspeți',
      description: 'Oaspeții au acces la întreaga casă de oaspeți.',
      icon: '🏨'
    },
    {
      id: 'private_room',
      title: 'Cameră privată',
      description: 'Oaspeții au propria cameră în casa de oaspeți.',
      icon: '🚪'
    }
  ],
  boat: [
    {
      id: 'entire_place',
      title: 'Întreaga barcă',
      description: 'Oaspeții au acces la întreaga barcă.',
      icon: '⛵'
    },
    {
      id: 'private_cabin',
      title: 'Cabină privată',
      description: 'Oaspeții au propria cabină pe barcă.',
      icon: '🛏'
    }
  ],
  cabin: [
    {
      id: 'entire_place',
      title: 'Întreaga cabană',
      description: 'Oaspeții au acces la întreaga cabană.',
      icon: '🏡'
    }
  ],
  camper: [
    {
      id: 'entire_place',
      title: 'Întreaga rulotă',
      description: 'Oaspeții au acces la întreaga rulotă.',
      icon: '🚐'
    }
  ],
  villa: [
    {
      id: 'entire_place',
      title: 'Întreaga vilă',
      description: 'Oaspeții au acces la întreaga vilă.',
      icon: '🏘'
    }
  ],
  castle: [
    {
      id: 'entire_place',
      title: 'Întregul castel',
      description: 'Oaspeții au acces la întregul castel.',
      icon: '🏰'
    },
    {
      id: 'private_wing',
      title: 'Aripă privată',
      description: 'Oaspeții au acces la o aripă privată a castelului.',
      icon: '🏰'
    },
    {
      id: 'private_room',
      title: 'Cameră privată',
      description: 'Oaspeții au propria cameră în castel.',
      icon: '🚪'
    }
  ],
  cave: [
    {
      id: 'entire_place',
      title: 'Întreaga peșteră',
      description: 'Oaspeții au acces la întreaga peșteră amenajată.',
      icon: '🗿'
    }
  ],
  container: [
    {
      id: 'entire_place',
      title: 'Întregul container',
      description: 'Oaspeții au acces la întregul container amenajat.',
      icon: '📦'
    }
  ],
  cycladic: [
    {
      id: 'entire_place',
      title: 'Întreaga casă cicladică',
      description: 'Oaspeții au acces la întreaga casă cicladică.',
      icon: '🏠'
    },
    {
      id: 'private_room',
      title: 'Cameră privată',
      description: 'Oaspeții au propria cameră într-o casă cicladică.',
      icon: '🚪'
    }
  ]
};

const defaultSpaceTypes = [
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
  }
];

const getPropertyTypeLabel = (type) => {
  const propertyType = propertyTypes.find(p => p.id === type);
  return propertyType ? propertyType.label : type;
};

const getSpaceTypeLabel = (type) => {
  const spaceType = propertySpaceTypes[type] || defaultSpaceTypes.find(s => s.id === type);
  return spaceType ? spaceType.title : type;
};

export default function BecomeHostPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [currentStep, setCurrentStep] = useState('property_type');
  const isExistingHost = router.searchParams?.get('isExistingHost') === 'true';
  
  const [formData, setFormData] = useState({
    propertyType: '',
    spaceType: '',
    location: {
      address: '',
      city: '',
      country: '',
      lat: null,
      lng: null
    },
    description: '',
    amenities: [],
    photos: [],
    primaryPhotoId: null,
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
    
    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Use both timestamp and a random number to ensure uniqueness
          const newPhotoId = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          setFormData(prev => {
            // Check if this photo ID already exists
            if (prev.photos.some(photo => photo.id === newPhotoId)) {
              console.warn('Duplicate photo ID detected, skipping...');
              return prev;
            }
            
            return {
              ...prev,
              photos: [...prev.photos, {
                id: newPhotoId,
                url: e.target.result,
                file: file
              }],
              primaryPhotoId: prev.primaryPhotoId || newPhotoId
            };
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSetPrimaryPhoto = (photoId) => {
    if (photoId === formData.primaryPhotoId) {
      return;
    }
    
    // Verify the photo exists before setting it as primary
    if (!formData.photos.some(photo => photo.id === photoId)) {
      console.error('Attempted to set non-existent photo as primary');
      return;
    }

    setFormData(prev => ({
      ...prev,
      primaryPhotoId: photoId
    }));
  };

  const handleRemovePhoto = (photoId) => {
    setFormData(prev => {
      // Find the photo to be removed
      const photoToRemove = prev.photos.find(photo => photo.id === photoId);
      if (!photoToRemove) {
        console.error('Attempted to remove non-existent photo');
        return prev;
      }

      const newPhotos = prev.photos.filter(photo => photo.id !== photoId);
      let newPrimaryPhotoId = prev.primaryPhotoId;

      // If we're removing the primary photo, set the first remaining photo as primary
      if (photoId === prev.primaryPhotoId) {
        newPrimaryPhotoId = newPhotos.length > 0 ? newPhotos[0].id : null;
      }
      
      return {
        ...prev,
        photos: newPhotos,
        primaryPhotoId: newPrimaryPhotoId
      };
    });
  };

  const movePhoto = (index, direction) => {
    if (index < 0 || index >= formData.photos.length) {
      console.error('Invalid photo index for moving');
      return;
    }

    setFormData(prev => {
      const newPhotos = [...prev.photos];
      if (direction === 'up' && index > 0) {
        [newPhotos[index], newPhotos[index - 1]] = [newPhotos[index - 1], newPhotos[index]];
      } else if (direction === 'down' && index < newPhotos.length - 1) {
        [newPhotos[index], newPhotos[index + 1]] = [newPhotos[index + 1], newPhotos[index]];
      }
      return {
        ...prev,
        photos: newPhotos
      };
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.location.city || !formData.location.country || !formData.location.address) {
        throw new Error('Please fill in all location fields');
      }

      // For existing hosts, we'll update their user document
      const response = await fetch('/api/hosts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyType: formData.propertyType,
          spaceType: formData.spaceType,
          address: formData.location.address,
          city: formData.location.city,
          country: formData.location.country,
          maxGuests: parseInt(formData.maxGuests),
          bedrooms: parseInt(formData.bedrooms),
          beds: parseInt(formData.beds),
          bathrooms: parseInt(formData.bathrooms),
          amenities: formData.amenities,
          photos: formData.photos,
          pricePerNight: parseFloat(formData.pricePerNight),
          description: formData.description || `Beautiful ${formData.propertyType} in ${formData.location.city}`,
          // Include user email for existing hosts
          userEmail: isExistingHost ? session?.user?.email : undefined
        }),
      });

      if (response.ok) {
        const result = await response.json();
        // Redirect back to admin for existing hosts
        if (isExistingHost) {
          router.push('/admin?success=true&propertyId=' + result.property._id);
        } else {
          router.push('/profile?success=true&propertyId=' + result.property._id);
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create property');
      }
    } catch (error) {
      console.error('Error submitting property:', error);
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
              {(propertySpaceTypes[formData.propertyType] || defaultSpaceTypes).map((type) => (
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
              <div className={styles.mapContainer}>
                <MapComponent
                  onLocationSelect={(locationData) => {
                    setFormData(prev => ({
                      ...prev,
                      location: {
                        address: locationData.address,
                        city: locationData.city,
                        country: locationData.country,
                        lat: locationData.lat,
                        lng: locationData.lng
                      }
                    }));
                  }}
                  initialLocation={formData.location.lat && formData.location.lng 
                    ? [formData.location.lat, formData.location.lng] 
                    : null
                  }
                />
              </div>
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
                disabled={!formData.location.address || !formData.location.city || !formData.location.country}
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
                  {['wifi', 'kitchen', 'washer', 'dryer', 'dishwasher', 'workspace'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.bathroom')}</h3>
                <div className={styles.amenityGrid}>
                  {['hair_dryer', 'toiletries', 'hot_tub'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.bedroom')}</h3>
                <div className={styles.amenityGrid}>
                  {['iron', 'hangers', 'extra_pillows'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.kitchen')}</h3>
                <div className={styles.amenityGrid}>
                  {['microwave', 'coffee_maker', 'wine_glasses', 'dining_table'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.outdoor')}</h3>
                <div className={styles.amenityGrid}>
                  {['pool', 'parking', 'balcony', 'garden', 'beach_access', 'bbq', 'outdoor_dining'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.entertainment')}</h3>
                <div className={styles.amenityGrid}>
                  {['smart_tv', 'streaming', 'games', 'board_games', 'sound_system'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.safety')}</h3>
                <div className={styles.amenityGrid}>
                  {['smoke_detector', 'first_aid', 'fire_extinguisher', 'security_cameras'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.accessibility')}</h3>
                <div className={styles.amenityGrid}>
                  {['elevator', 'ground_floor', 'wide_doorway'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.amenityCategory}>
                <h3>{t('become_host.amenities.work')}</h3>
                <div className={styles.amenityGrid}>
                  {['desk', 'monitor', 'printer'].map((amenity) => (
                    <button
                      key={amenity}
                      type="button"
                      className={`${styles.amenityButton} ${
                        formData.amenities.includes(amenity) ? styles.selected : ''
                      }`}
                      onClick={() => handleAmenitiesChange(amenity)}
                    >
                      <span className={styles.amenityIcon}>
                        {AmenityIcons[amenity]}
                      </span>
                      <span>{t(`become_host.amenities.${amenity}`)}</span>
                    </button>
                  ))}
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
              {formData.photos.length > 0 && (
                <p className={styles.dragHint}>Drag photos to reorder them. The first photo will be your main photo.</p>
              )}
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
                <div className={styles.photoGrid}>
                  {formData.photos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className={`${styles.photoItem} ${
                        photo.id === formData.primaryPhotoId ? styles.mainPhoto : ''
                      }`}
                    >
                      <img src={photo.url} alt={`Property photo ${index + 1}`} />
                      <div className={styles.photoActions}>
                        <button
                          type="button"
                          className={styles.setPrimary}
                          onClick={() => handleSetPrimaryPhoto(photo.id)}
                        >
                          {photo.id === formData.primaryPhotoId ? 'Main photo' : 'Set as main'}
                        </button>
                        <div className={styles.orderButtons}>
                          <button
                            type="button"
                            className={styles.orderButton}
                            onClick={() => movePhoto(index, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            className={styles.orderButton}
                            onClick={() => movePhoto(index, 'down')}
                            disabled={index === formData.photos.length - 1}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          type="button"
                          className={styles.removePhoto}
                          onClick={() => handleRemovePhoto(photo.id)}
                        >
                          ×
                        </button>
                      </div>
                      {photo.id === formData.primaryPhotoId && (
                        <div className={styles.mainPhotoLabel}>
                          Main photo
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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
            <div className={styles.priceCard}>
              <div className={styles.formGroup}>
                <label>{t('become_host.pricing.price')}</label>
                <div className={styles.priceInputWrapper}>
                  <input
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className={styles.priceInput}
                  />
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
            <h2 className={styles.stepTitle}>{t('become_host.description.title')}</h2>
            <div className={styles.descriptionCard}>
              <div className={styles.descriptionSection}>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('become_host.description.placeholder')}
                  className={styles.textarea}
                  rows={8}
                />
                <div className={`${styles.characterCount} ${formData.description.length >= 50 ? styles.valid : styles.invalid}`}>
                  {formData.description.length}/50 caractere minim
                </div>
              </div>

              <div className={styles.navigationButtons}>
                <button onClick={prevStep} className={styles.backButton}>
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
                      <strong>Amenities:</strong> {formData.amenities
                        .map(amenity => t(`become_host.amenities.${amenity}`))
                        .join(', ')}
                    </div>
                  )}
                </div>
                {formData.photos.length > 0 && (
                  <div className={styles.previewPhoto}>
                    <div className={`${styles.previewPhotoItem} ${styles.mainPreviewPhoto}`}>
                      <Image
                        src={formData.photos.find(p => p.id === formData.primaryPhotoId)?.url || formData.photos[0].url}
                        alt="Property main photo"
                        width={600}
                        height={400}
                        objectFit="cover"
                      />
                    </div>
                    {formData.photos
                      .filter(photo => photo.id !== formData.primaryPhotoId)
                      .slice(0, 4)
                      .map((photo, index) => (
                        <div key={photo.id} className={styles.previewPhotoItem}>
                          <Image
                            src={photo.url}
                            alt={`Property photo ${index + 2}`}
                            width={300}
                            height={200}
                            objectFit="cover"
                          />
                        </div>
                      ))}
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
        <button 
          onClick={prevStep} 
          className={styles.backArrow}
          style={{ visibility: steps.indexOf(currentStep) === 0 ? 'hidden' : 'visible' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M15 18L9 12L15 6" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
} 