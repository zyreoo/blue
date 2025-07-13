import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if the user is a superadmin
    if (!session.user.isSuperAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Fetch all properties that need approval
    const properties = await Property.find({
      status: { $in: ['pending', 'rejected'] }
    }).sort({ createdAt: -1 });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Error fetching pending properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 