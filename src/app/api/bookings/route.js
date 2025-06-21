import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Booking from '@/models/Booking';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateBookingNumber } from '@/lib/utils';

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

export async function POST(req) {
  try {
    await connectDB();
    

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Received booking data:', body);

    // Get property details
    const property = await Property.findById(body.propertyId);
    console.log('Found property:', property);

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Get the price - check both possible locations
    const basePrice = property.price || property.pricing?.basePrice;
    if (!basePrice || basePrice <= 0) {
      console.error('Valid property price is missing:', property);
      return NextResponse.json({ 
        error: 'Property price is not set or is invalid',
        details: {
          price: property.price,
          basePrice: property.pricing?.basePrice
        }
      }, { status: 400 });
    }


    const start = new Date(body.checkIn);
    const end = new Date(body.checkOut);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ 
        error: 'Invalid dates provided',
        details: { checkIn: body.checkIn, checkOut: body.checkOut }
      }, { status: 400 });
    }

    if (start >= end) {
      return NextResponse.json({ 
        error: 'Check-out date must be after check-in date'
      }, { status: 400 });
    }

    // Calculate total price
    const numberOfNights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const cleaningFee = property.pricing?.cleaningFee || 0;
    const serviceFee = property.pricing?.serviceFee || 0;
    const totalPrice = (basePrice * numberOfNights) + cleaningFee + serviceFee;

    console.log('Price calculation:', { 
      basePrice,
      numberOfNights,
      cleaningFee,
      serviceFee,
      totalPrice
    });

    if (isNaN(totalPrice) || totalPrice <= 0) {
      return NextResponse.json({ 
        error: 'Invalid price calculation',
        details: { basePrice, nights: numberOfNights, cleaningFee, serviceFee }
      }, { status: 400 });
    }

    // Validate guest count
    const totalGuests = (body.numberOfGuests.adults || 0) + 
                       (body.numberOfGuests.teens || 0) + 
                       (body.numberOfGuests.babies || 0);
    
    if (totalGuests === 0) {
      return NextResponse.json({ 
        error: 'At least one guest is required'
      }, { status: 400 });
    }

    if (totalGuests > property.details?.maxGuests) {
      return NextResponse.json({ 
        error: 'Number of guests exceeds property capacity',
        details: {
          maxAllowed: property.details.maxGuests,
          requested: totalGuests
        }
      }, { status: 400 });
    }

    // Format the booking data according to schema
    const bookingData = {
      bookingNumber: generateBookingNumber(),
      propertyId: body.propertyId,
      adminEmail: property.adminEmail || property.hostEmail,
      customerEmail: session.user.email, // Use authenticated user's email
      customer: {
        name: `${body.firstName} ${body.lastName}`,
        email: body.guestEmail,
        phone: body.guestPhone,
        idNumber: body.idNumber
      },
      checkIn: start,
      checkOut: end,
      numberOfGuests: body.numberOfGuests,
      numberOfRooms: body.numberOfRooms,
      specialRequests: body.specialRequests || '',
      totalPrice: totalPrice,
      status: 'pending',
      paymentStatus: 'pending'
    };

    console.log('Attempting to create booking with data:', bookingData);

    const booking = await Booking.create(bookingData);
    console.log('Booking created:', booking);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking creation error:', error);
    
    // More detailed error response
    return NextResponse.json({
      error: error.message,
      validationErrors: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : null
    }, { status: 500 });
  }
} 