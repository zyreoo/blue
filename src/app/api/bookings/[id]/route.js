import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('Authentication failed: No session found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id } = params;
    const updates = await request.json();
    
    console.log('Attempting to update booking:', { 
      bookingId: id,
      updates,
      userEmail: session.user.email 
    });

    // Find the booking
    const booking = await Booking.findById(id);
    if (!booking) {
      console.error(`Booking not found with ID: ${id}`);
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check if the user is authorized to update this booking
    if (booking.adminEmail !== session.user.email) {
      console.error('Authorization failed:', {
        bookingAdminEmail: booking.adminEmail,
        userEmail: session.user.email
      });
      return NextResponse.json({ error: 'Not authorized to update this booking' }, { status: 403 });
    }

    // Validate the status update
    if (updates.status && !['pending', 'confirmed', 'cancelled', 'completed'].includes(updates.status)) {
      console.error(`Invalid status value provided: ${updates.status}`);
      return NextResponse.json({ 
        error: 'Invalid booking status. Must be one of: pending, confirmed, cancelled, completed'
      }, { status: 400 });
    }

    // Update the booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    console.log('Booking updated successfully:', {
      bookingId: id,
      newStatus: updates.status
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', {
      error: error.message,
      stack: error.stack,
      bookingId: params.id
    });
    
    return NextResponse.json(
      { error: error.message || 'Failed to update booking status' },
      { status: 500 }
    );
  }
} 