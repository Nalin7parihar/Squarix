import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const cookieStore = cookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/add-member/${id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add member to group');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { message: 'Failed to add member to group' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const cookieStore = cookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/remove-member/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Cookie: cookieStore.toString(),
        },
        body: JSON.stringify(body),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to remove member from group');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { message: 'Failed to remove member from group' },
      { status: 500 }
    );
  }
}