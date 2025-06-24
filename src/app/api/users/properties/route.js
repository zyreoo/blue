import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import Property from '@/models/Property';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // Find the user and check if they are a host
    const user = await User.findOne({ email }).populate('properties');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isHost) {
      return NextResponse.json({ error: 'User is not a host' }, { status: 403 });
    }

    // Return the user's properties
    return NextResponse.json({ properties: user.properties });
  } catch (error) {
    console.error('Error fetching user properties:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 