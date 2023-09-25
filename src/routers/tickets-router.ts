import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getEventTypes, getUserTicket, postUserTicket } from '@/controllers';
import { createTicketSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
    .all('/*', authenticateToken)
    .get('/types', getEventTypes)
    .get('/', getUserTicket)
    .post('/', validateBody(createTicketSchema), postUserTicket);

export { ticketsRouter };
