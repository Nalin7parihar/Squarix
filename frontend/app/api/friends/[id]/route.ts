import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = cookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends/${id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: cookieStore.toString(),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete friend');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete friend error:', error);
    return NextResponse.json(
      { message: 'Failed to delete friend' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const cookieStore = cookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/friends/${id}`,
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
      throw new Error('Failed to update friend');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Update friend error:', error);
    return NextResponse.json(
      { message: 'Failed to update friend' },
      { status: 500 }
    );
  }
}