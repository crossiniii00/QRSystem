import { Request, Response, Router } from 'express';
import { defaultProgramRepository } from '../../modules/programs/infrastructure/program.repository';
import { defaultRequirementRepository } from '../../modules/requirements/infrastructure/requirement.repository';

export const programsRouter = Router();

// GET /api/programs
programsRouter.get('/', async (req: Request, res: Response, next) => {
  try {
    const programs = await defaultProgramRepository.findAll(true);
    res.json({
      success: true,
      data: programs,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/programs/:id/requirements
programsRouter.get('/:id/requirements', async (req: Request, res: Response, next) => {
  try {
    const { id } = req.params;
    const requirements = await defaultRequirementRepository.getRequirementsForProgram(id);
    res.json({
      success: true,
      data: requirements,
    });
  } catch (err) {
    next(err);
  }
});
