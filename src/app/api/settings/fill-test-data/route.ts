import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Stub: In the future, this will fill the database with test data
    // using Prisma models for each module
    return NextResponse.json({ success: true, message: 'Test data filled' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fill test data' },
      { status: 500 }
    );
  }
}
