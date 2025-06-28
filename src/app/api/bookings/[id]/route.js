import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    const session = await getServerSession(authOptions);
    if (!session) {

      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();
    


    
    const booking = await Booking.findById(id);
    if (!booking) {

      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.adminEmail !== session.user.email) {

      return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 });
    }


    if (updates.status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(updates.status)) {

      return NextResponse.json({ 
        error: 'Invalid booking status. Must be one of: pending, confirmed, cancelled, completed'
      }, { status: 400 });
    }


    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );



    return NextResponse.json(updatedBooking);
  } catch (error) {

    
    return NextResponse.json(
      { error: error.message || 'Failed to update booking status' },
      { status: 500 }
    );
  }
} 