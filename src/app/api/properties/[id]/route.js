import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';
import User from '@/models/User';
import fs from 'fs/promises';
import path from 'path';

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    const property = await Property.findById(params.id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this property' },
        { status: 403 }
      );
    }

    const updates = await request.json();

    const updatedProperty = await Property.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedProperty);
  } catch (error) {

    return NextResponse.json(
      { error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    const property = await Property.findById(params.id);
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    if (property.hostEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Not authorized to delete this property' },
        { status: 403 }
      );
    }

    const propertyDir = path.join(process.cwd(), 'public', 'properties', property._id.toString());
    try {
      await fs.rm(propertyDir, { recursive: true, force: true });
    } catch (error) {
      console.error('Error deleting property photos:', error);
    }

    await User.findOneAndUpdate(
      { email: session.user.email },
      { $pull: { properties: property._id } }
    );

    const user = await User.findOne({ email: session.user.email });
    if (user.properties.length === 0) {
      await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { isHost: false } }
      );
    }

    await Property.findByIdAndDelete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Property deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();
    
    const { id } = params;
    const body = await request.json();
    
    const property = await Property.findById(id);
    
    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if the user is authorized to update this property
    if (property.hostEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Not authorized to update this property' },
        { status: 403 }
      );
    }

    // Update all editable fields
    if (body.description !== undefined) {
      property.description = body.description;
    }
    if (body.propertyType !== undefined) {
      property.propertyType = body.propertyType;
    }
    if (body.details?.bedrooms !== undefined) {
      property.details.bedrooms = body.details.bedrooms;
    }
    if (body.details?.bathrooms !== undefined) {
      property.details.bathrooms = body.details.bathrooms;
    }
    if (body.pricing?.basePrice !== undefined) {
      property.pricing.basePrice = body.pricing.basePrice;
    }
    if (body.location?.city !== undefined) {
      property.location.city = body.location.city;
    }
    if (body.location?.country !== undefined) {
      property.location.country = body.location.country;
    }

    await property.save();

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const { id } = params;
    const property = await Property.findById(id);

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 