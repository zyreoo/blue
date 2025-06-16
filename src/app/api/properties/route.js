import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';

export async function GET(request) {
  try {
    console.log('Fetching properties...');
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    console.log('Search params:', { location });

    console.log('Connecting to database...');
    await connectDB();
    console.log('Database connected successfully');
    
    let query = {};
    if (location) {
      query.location = new RegExp('^' + location + '$', 'i');
      console.log('Search query:', query);
    }
    
    console.log('Executing database query...');
    const properties = await Property.find(query);
    console.log(`Found ${properties.length} properties`);
    
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error in GET /api/properties:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch properties',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    console.log('Creating new property...');
    await connectDB();
    console.log('Database connected successfully');

    const data = await request.json();
    console.log('Received property data:', data);

    const property = await Property.create(data);
    console.log('Property created successfully:', property._id);
    
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/properties:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create property',
        details: error.message
      },
      { status: 500 }
    );
  }
} 