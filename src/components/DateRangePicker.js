'use client';

import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import styles from './DateRangePicker.module.css';


const flexibleOptions = [
  { label: 'Date exacte', value: 0 },
  { label: '± 1 zi', value: 1 },
  { label: '± 2 zile', value: 2 },
  { label: '± 3 zile', value: 3 },
  { label: '± 7 zile', value: 7 },
  { label: '± 14 zile', value: 14 }
];


const WEEKDAYS = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export default function DateRangePicker({ onDateChange }) {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('date');
  const [dateRange, setDateRange] = useState([new Date(), new Date()]);
  const [flexibleDays, setFlexibleDays] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    setSelectedYear(newYear);
    
    // Update the date range to the new year while keeping the same months and days
    const newDateRange = dateRange.map(date => {
      const newDate = new Date(date);
      newDate.setFullYear(newYear);
      return newDate;
    });
    setDateRange(newDateRange);
    
    if (onDateChange && newDateRange[0] && newDateRange[1]) {
      onDateChange({
        startDate: newDateRange[0],
        endDate: newDateRange[1],
        flexibility: flexibleDays
      });
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear, currentYear + 1];
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
      <div className={styles.yearSelectorContainer}>
        <select 
          value={selectedYear}
          onChange={handleYearChange}
          className={styles.yearSelector}
        >
          {generateYearOptions().map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className={styles.calendarContainer}>
        <Calendar
          onChange={handleDateChange}
          value={dateRange} 
          selectRange={true}
          minDate={new Date(selectedYear, 0, 1)}
          className={styles.calendar}
          showFixedNumberOfWeeks={true}
          prev2Label={null}
          next2Label={null}
          minDetail="month"
          formatShortWeekday={(locale, date) => {
            const weekday = WEEKDAYS[date.getDay()];
            return `  ${weekday}`;
          }}
          showNeighboringMonth={false}
          formatMonthYear={(locale, date) => {
            const month = date.toLocaleString('ro-RO', { month: 'long' });
            return `${month} ${date.getFullYear()}`;
          }}
          tileClassName={({ date, view }) => {
            if (view === 'month') {
              return styles.calendarTile;
            }
          }}
          navigationLabel={({ date, label, locale, view }) => {
            if (view === 'month') {
              const month = date.toLocaleString('ro-RO', { month: 'long' });
              return `${month}`;
            }
            return label;
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
    </div>
  );
} 