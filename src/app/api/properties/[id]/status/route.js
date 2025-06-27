import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = params;
    const { status } = await request.json();
    
    console.log(`Attempting to update property ${id} status to: ${status}`);

    await dbConnect();


    const property = await Property.findById(id);
    if (!property) {
      console.log(`Property ${id} not found`);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (property.hostEmail !== session.user.email) {
      console.log(`Unauthorized: ${session.user.email} is not the owner of property ${id}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }


    console.log(`Current status: ${property.status}`);


    property.status = status;
    await property.save();


    console.log(`Successfully updated property ${id} status from ${property.status} to ${status}`);

    return NextResponse.json({ success: true, property });
  } catch (error) {
    console.error('Error updating property status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 