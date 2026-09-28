import { NextResponse } from 'next/server';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const body = await request.json();
    return NextResponse.json({
      success: true,
      data: {
        status: 'SUBMITTED'
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to submit application" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
