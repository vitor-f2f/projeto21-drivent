import { Event, TicketType } from '@prisma/client';
import dayjs from 'dayjs';
import { notFoundError } from '@/errors';
import { ticketsRepository } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

async function getTypes(): Promise<TicketType[]> {
    const types = await ticketsRepository.findTypes();
    return types;
}

export const ticketsService = {
    getTypes
};
