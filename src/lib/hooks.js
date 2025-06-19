import useSWR from 'swr';

const fetcher = async (url) => {
  const res = await fetch(url, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    }
  });
  if (!res.ok) throw new Error('Failed to fetch data');
  const data = await res.json();
  return Array.isArray(data) ? data : [];
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