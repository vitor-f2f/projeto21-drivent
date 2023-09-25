import Joi from 'joi';
import { CreateTicketParams } from '@/services';

export const createTicketSchema = Joi.object<CreateTicketParams>({
    ticketTypeId: Joi.number().required(),
});
