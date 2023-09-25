import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getEventTypes, getUserTicket } from '@/controllers';
import { createOrUpdateEnrollmentSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
    .all('/*', authenticateToken)
    .get('/types', getEventTypes)
    .get('/', getUserTicket)

// .post('/', validateBody(createOrUpdateEnrollmentSchema), postCreateOrUpdateEnrollment);

export { ticketsRouter };
