import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Location from '@/models/Location';

export async function GET() {
  try {
    const db = await dbConnect();
    
    const locations = await Location.find()
      .select('city country slug')
      .sort({ city: 1 })
      .lean();
    
    return NextResponse.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch locations' },
      { status: 500 }
    );
  }
} 