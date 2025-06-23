export function generateBookingNumber() {

  const timestamp = Date.now().toString(36);
  

  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  

  return `BK-${timestamp}-${randomSuffix}`;
} 