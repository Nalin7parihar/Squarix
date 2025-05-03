import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { API_URL } from '@/lib/config';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const cookieStore = await cookies();

    const response = await fetch(
      `${API_URL}/api/transactions/settleTransaction/${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to settle transaction');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Settle transaction error:', error);
    return NextResponse.json(
      { message: 'Failed to settle transaction' },
      { status: 500 }
    );
  }
}