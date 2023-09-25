import { Ticket, TicketType } from '@prisma/client';
import dayjs from 'dayjs';
import { notFoundError } from '@/errors';
import { ticketsRepository } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

async function getTypes(): Promise<TicketType[]> {
    const types = await ticketsRepository.findTypes();
    return types;
}

async function getTicket(id: number): Promise<TicketResult> {
    const ticket = await ticketsRepository.findTicket(id);
    if (!ticket) throw notFoundError();
    return ticket;
}

async function createTicket(userId: number, ticketType: number): Promise<Ticket> {
    const ticket = await ticketsRepository.postTicket(userId, ticketType);
    if (!ticket) throw notFoundError();
    return ticket;
}

export type CreateTicketParams = {
    ticketTypeId: number
}

type TicketResult = {
    id: number,
    status: 'RESERVED' | 'PAID'
    ticketTypeId: number,
    enrollmentId: number,
    TicketType: {
        id: number,
        name: string,
        price: number,
        isRemote: boolean,
        includesHotel: boolean,
        createdAt: Date,
        updatedAt: Date,
    },
    createdAt: Date,
    updatedAt: Date,
}

export const ticketsService = {
    getTypes,
    getTicket,
    createTicket
};
