import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request) {
  try {

    const body = await request.json().catch(e => {
      console.error('Failed to parse request body:', e);
      return null;
    });

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { firstName, lastName, email, phoneNumber, password } = body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'All fields are required', 
          missing: {
            firstName: !firstName,
            lastName: !lastName,
            email: !email,
            phoneNumber: !phoneNumber,
            password: !password
          }
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      await connectDB();
    } catch (error) {
      console.error('Database connection failed:', error);
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check for existing user
    try {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Error checking existing user:', error);
      return NextResponse.json(
        { error: 'Failed to check existing user' },
        { status: 500 }
      );
    }

    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    } catch (error) {
      console.error('Password hashing failed:', error);
      return NextResponse.json(
        { error: 'Failed to process password' },
        { status: 500 }
      );
    }

    try {
      const user = await User.create({
        firstName,
        lastName,
        email: email.toLowerCase(),
        phoneNumber,
        password: hashedPassword
      });

      const { password: _, ...userWithoutPassword } = user.toObject();

      return NextResponse.json({
        message: 'User registered successfully',
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('User creation failed:', error);

      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return NextResponse.json(
          { error: `${field} already exists` },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to create account', details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Signup process failed:', error);
    return NextResponse.json(
      { error: 'Failed to create account', details: error.message },
      { status: 500 }
    );
  }
} 