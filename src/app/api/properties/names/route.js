import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import PropertyName from '@/models/PropertyName';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const data = await request.json();

    if (!data.propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const propertyName = await PropertyName.create({
      name: data.name,
      propertyId: data.propertyId,
      location: data.location,
      userId: session.user.id
    });

    return NextResponse.json(propertyName);
  } catch (error) {
    console.error('Error saving property name:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const propertyNames = await PropertyName.find({ userId: session.user.id })
      .populate('propertyId', '_id name') // This will populate the property details
      .sort({ createdAt: -1 }); // Sort by newest first
    
    return NextResponse.json(propertyNames);
  } catch (error) {
    console.error('Error fetching property names:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 