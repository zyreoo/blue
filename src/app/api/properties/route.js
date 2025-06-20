import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const isAdmin = searchParams.get('admin') === 'true';

    let session = null;
    if (isAdmin) {
      session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Authentication required for admin access' }, { status: 401 });
      }
    }

    const conn = await connectDB();
    
    let query = {};
    
    if (location) {
      query.location = new RegExp('^' + location + '$', 'i');
    }
    
    if (isAdmin && session) {
      query.adminEmail = session.user.email;
    }
    
    const properties = await Property.find(query).lean();
    
    return NextResponse.json(properties);
  } catch (error) {

    
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
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();

    const propertyData = {
      ...body,
      adminEmail: session.user.email
    };

    const property = await Property.create(propertyData);

    return NextResponse.json(property);
  } catch (error) {

    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
} 