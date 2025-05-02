import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    // Forward the cookies from the incoming request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${API_URL}/api/groups`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Forward all cookies from the request
      },
      credentials: 'include',
      cache: 'no-store' // Disable cache to ensure fresh data
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch groups' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch groups. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Forward the cookies from the incoming request
    const cookieHeader = request.headers.get('cookie') || '';
    const body = await request.json();

    if (!body.name || !body.members || !Array.isArray(body.members)) {
      return NextResponse.json(
        { success: false, message: 'Group name and members are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_URL}/api/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Forward all cookies from the request
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to create group' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create group. Please try again.' },
      { status: 500 }
    );
  }
}