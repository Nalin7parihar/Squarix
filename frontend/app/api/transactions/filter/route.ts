import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);

  // Extract filter parameters
  const tab = searchParams.get('tab') || '';
  const timeFilter = searchParams.get('timeFilter') || '';
  const customDate = searchParams.get('customDate') || '';

  // Construct query string for backend
  const queryParams = new URLSearchParams();
  if (tab) queryParams.append('tab', tab);
  if (timeFilter) queryParams.append('timeFilter', timeFilter);
  if (customDate) queryParams.append('customDate', customDate);

  try {
    const response = await fetch(
      `${API_URL}/api/transactions/filter?${queryParams.toString()}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        credentials: 'include',
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to filter transactions');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction filter error:', error);
    return NextResponse.json(
      { message: 'Failed to filter transactions' },
      { status: 500 }
    );
  }
}