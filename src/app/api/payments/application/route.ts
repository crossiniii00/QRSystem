import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        transactions: []
      },
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to fetch transactions" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
