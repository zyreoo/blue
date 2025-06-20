import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json([]);
    }

    await connectDB();

    const locations = await Property.distinct('location', {
      location: new RegExp(query, 'i')
    });

    const sortedLocations = locations.sort((a, b) => {
      const aStartsWithQuery = a.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWithQuery = b.toLowerCase().startsWith(query.toLowerCase());
      
      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;
      return a.localeCompare(b);
    });

    return NextResponse.json(sortedLocations);
  } catch (error) {

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
} 