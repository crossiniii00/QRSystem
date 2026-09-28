import { NextResponse } from 'next/server';
import { defaultRequirementRepository } from '../../../../../modules/requirements/infrastructure/requirement.repository';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const requirements = await defaultRequirementRepository.getRequirementsForProgram(params.id);
    return NextResponse.json({
      success: true,
      data: requirements,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: { message: "Failed to fetch requirements" },
      meta: { timestamp: new Date().toISOString() }
    }, { status: 500 });
  }
}
