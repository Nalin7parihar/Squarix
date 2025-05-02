import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    // Use the new backend endpoint specifically for friend expenses
    const response = await fetch(`${API_URL}/api/friends/${id}/expenses`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      credentials: 'include',
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorData = await response.text();
      return NextResponse.json(
        { message: `Error fetching friend expenses: ${response.statusText}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching friend expenses:', error);
    return NextResponse.json(
      { message: 'Failed to fetch friend expenses. Please try again.' },
      { status: 500 }
    );
  }
}