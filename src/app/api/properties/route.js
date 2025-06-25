import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Property from '@/models/Property';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { v2 as cloudinary } from 'cloudinary';
import { Types } from 'mongoose';

cloudinary.config({
  cloud_name: 'dizwqfgrr',
  api_key: process.env.CLOUDINARY_API_KEY || '687277786534624',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const isAdmin = searchParams.get('admin') === 'true';

    let session = null;
    if (isAdmin) {
      session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: 'Authentication required for admin access' }, { status: 401 });
      }
    }

    const conn = await connectDB();
    
    let query = {};
    
    if (location) {
      query.location = new RegExp('^' + location + '$', 'i');
    }
    
    if (isAdmin && session) {
      query.adminEmail = session.user.email;
    }
    
    const properties = await Property.find(query).lean();
    
    return NextResponse.json(properties);
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to fetch properties',
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const body = await request.json();
    
    // Create the property with host information
    const propertyData = {
      ...body,
      host: session.user.id || new Types.ObjectId(), // Use the user's ID from session or create a new one
      hostEmail: session.user.email, // Use the email from the session
      adminEmail: session.user.email
    };

    console.log('Creating property with data:', propertyData);

    const property = await Property.create(propertyData);

    // Update the user's isHost status and add property to their properties array
    await User.findByIdAndUpdate(
      session.user.id,
      {
        $set: { 
          isHost: true,
          hostingSince: new Date()
        },
        $push: { properties: property._id }
      }
    );
    const updatedPhotos = await Promise.all(body.photos.map(async (photo) => {
      if (photo.url.includes('/temp/')) {


        const urlParts = photo.url.split('/upload/');
        const afterUpload = urlParts[1];
        const publicId = afterUpload.split('.')[0].substring(afterUpload.indexOf('/') + 1);
        

        const newPublicId = `properties/${property._id}/${publicId.split('/').pop()}`;
        
        try {
          // Move the image to the new folder
          const result = await cloudinary.uploader.rename(publicId, newPublicId);
          return {
            ...photo,
            url: result.secure_url,
            public_id: result.public_id
          };
        } catch (error) {
          console.error('Error moving image:', error);
          return photo; // Keep original if move fails
        }
      }
      return photo;
    }));


    property.photos = updatedPhotos;
    await property.save();

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create property' },
      { status: 500 }
    );
  }
} 