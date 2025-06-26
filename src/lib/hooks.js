import useSWR from 'swr';
import { useState, useEffect } from 'react';

const fetcher = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data;
};

export function useProperties() {
  const { data, error } = useSWR('/api/properties', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 600000,
    fallbackData: []
  });

  return {
    properties: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

export function useBookings() {
  const { data, error } = useSWR('/api/bookings', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 600000,
    fallbackData: []
  });

  return {
    bookings: data || [],
    isLoading: !error && !data,
    isError: error
  };
}

export function useLocations() {
  const { data, error, isLoading } = useSWR('/api/locations', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 60000, // Cache for 1 minute
  });
  
  return {
    locations: Array.isArray(data) ? data : [],
    isLoading,
    error: error?.message
  };
}

export function useLocationProperties(slug) {
  const { data, error, isLoading } = useSWR(
    slug ? `/api/locations/${slug}/properties` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );
  
  return {
    properties: data?.properties || [],
    location: data?.location,
    isLoading,
    error: error?.message
  };
} 