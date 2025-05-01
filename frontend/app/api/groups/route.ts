import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/all`, {
      credentials: 'include', // This will forward cookies automatically
    });

    if (!response.ok) {
      throw new Error('Failed to fetch groups');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return Response.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/groups/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to create group');
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Create group error:', error);
    return Response.json({ error: 'Failed to create group' }, { status: 500 });
  }
}