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
    const uploadSessionId = headersList.get('x-upload-session') || `session-${Date.now()}`;

    // Verify Cloudinary configuration
    if (!cloudinary.config().api_secret) {
      console.error('Cloudinary API secret is missing');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('Current Cloudinary Config:', {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key ? '**present**' : '**missing**',
      api_secret: cloudinary.config().api_secret ? '**present**' : '**missing**'
    });

    const data = await request.formData();
    const files = data.getAll('photos');

    if (!files || files.length === 0) {
      console.error('No files provided in request');
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${files.length} files for upload...`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        console.log(`Processing file ${index + 1}:`, file.name || 'unnamed file');
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'auto',
              folder: `properties/temp/${uploadSessionId}`,
              tags: ['temp', uploadSessionId],
            },
            (error, result) => {
              if (error) {
                console.error(`Error uploading file ${index + 1}:`, error);
                reject(error);
              } else {
                console.log(`Successfully uploaded file ${index + 1}:`, result.secure_url);
                resolve(result);
              }
            }
          );

          uploadStream.end(buffer);
        });
      } catch (error) {
        console.error(`Error processing file ${index + 1}:`, error);
        throw error;
      }
    });

    const results = await Promise.all(uploadPromises);
    console.log('All files uploaded successfully');
    return NextResponse.json({
      url: results[0].secure_url,
      public_id: results[0].public_id
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + error.message },
      { status: 500 }
    );
  }
} 