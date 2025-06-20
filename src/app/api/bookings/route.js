import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper to calculate total price
const calculateTotalPrice = (pricePerNight, checkIn, checkOut) => {
  const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
  return pricePerNight * nights;
};

export async function GET(request) {
  try {
    await connectDB();
    
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'guest' or 'admin'

    let query = {};
    
    if (role === 'admin') {
      // Find bookings for properties administered by the user
      query = { adminEmail: session.user.email };
    } else {
      // Default to guest view - show bookings made by the user
      query = { customerEmail: session.user.email };
    }

    const bookings = await Booking.find(query)
      .populate('propertyId', 'title location imageUrl price adminEmail')
      .sort({ createdAt: -1 })
      .lean();

    // Filter out sensitive information if not the admin
    const sanitizedBookings = bookings.map(booking => {
      if (role === 'admin' || booking.customerEmail === session.user.email) {
        return booking;
      }
      // Remove sensitive customer information for non-admins
      const { customer, ...publicBooking } = booking;
      return {
        ...publicBooking,
        customer: {
          name: customer.name
        }
      };
    });

    return NextResponse.json(sanitizedBookings);
  } catch (error) {

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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

    // Validate property exists and get admin info
    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Calculate total price
    const totalPrice = calculateTotalPrice(property.price, checkIn, checkOut);

    // Create new booking
    const booking = await Booking.create({
      propertyId,
      adminEmail: property.adminEmail,
      customerEmail: session.user.email,
      customer: {
        name: `${firstName} ${lastName}`,
        email: guestEmail,
        phone: guestPhone,
        idNumber
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

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 