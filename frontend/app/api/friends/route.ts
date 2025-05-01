import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';

export async function GET() {
  console.log("Frontend API route /api/friends hit");
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    console.error("Frontend API /api/friends: No access token found");
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const backendUrl = `${API_URL}/api/friends`;
    console.log(`Frontend API /api/friends: Fetching from backend: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    console.log(`Frontend API /api/friends: Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Frontend API /api/friends: Backend fetch failed (${response.status}):`, errorData);
      return NextResponse.json({ message: `Backend error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log("Frontend API /api/friends: Successfully fetched data from backend");
    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend API /api/friends: Error fetching friends:', error);
    return NextResponse.json({ message: 'Internal Server Error fetching friends' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("Frontend API route /api/friends POST hit");
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    console.error("Frontend API /api/friends POST: No access token found");
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const backendUrl = `${API_URL}/api/friends`;
    console.log(`Frontend API /api/friends POST: Sending to backend: ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log(`Frontend API /api/friends POST: Backend response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Frontend API /api/friends POST: Backend fetch failed (${response.status}):`, errorData);
      return NextResponse.json({ message: `Backend error: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data = await response.json();
    console.log("Frontend API /api/friends POST: Successfully sent data to backend");
    return NextResponse.json(data);
  } catch (error) {
    console.error('Frontend API /api/friends POST: Error adding friend:', error);
    return NextResponse.json({ message: 'Internal Server Error adding friend' }, { status: 500 });
  }
}