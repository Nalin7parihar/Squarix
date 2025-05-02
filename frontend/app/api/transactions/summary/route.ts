import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';

export async function GET() {
  const cookieStore = await cookies();

  try {
    const response = await fetch(`${API_URL}/api/transactions/getSummary`, {
      headers: {
        Cookie: cookieStore.toString(),
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transaction summary');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Transaction summary error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch transaction summary' },
      { status: 500 }
    );
  }
}