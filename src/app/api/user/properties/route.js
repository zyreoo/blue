import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    await dbConnect();
    

    if (email) {
      const user = await User.findOne({ email }).populate('properties');

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      if (!user.isHost) {
        return NextResponse.json({ error: 'User is not a host' }, { status: 403 });
      }

      return NextResponse.json({ properties: user.properties });
    }
    

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email }).populate('properties');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ properties: user.properties });
  } catch (error) {
    console.error('Error fetching user properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 