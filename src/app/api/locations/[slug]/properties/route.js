import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Location from '@/models/Location';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const { slug } = params;
    
    const location = await Location.findOne({ slug })
      .populate({
        path: 'properties',
        select: 'title description photos pricing location'
      });
    
    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      location: {
        city: location.city,
        country: location.country
      },
      properties: location.properties
    });
  } catch (error) {
    console.error('Error fetching location properties:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch location properties' },
      { status: 500 }
    );
  }
} 