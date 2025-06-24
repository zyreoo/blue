import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';
import User from '@/models/User';
import fs from 'fs/promises';
import path from 'path';

async function saveImage(base64Data, propertyId, index) {
  const base64Image = base64Data.split(';base64,').pop();
  
  const propertyDir = path.join(process.cwd(), 'public', 'properties', propertyId);
  await fs.mkdir(propertyDir, { recursive: true });
  
  const fileName = `image-${index}.jpg`;
  const filePath = path.join(propertyDir, fileName);
  await fs.writeFile(filePath, base64Image, 'base64');
  

  return `/properties/${propertyId}/${fileName}`;
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const data = await req.json();

    let user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found. Please complete your profile before becoming a host.' },
        { status: 400 }
      );
    }

    const propertyData = {
      host: user._id,
      hostEmail: user.email,
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
      photos: [],
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

    const property = await Property.create(propertyData);

    await User.findOneAndUpdate(
      { _id: user._id },
      {
        $set: { 
          isHost: true,
          hostingSince: user.hostingSince || new Date()
        },
        $push: { properties: property._id }
      },
      { new: true }
    );

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
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
}

