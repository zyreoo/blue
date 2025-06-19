import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    console.log('Fetching properties...');
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const isAdmin = searchParams.get('admin') === 'true';
    console.log('Search params:', { location, isAdmin });

    // Get user session if in admin mode
    let session = null;
    if (isAdmin) {
      session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Authentication required for admin access' }, { status: 401 });
      }
    }

    console.log('Connecting to database...');
    const conn = await connectDB();
    console.log('Database connected successfully');
    console.log('Connected to database:', conn.connection.db.databaseName);
    
    let query = {};
    
    // Add location filter if provided
    if (location) {
      query.location = new RegExp('^' + location + '$', 'i');
    }
    
    // Add admin email filter if in admin mode
    if (isAdmin && session) {
      query.adminEmail = session.user.email;
    }
    
    console.log('Executing database query:', query);
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
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Connect to the database
    await dbConnect();

    // Get the request body
    const body = await request.json();

    // Add the admin email to the property data
    const propertyData = {
      ...body,
      adminEmail: session.user.email
    };

    // Create the new property
    const property = await Property.create(propertyData);

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
} 