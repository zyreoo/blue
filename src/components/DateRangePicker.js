'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './DateRangePicker.module.css';

// Move constants outside component
const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
const flexibleOptions = [
  { label: 'Date exacte', value: 0 },
  { label: '± 1 zi', value: 1 },
  { label: '± 2 zile', value: 2 },
  { label: '± 3 zile', value: 3 },
  { label: '± 7 zile', value: 7 },
  { label: '± 14 zile', value: 14 }
];

// Memoize formatters
const formatWeekday = (locale, date) => {
  const weekday = WEEKDAYS[date.getDay()];
  return `  ${weekday}`;
};

const formatMonthYear = (locale, date) => {
  const month = date.toLocaleString('ro-RO', { month: 'long' });
  return `${month} ${date.getFullYear()}`;
};

export default function DateRangePicker({ onDateChange, initialValues }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('date');
  const [dateRange, setDateRange] = useState(
    initialValues ? [initialValues.startDate, initialValues.endDate] : [new Date(), new Date()]
  );
  const [flexibleDays, setFlexibleDays] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [persons, setPersons] = useState(initialValues?.persons || {
    babies: 0,
    teens: 0,
    adults: 0
  });
  const [rooms, setRooms] = useState(initialValues?.rooms || 1);
  const [isPersonsDropdownOpen, setIsPersonsDropdownOpen] = useState(false);
  const personsDropdownRef = useRef(null);

  // Memoize year options
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1];
  }, []);

  const handleClickOutside = useCallback((event) => {
    if (personsDropdownRef.current && !personsDropdownRef.current.contains(event.target)) {
      setIsPersonsDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (initialValues && onDateChange) {
      onDateChange({
        startDate: initialValues.startDate,
        endDate: initialValues.endDate,
        persons: initialValues.persons,
        rooms: initialValues.rooms
      });
    }
  }, [initialValues, onDateChange]);

  const handleDateChange = useCallback((value) => {
    setDateRange(value);
    if (value[0] && value[1] && onDateChange) {
      onDateChange({
        startDate: value[0],
        endDate: value[1],
        flexibility: flexibleDays,
        persons,
        rooms
      });
    }
  }, [flexibleDays, onDateChange, persons, rooms]);

  const handleYearChange = useCallback((e) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
    
    setDateRange(prev => prev.map(date => {
      const newDate = new Date(date);
      newDate.setFullYear(newYear);
      return newDate;
    }));
  }, []);

  useEffect(() => {
    if (dateRange[0] && dateRange[1] && onDateChange) {
      onDateChange({
        startDate: dateRange[0],
        endDate: dateRange[1],
        flexibility: flexibleDays,
        persons,
        rooms
      });
    }
  }, [dateRange, flexibleDays, onDateChange, persons, rooms]);

  const handlePersonChange = useCallback((type, value) => {
    setPersons(prev => {
      const newPersons = { ...prev, [type]: value };
      return newPersons;
    });
  }, []);

  const handleRoomChange = useCallback((value) => {
    setRooms(value);
  }, []);

  const getPersonsSummary = useCallback(() => {
    const parts = [];
    if (persons.adults > 0) {
      parts.push(`${persons.adults} Adult${persons.adults > 1 ? 'i' : ''}`);
    }
    if (persons.teens > 0) {
      parts.push(`${persons.teens} Adolescent${persons.teens > 1 ? 'i' : ''}`);
    }
    if (persons.babies > 0) {
      parts.push(`${persons.babies} Bebe${persons.babies > 1 ? 'i' : ''}`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Selectează persoane';
  }, [persons]);

  const isFormComplete = useMemo(() => {
    return dateRange[0] && dateRange[1] && 
           (persons.babies > 0 || persons.teens > 0 || persons.adults > 0) && 
           rooms > 0;
  }, [dateRange, persons, rooms]);

  const handleFlexibleOptionClick = useCallback((days) => {
    setFlexibleDays(days);
  }, []);

  // Memoize calendar props
  const calendarProps = useMemo(() => ({
    onChange: handleDateChange,
    value: dateRange,
    selectRange: true,
    minDate: new Date(selectedYear, 0, 1),
    maxDate: new Date(new Date().getFullYear() + 1, 11, 31),
    className: styles.calendar,
    showFixedNumberOfWeeks: true,
    prev2Label: null,
    next2Label: null,
    minDetail: "month",
    formatShortWeekday: formatWeekday,
    showNeighboringMonth: false,
    formatMonthYear: formatMonthYear,
    tileClassName: ({ date, view }) => {
      if (view === 'month') {
        return styles.calendarTile;
      }
    }
  }), [dateRange, selectedYear, handleDateChange]);

  if (!mounted) return null;

  return (
    <div className={styles.datePickerContainer}>
      <div className={styles.yearSelectorContainer}>
        <select 
          value={selectedYear}
          onChange={handleYearChange}
          className={styles.yearSelector}
        >
          {yearOptions.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          {...calendarProps}
          navigationLabel={({ date, label, locale, view }) => {
            if (view === 'month') {
              const month = date.toLocaleString('ro-RO', { month: 'long' });
              return `${month}`;
            }
            return label;
          }}
          onActiveStartDateChange={({ activeStartDate }) => {
            const newYear = activeStartDate.getFullYear();
            if (newYear !== selectedYear) {
              setSelectedYear(newYear);
            }
          }}
        />
      </div>

      {activeTab === 'flexible' && (
        <div className={styles.flexibleOptions}>
          {flexibleOptions.map(option => (
            <button
              key={option.value}
              className={`${styles.flexibleOption} ${flexibleDays === option.value ? styles.activeOption : ''}`}
              onClick={() => handleFlexibleOptionClick(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className={styles.selectionContainer}>
        <div className={styles.personsDropdown} ref={personsDropdownRef}>
          <button 
            className={styles.dropdownButton}
            onClick={() => setIsPersonsDropdownOpen(!isPersonsDropdownOpen)}
          >
            <span className={styles.buttonLabel}>Persoane</span>
            <span className={styles.buttonSummary}>{getPersonsSummary()}</span>
          </button>
          
          {isPersonsDropdownOpen && (
            <div className={styles.dropdownContent}>
              <div className={styles.personCounter}>
                <label>Copii (0-11)</label>
                <div className={styles.counter}>
                  <button 
                    onClick={() => handlePersonChange('babies', Math.max(0, persons.babies - 1))}
                    className={styles.counterButton}
                  >
                    -
                  </button>
                  <span>{persons.babies}</span>
                  <button 
                    onClick={() => handlePersonChange('babies', persons.babies + 1)}
                    className={styles.counterButton}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={styles.personCounter}>
                <label>Adolescenți (12-17)</label>
                <div className={styles.counter}>
                  <button 
                    onClick={() => handlePersonChange('teens', Math.max(0, persons.teens - 1))}
                    className={styles.counterButton}
                  >
                    -
                  </button>
                  <span>{persons.teens}</span>
                  <button 
                    onClick={() => handlePersonChange('teens', persons.teens + 1)}
                    className={styles.counterButton}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={styles.personCounter}>
                <label>Adulți (18+)</label> 
                <div className={styles.counter}>
                  <button 
                    onClick={() => handlePersonChange('adults', Math.max(0, persons.adults - 1))}
                    className={styles.counterButton}
                  >
                    -
                  </button>
                  <span>{persons.adults}</span>
                  <button 
                    onClick={() => handlePersonChange('adults', persons.adults + 1)}
                    className={styles.counterButton}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.roomCounterContainer}>
          <h3 className={styles.sectionTitle}>Camere</h3>
          <div className={styles.counter}>
            <button 
              onClick={() => handleRoomChange(Math.max(1, rooms - 1))}
              className={styles.counterButton}
            >
              -
            </button>
            <span>{rooms}</span>
            <button 
              onClick={() => handleRoomChange(rooms + 1)}
              className={styles.counterButton}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className={styles.validationMessage}>
        {!isFormComplete && (
          <p className={styles.errorMessage}>
            Vă rugăm să completați toate informațiile necesare pentru rezervare.
          </p>
        )}
      </div>
    </div>
  );
} 