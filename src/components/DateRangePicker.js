'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './DateRangePicker.module.css';

const tabs = [
  { id: 'date', label: 'Date' },
  { id: 'month', label: 'Luni' },
  { id: 'flexible', label: 'Flexibilă' }
];

const flexibleOptions = [
  { label: 'Date exacte', value: 0 },
  { label: '± 1 zi', value: 1 },
  { label: '± 2 zile', value: 2 },
  { label: '± 3 zile', value: 3 },
  { label: '± 7 zile', value: 7 },
  { label: '± 14 zile', value: 14 }
];

export default function DateRangePicker({ onDateChange }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('date');
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [flexibleDays, setFlexibleDays] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDateChange = (value) => {
    setDateRange(value);
    if (value[0] && value[1] && onDateChange) {
      onDateChange({
        startDate: value[0],
        endDate: value[1],
        flexibility: flexibleDays
      });
    }
  };

  const handleFlexibleOptionClick = (days) => {
    setFlexibleDays(days);
    if (dateRange[0] && dateRange[1] && onDateChange) {
      onDateChange({
        startDate: dateRange[0],
        endDate: dateRange[1],
        flexibility: days
      });
    }
  };

  if (!mounted) return null;

  return (
    <div className={styles.datePickerContainer}>
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          onChange={handleDateChange}
          value={dateRange}
          selectRange={true}
          minDate={new Date()}
          className={styles.calendar}
          showDoubleView={true}
          showFixedNumberOfWeeks={false}
          prev2Label={null}
          next2Label={null}
          minDetail="month"
          formatShortWeekday={(locale, date) => 
            ['D', 'L', 'M', 'M', 'J', 'V', 'S'][date.getDay()]
          }
          showNeighboringMonth={false}
          calendarType="gregory"
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
    </div>
  );
} 