import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Property from '@/models/Property';

const sampleProperties = [
  {
    title: "Modern Studio in Downtown",
    location: "San Mateo",
    adminEmail: "sanmateo.admin@blue.com",
    price: 150,
    imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    type: "Apartment",
    description: "Bright and modern studio in the heart of downtown",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    roomCapacity: 2,
    personCapacity: 2,
    petsAllowed: true,
    maxPets: 1,
    amenities: ["WiFi", "Kitchen", "Air Conditioning"]
  },
  {
    title: "Luxury Villa with Pool",
    location: "Tiburon",
    adminEmail: "tiburon.admin@blue.com",
    price: 550,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
    type: "Villa",
    description: "Stunning villa with private pool and bay views",
    bedrooms: 4,
    bathrooms: 3.5,
    maxGuests: 8,
    roomCapacity: 6,
    personCapacity: 10,
    petsAllowed: true,
    maxPets: 2,
    amenities: ["Pool", "WiFi", "Kitchen", "Parking", "Ocean View"]
  },
  {
    title: "Cozy Mountain Cabin",
    location: "Mill Valley",
    adminEmail: "millvalley.admin@blue.com",
    price: 220,
    imageUrl: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8",
    type: "Cabin",
    description: "Rustic cabin surrounded by redwoods",
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    roomCapacity: 3,
    personCapacity: 4,
    petsAllowed: true,
    maxPets: 2,
    amenities: ["Fireplace", "WiFi", "Kitchen", "Forest View"]
  },
  {
    title: "Downtown Loft",
    location: "San Francisco",
    adminEmail: "sf.admin@blue.com",
    price: 300,
    imageUrl: "https://images.unsplash.com/photo-1536376072261-38c75010e6c9",
    type: "Loft",
    description: "Industrial chic loft in vibrant downtown",
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    roomCapacity: 2,
    personCapacity: 3,
    petsAllowed: false,
    maxPets: 0,
    amenities: ["WiFi", "Kitchen", "City View", "Air Conditioning"]
  },
  {
    title: "Family House with Garden",
    location: "San Carlos",
    adminEmail: "sancarlos.admin@blue.com",
    price: 275,
    imageUrl: "https://images.unsplash.com/photo-1518780664697-55e3ad937233",
    type: "House",
    description: "Spacious family home with beautiful garden",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    roomCapacity: 4,
    personCapacity: 6,
    petsAllowed: true,
    maxPets: 3,
    amenities: ["Garden", "WiFi", "Kitchen", "Parking", "BBQ"]
  },
  {
    title: "Tech Hub Apartment",
    location: "Palo Alto",
    adminEmail: "paloalto.admin@blue.com",
    price: 495,
    imageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9",
    type: "Apartment",
    description: "Modern apartment near major tech companies",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    roomCapacity: 3,
    personCapacity: 4,
    petsAllowed: false,
    maxPets: 0,
    amenities: ["WiFi", "Kitchen", "Gym", "Parking", "Air Conditioning"]
  }
];

export async function GET() {
  try {
    const baseUri = process.env.MONGODB_URI;
    if (!baseUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    const uri = baseUri.replace(/\/[^/]*(\?|$)/, '/blue$1');
    
    const conn = await mongoose.createConnection(uri).asPromise();
    const deleteResult = await conn.collection('properties').deleteMany({});

    const insertResult = await conn.collection('properties').insertMany(sampleProperties);

    await conn.close();

    return NextResponse.json({
      message: 'Database seeded successfully',
      database: 'blue',
      deletedCount: deleteResult.deletedCount,
      insertedCount: Object.keys(insertResult.insertedIds).length
    }, { status: 200 });
  } catch (error) {

    return NextResponse.json({ 
      error: 'Error seeding database',
      details: error.message
    }, { status: 500 });
  }
} 