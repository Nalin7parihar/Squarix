import { NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();

    // Forward request to the backend login endpoint
    const response = await fetch(`${API_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    // Get the response data
    const data = await response.json();

    // Forward the response status and headers
    const headers = new Headers();

    // Handle cookies from the backend response
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
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}