import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = cookies();

    const response = await fetch(
      `${API_URL}/api/transactions/${id}/request`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieStore.toString(),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to request payment');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Request payment error:', error);
    return NextResponse.json(
      { message: 'Failed to request payment' },
      { status: 500 }
    );
  }
}