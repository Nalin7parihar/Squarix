import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    // Forward request to the backend logout endpoint
    const response = await fetch(`${API_URL}/api/user/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      // Forward cookies from the incoming request
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    // Get the response data
    const data = await response.json();

    // Forward the response status and headers
    const headers = new Headers();

    // Handle cookies from the backend response (to clear the token)
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      headers.set('set-cookie', setCookieHeader);
    }

    // Return the response from the backend
    return NextResponse.json(data, {
      status: response.status,
      headers
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}