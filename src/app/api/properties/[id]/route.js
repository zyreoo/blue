import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';

// Update a property
export async function PUT(request, { params }) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the property
    const property = await Property.findById(params.id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if the user owns the property
    if (property.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this property' },
        { status: 403 }
      );
    }

    // Get the updated data
    const updates = await request.json();

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      params.id,
      updates,
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update property' },
      { status: 500 }
    );
  }
}

// Delete a property
export async function DELETE(request, { params }) {
  try {
    // Get the user's session
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Find the property
    const property = await Property.findById(params.id);

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Check if the user owns the property
    if (property.owner.toString() !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to delete this property' },
        { status: 403 }
      );
    }

    // Delete the property
    await Property.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete property' },
      { status: 500 }
    );
  }
} 