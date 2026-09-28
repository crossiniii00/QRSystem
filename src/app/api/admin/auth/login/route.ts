import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Mock Login for the UI preset accounts
    if (email === 'admin@stfrancis.edu' && password === 'AdminPass2026!') {
      return NextResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-admin-token-12345',
          user: {
            id: 'admin-1',
            email: 'admin@stfrancis.edu',
            fullName: 'Dean Eleanor Vance',
            role: 'Dean of Admissions'
          }
        }
      });
    }

    if (email === 'staff@stfrancis.edu' && password === 'StaffPass2026!') {
      return NextResponse.json({
        success: true,
        data: {
          token: 'mock-jwt-staff-token-67890',
          user: {
            id: 'staff-1',
            email: 'staff@stfrancis.edu',
            fullName: 'Officer Marcus Aurel',
            role: 'Admissions Officer'
          }
        }
      });
    }

    return NextResponse.json(
      { success: false, error: { message: 'Invalid credentials' } },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { message: 'Authentication failed' } },
      { status: 500 }
    );
  }
}
