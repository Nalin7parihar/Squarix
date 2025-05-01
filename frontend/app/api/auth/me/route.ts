import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  try {
    // Forward request to the backend endpoint that verifies the session/token
    const response = await fetch(`${API_URL}/api/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: response.status }
      );
    }

    // Get the user data from the backend response
    const userData = await response.json();

    // Return the user data
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Authentication check error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    );
  }
}