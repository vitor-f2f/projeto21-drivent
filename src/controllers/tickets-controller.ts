import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services';
import { CEP } from '@/protocols';

// getUserTickets, getTypes, postTicket

export async function getEventTypes(req: AuthenticatedRequest, res: Response) {
    const typeArray = await ticketsService.getTypes();
    return res.status(httpStatus.OK).json(typeArray);
}

export async function getUserTicket(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const ticket = await ticketsService.getTicket(userId);
    return res.status(httpStatus.OK).json(ticket);
}

export async function postUserTicket(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { ticketTypeId } = req.body;

    const ticket = await ticketsService.createTicket(userId, ticketTypeId);
    console.log(ticket);
    return res.status(httpStatus.CREATED).json(ticket);
}