'use client';

import { createContext, useContext, useState } from 'react';

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
  property: {
    location: "Proprietăți în",
    perNight: "noapte",
    type: "Tip proprietate",
    space_type: "Tip spațiu",
    price: "Preț",
    details: "Detalii",
    amenities: "Facilități",
    description: "Descriere"
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
    photos: {
      main_photo: "Fotografie principală"
    }
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState('ro');

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value[k];
      if (!value) return key;
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ t, locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 