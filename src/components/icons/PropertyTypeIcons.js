import React from 'react';

export const PropertyTypeIcons = {
  house: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7L8 17C7.5 17.4 7.5 18 8 18.2C8.5 18.4 9 18.2 9.2 17.8L10 17V31C10 32.1 10.9 33 12 33H28C29.1 33 30 32.1 30 31V17L30.8 17.8C31 18.2 31.5 18.4 32 18.2C32.5 18 32.5 17.4 32 17L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 33V25C17 24.4 17.4 24 18 24H22C22.6 24 23 24.4 23 25V33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  apartment: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="7" width="20" height="26" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 13H19M15 19H19M15 25H19M21 13H25M21 19H25M21 25H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  barn: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7C20 7 8 14 8 15C8 16 8 31 8 31C8 32.1 8.9 33 10 33H30C31.1 33 32 32.1 32 31V15C32 14 20 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 22H19M21 22H25M16 33V28C16 27.4 16.4 27 17 27H23C23.6 27 24 27.4 24 28V33" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  guesthouse: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 20C8 19.4 8.4 19 9 19H31C31.6 19 32 19.4 32 20V31C32 32.1 31.1 33 30 33H10C8.9 33 8 32.1 8 31V20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 7L10 15H30L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 33V26C16 25.4 16.4 25 17 25H23C23.6 25 24 25.4 24 26V33" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  boat: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 10C20 10 12 16 12 17V25C12 26.1 12.9 27 14 27H26C27.1 27 28 26.1 28 25V17C28 16 20 10 20 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 31C10 32.5 14 33 20 33C26 33 30 32.5 32 31" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 10V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  cabin: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 7L8 17C7.5 17.4 7.5 18 8 18.2C8.5 18.4 9 18.2 9.2 17.8L10 17V31C10 32.1 10.9 33 12 33H28C29.1 33 30 32.1 30 31V17L30.8 17.8C31 18.2 31.5 18.4 32 18.2C32.5 18 32.5 17.4 32 17L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 33V25C16 24.4 16.4 24 17 24H23C23.6 24 24 24.4 24 25V33" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M15 20H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  camper: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 27C7 27 7 20 7 19C7 18 12 18 14 18C16 18 24 18 26 18C28 18 33 18 33 19C33 20 33 27 33 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M33 27C33 28.7 31.7 30 30 30C28.3 30 27 28.7 27 27M7 27C7 28.7 8.3 30 10 30C11.7 30 13 28.7 13 27" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="10" cy="27" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="30" cy="27" r="3" stroke="currentColor" strokeWidth="2"/>
      <path d="M28 22H33" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  villa: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 33H30C31.1 33 32 32.1 32 31V21C32 20 28 17 20 12C12 17 8 20 8 21V31C8 32.1 8.9 33 10 33Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 26H25M15 30H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  castle: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 33H30C31.1 33 32 32.1 32 31V17H8V31C8 32.1 8.9 33 10 33Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17V9C12 8.4 12.4 8 13 8H15C15.6 8 16 8.4 16 9V17M24 17V9C24 8.4 24.4 8 25 8H27C27.6 8 28 8.4 28 9V17M18 17V9C18 8.4 18.4 8 19 8H21C21.6 8 22 8.4 22 9V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 23H25M15 28H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  
  cave: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 33H32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32 33C28 25 24 28 20 24C16 20 12 23 8 20V33" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13 26C15 24 17 25 20 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  container: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="12" width="24" height="16" rx="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 20H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12V28M28 12V28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  
  cycladic: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 33H30C31.1 33 32 32.1 32 31V21C32 18 20 12 20 12C20 12 8 18 8 21V31C8 32.1 8.9 33 10 33Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15 24H25M15 28H25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 12V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M14 21C14 21 17 19 20 19C23 19 26 21 26 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}; 