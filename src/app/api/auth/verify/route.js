import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import VerificationCode from '@/models/VerificationCode';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: 'ozli riab szvr cggg'
  }
});



const rateLimitStore = new Map();


const RATE_LIMIT_WINDOW = 60 * 60 * 1000; 
const MAX_ATTEMPTS_PER_WINDOW = 5; 
const RATE_LIMIT_CLEANUP_INTERVAL = 60 * 60 * 1000; 


setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now - value.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitStore.delete(key);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL);


function isRateLimited(email) {
  const now = Date.now();
  const userAttempts = rateLimitStore.get(email);

  if (!userAttempts) {
    rateLimitStore.set(email, { attempts: 1, timestamp: now });
    return false;
  }

  if (now - userAttempts.timestamp > RATE_LIMIT_WINDOW) {

    rateLimitStore.set(email, { attempts: 1, timestamp: now });
    return false;
  }

  if (userAttempts.attempts >= MAX_ATTEMPTS_PER_WINDOW) {
    return true;
  }


  userAttempts.attempts += 1;
  return false;
}


function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: 'Too many verification attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }


    const existingCode = await VerificationCode.findOne({ email: email.toLowerCase() });
    if (existingCode) {
      const timeLeft = Math.ceil((existingCode.createdAt.getTime() + 600000 - Date.now()) / 1000 / 60);
      return NextResponse.json(
        { error: `Please wait ${timeLeft} minutes before requesting a new code` },
        { status: 429 }
      );
    }


    const verificationCode = generateVerificationCode();
    await VerificationCode.create({
      email: email.toLowerCase(),
      code: verificationCode
    });

    try {

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${verificationCode}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="font-size: 32px; letter-spacing: 5px; color: #4a5568; text-align: center; padding: 20px; background: #f7fafc; border-radius: 8px;">
              ${verificationCode}
            </h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      await VerificationCode.deleteOne({ email: email.toLowerCase() });
      throw new Error('Failed to send verification email');
    }

    return NextResponse.json({ message: 'Verification code sent' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send verification code' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const { email, code } = await request.json();
    
    await connectDB();
    

    const verificationCode = await VerificationCode.findOne({
      email: email.toLowerCase(),
      code: code
    });
    
    if (!verificationCode) {
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }
    
    await VerificationCode.deleteOne({ _id: verificationCode._id });

    return NextResponse.json({ message: 'Verification successful' });
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
} 