import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import dbConnect from '@/lib/dbConnect';

export async function GET(request) {
  try {
    console.log('Fetching properties...');
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    console.log('Search params:', { location });

    console.log('Connecting to database...');
    const conn = await connectDB();
    console.log('Database connected successfully');
    console.log('Connected to database:', conn.connection.db.databaseName);
    
    let query = {};
    if (location) {
      query.location = new RegExp('^' + location + '$', 'i');
      console.log('Search query:', query);
    }
    
    console.log('Executing database query...');
    const properties = await Property.find(query).lean();
    console.log('Query result:', {
      count: properties.length,
      collectionName: Property.collection.name,
      databaseName: conn.connection.db.databaseName
    });
    
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
    await dbConnect();

    const body = await request.json();

    // Convert string values to numbers where needed
    const propertyData = {
      ...body,
      price: Number(body.price),
      bedrooms: Number(body.bedrooms),
      bathrooms: Number(body.bathrooms),
      maxGuests: Number(body.maxGuests),
      roomCapacity: Number(body.roomCapacity),
      personCapacity: Number(body.personCapacity),
      maxPets: Number(body.maxPets)
    };

    const property = await Property.create(propertyData);

    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
} 