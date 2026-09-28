import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      data: {
        applicationId: 'app-mock-1234',
        referenceNumber: 'REF-MOCK-' + Math.floor(Math.random() * 10000),
        accessToken: 'mock-access-token-abc'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to create application" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
