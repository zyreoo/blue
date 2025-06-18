import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';

export async function GET() {
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

    // Fetch properties owned by the user
    const properties = await Property.find({ owner: session.user.id })
      .sort({ createdAt: -1 }); // Sort by newest first

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 