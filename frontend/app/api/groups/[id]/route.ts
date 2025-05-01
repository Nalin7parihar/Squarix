import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const cookieStore = cookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/details/${id}`,
      {
        headers: {
          Cookie: cookieStore.toString(),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch group details');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Group details fetch error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch group details' },
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
    const cookieStore = cookies();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/delete/${id}`,
      {
        method: 'DELETE',
        headers: {
          Cookie: cookieStore.toString(),
        },
        credentials: 'include',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete group');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Delete group error:', error);
    return NextResponse.json(
      { message: 'Failed to delete group' },
      { status: 500 }
    );
  }
}