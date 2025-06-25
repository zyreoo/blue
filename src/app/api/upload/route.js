import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Add debug logging
console.log('Attempting to configure Cloudinary...');

cloudinary.config({
  cloud_name: 'dizwqfgrr',
  api_key: process.env.CLOUDINARY_API_KEY || '687277786534624',
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function POST(request) {
  try {
    const headersList = headers();
    // Generate a unique session ID for this upload batch
    const uploadSessionId = headersList.get('x-upload-session') || `session-${Date.now()}`;

    // Log the current configuration
    console.log('Current Cloudinary Config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? '**present**' : '**missing**',
      api_secret: cloudinary.config().api_secret ? '**present**' : '**missing**'
    });

    const data = await request.formData();
    const file = data.get('file');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary in a temporary session folder
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: `properties/temp/${uploadSessionId}`,
          tags: ['temp', uploadSessionId], // Add tags for easier management
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('Cloudinary upload success:', result.secure_url);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
      uploadSessionId: uploadSessionId
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
} 