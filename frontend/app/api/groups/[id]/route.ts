import { NextRequest, NextResponse } from 'next/server';
import { API_URL } from '@/lib/config';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const groupId = params.id;

    const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to delete group' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete group. Please try again.' },
      { status: 500 }
    );
  }
}