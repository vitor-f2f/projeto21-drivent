import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getEventTypes } from '@/controllers';
import { createOrUpdateEnrollmentSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
    .all('/*', authenticateToken)
    .get('/types', authenticateToken, getEventTypes)

// .post('/', validateBody(createOrUpdateEnrollmentSchema), postCreateOrUpdateEnrollment);

export { ticketsRouter };
