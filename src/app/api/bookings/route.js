import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Helper to calculate total price
const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  return pricePerNight * nights;
};

export async function POST(request) {
  try {
    await connectDB();
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const bookingData = await request.json();
    const {
      propertyId,
      checkIn,
      checkOut,
      numberOfGuests,
      numberOfRooms,
      firstName,
      lastName,
      guestEmail,
      guestPhone,
      idNumber,
      specialRequests
    } = bookingData;

    // Validate property exists and get owner info
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(property.price, checkIn, checkOut);

    // Create new booking with nested customer object
    const booking = await Booking.create({
      propertyId: propertyId,
      propertyOwnerId: property.owner,
      userId: session.user.id,
      customer: {
        name: `${firstName} ${lastName}`,
        email: guestEmail,
        phone: guestPhone,
        idNumber: idNumber
      },
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      numberOfGuests,
      numberOfRooms,
      specialRequests,
      totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    });

    return NextResponse.json({ 
      success: true, 
      booking: {
        ...booking.toObject(),
        property: {
          title: property.title,
          location: property.location,
          imageUrl: property.imageUrl
        }
      }
    });
  } catch (error) {
    console.error('Booking POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    await connectDB();
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'guest' or 'owner'

    let query = {};
    
    if (role === 'owner') {
      // Find properties owned by the user
      const userProperties = await Property.find({ owner: session.user.id });
      const propertyIds = userProperties.map(p => p._id);
      query = { propertyId: { $in: propertyIds } };
    } else {
      // Default to guest view
      query = { userId: session.user.id };
    }

    const bookings = await Booking.find(query)
      .populate('propertyId', 'title location imageUrl price')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Booking GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 