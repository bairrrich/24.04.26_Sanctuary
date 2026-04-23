import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Stub: In the future, this will clear test data from the database
    // using Prisma to delete records flagged as test data
    return NextResponse.json({ success: true, message: 'Test data cleared' });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to clear test data' },
      { status: 500 }
    );
  }
}
