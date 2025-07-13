import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        try {
          await connectDB();
          console.log('Auth: Looking for user with email:', credentials.email.toLowerCase());
          const user = await User.findOne({ email: credentials.email.toLowerCase() });
          
          if (!user) {
            console.log('Auth: No user found with email:', credentials.email);
            throw new Error('No user found with this email');
          }

          console.log('Auth: User found:', {
            id: user._id.toString(),
            email: user.email,
            isSuperAdmin: user.isSuperAdmin
          });

          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isValid) {
            console.log('Auth: Invalid password for user:', user.email);
            throw new Error('Invalid password');
          }

          console.log('Auth: Login successful, returning user data with isSuperAdmin:', user.isSuperAdmin);
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.firstName + ' ' + user.lastName,
            isSuperAdmin: user.isSuperAdmin
          };
        } catch (error) {
          console.error('Auth: Error during authorization:', error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        console.log('JWT Callback: Adding user data to token:', {
          id: user.id,
          email: user.email,
          isSuperAdmin: user.isSuperAdmin
        });
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.isSuperAdmin = user.isSuperAdmin;
      }
      console.log('JWT Callback: Final token:', token);
      return token;
    },
    async session({ session, token }) {
      if (token) {
        console.log('Session Callback: Adding token data to session:', {
          id: token.id,
          email: token.email,
          isSuperAdmin: token.isSuperAdmin
        });
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.isSuperAdmin = token.isSuperAdmin;
      }
      console.log('Session Callback: Final session:', session);
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 