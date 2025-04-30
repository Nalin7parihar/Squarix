import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // TODO: Forward request to the backend logout endpoint
    // The backend should handle clearing the HttpOnly cookie

    return NextResponse.json({ message: 'Logged out successfully (simulated)' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}