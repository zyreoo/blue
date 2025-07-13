import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Property from '@/models/Property';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
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

    // Check if user is superadmin or the property owner
    const isSuperAdmin = session.user.isSuperAdmin;
    const isOwner = property.hostEmail === session.user.email;

    if (!isSuperAdmin && !isOwner) {
      console.log(`Unauthorized: ${session.user.email} is not authorized to update property ${id}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Only superadmins can approve/reject properties
    if ((status === 'approved' || status === 'rejected') && !isSuperAdmin) {
      return NextResponse.json({ error: 'Only superadmins can approve or reject properties' }, { status: 403 });
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