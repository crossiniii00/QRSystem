import { NextResponse } from 'next/server';
import { defaultProgramRepository } from '../../../modules/programs/infrastructure/program.repository';

export async function GET() {
  try {
    const programs = await defaultProgramRepository.findAll(true);
    return NextResponse.json({
      success: true,
      data: programs,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to fetch programs" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
