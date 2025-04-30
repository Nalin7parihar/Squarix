import { NextResponse } from 'next/server';

// In a real app, you would import user model and validation
// import { User } from '@/models/user';
// import { validateCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { email, password } = body;
    
    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // TODO: Forward request to the backend login endpoint
    // The backend should handle validation and set the HttpOnly cookie
    
    // For demo purposes, we'll simulate a successful login if email contains "@"
    // and password is at least 6 characters long
    if (!email.includes('@') || password.length < 6) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Simulate a user object that would come from the backend response
    const user = {
      id: '1',
      name: 'Nalin Parihar',
      email: email,
      // Never include password in the response
    };
    
    // // REMOVED: Cookie setting logic - backend handles this
    // const token = 'mock-jwt-token-' + Math.random().toString(36).substring(2);
    // const cookieStore = cookies();
    // cookieStore.set({
    //   name: 'auth_token',
    //   value: token,
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production', // Use secure in production
    //   sameSite: 'strict',
    //   path: '/',
    //   // Expires in 7 days
    //   maxAge: 60 * 60 * 24 * 7,
    // });
    
    // Return the user data (without sensitive information)
    // This should ideally come from the backend response
    return NextResponse.json({ 
      message: 'Login successful (simulated)',
      user
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}