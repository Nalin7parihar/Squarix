import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Ensure we have the id parameter
    if (!params?.id) {
      return NextResponse.json(
        { success: false, message: 'Group ID is required' },
        { status: 400 }
      );
    }

    const groupId = params.id;
    // Forward the cookies from the incoming request
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${API_URL}/api/groups/${groupId}/expenses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader, // Forward all cookies from the request
      },
      credentials: 'include',
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch group expenses' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch group expenses. Please try again.' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;
    // Forward the cookies from the incoming request
    const cookieHeader = request.headers.get('cookie') || '';
    const formData = await request.formData();

    // Get required fields
    const title = formData.get('title');
    const amount = formData.get('amount');
    const category = formData.get('category');

    if (!title || !amount || !category) {
      return NextResponse.json(
        { success: false, message: 'Title, amount and category are required' },
        { status: 400 }
      );
    }

    // Forward the request to the backend API
    const response = await fetch(`${API_URL}/api/groups/${groupId}/expenses`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader, // Forward all cookies from the request
      },
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to add group expense' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error adding group expense:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to add group expense. Please try again.' },
      { status: 500 }
    );
  }
}