import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';
import fs from 'fs/promises';
import path from 'path';

// Function to save base64 image to file
async function saveImage(base64Data, propertyId, index) {
  // Remove the data URL prefix
  const base64Image = base64Data.split(';base64,').pop();
  
  // Create property directory if it doesn't exist
  const propertyDir = path.join(process.cwd(), 'public', 'properties', propertyId);
  await fs.mkdir(propertyDir, { recursive: true });
  
  // Save the image
  const fileName = `image-${index}.jpg`;
  const filePath = path.join(propertyDir, fileName);
  await fs.writeFile(filePath, base64Image, 'base64');
  
  // Return the public URL
  return `/properties/${propertyId}/${fileName}`;
}

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await dbConnect();

    // Parse the request body
    const data = await req.json();

    // Create property first to get the ID
    const propertyData = {
      host: session.user.id,
      hostEmail: session.user.email,
      propertyType: data.propertyType,
      spaceType: data.spaceType,
      location: {
        address: data.address,
        city: data.city,
        country: data.country
      },
      details: {
        maxGuests: parseInt(data.maxGuests),
        bedrooms: parseInt(data.bedrooms),
        beds: parseInt(data.beds),
        bathrooms: parseInt(data.bathrooms)
      },
      amenities: data.amenities,
      photos: [], // We'll update this after saving the images
      pricing: {
        basePrice: parseInt(data.pricePerNight),
        cleaningFee: 0,
        serviceFee: 0
      },
      description: data.description || `Beautiful ${data.propertyType} in ${data.city}`,
      status: 'pending',
      rules: {
        smokingAllowed: false,
        petsAllowed: false,
        partiesAllowed: false,
        additionalRules: []
      },
      availability: {
        alwaysAvailable: true,
        unavailableDates: []
      }
    };

    // Create new property
    const property = await Property.create(propertyData);


    const photoUrls = await Promise.all(
      data.photos.map((photo, index) => saveImage(photo.url, property._id.toString(), index))
    );


    const updatedPhotos = photoUrls.map((url, index) => ({
      url,
      isMain: index === 0
    }));

    await Property.findByIdAndUpdate(property._id, {
      photos: updatedPhotos
    });


    await sendAdminNotification({
      type: 'new_property',
      propertyId: property._id,
      hostEmail: session.user.email,
      propertyType: data.propertyType,
      location: `${data.city}, ${data.country}`
    });

    return NextResponse.json({
      success: true,
      message: 'Property created successfully',
      property: {
        ...property.toObject(),
        photos: updatedPhotos
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

// Helper function to send admin notification
async function sendAdminNotification(data) {
  // You'll need to implement this function to send emails
  console.log('Admin notification:', data);
} 