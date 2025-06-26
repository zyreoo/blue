import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Location from '@/models/Location';

export async function GET() {
  try {
    const db = await dbConnect();
    console.log('DEBUG - MongoDB connected:', db.connection.readyState === 1);
    
    const locations = await Location.find()
      .select('city country slug')
      .sort({ city: 1 })
      .lean();
    
    console.log('DEBUG - Locations found in DB:', {
      count: locations.length,
      locations: locations
    });
    
    if (!locations.length) {
      console.log('DEBUG - No locations found in database');
    }
    
    return NextResponse.json(locations);
  } catch (error) {
    console.error('DEBUG - Error fetching locations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch locations' },
      { status: 500 }
    );
  }
} 