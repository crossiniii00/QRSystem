import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        totalApplications: 120,
        pendingReview: 15,
        needsRevision: 3,
        approved: 80,
        rejected: 2,
        enrolled: 20
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to fetch stats" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
