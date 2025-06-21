export function generateBookingNumber() {
  // Generate a timestamp-based prefix
  const timestamp = Date.now().toString(36);
  
  // Generate a random suffix (4 characters)
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  // Combine them with a separator
  return `BK-${timestamp}-${randomSuffix}`;
} 