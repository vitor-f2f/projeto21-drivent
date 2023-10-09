import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingService } from '@/services';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;

    const booking = await bookingService.getBooking(userId);
    res.status(httpStatus.OK).send(booking);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;

    const booking = await bookingService.postBooking(userId, roomId);
    res.status(httpStatus.OK).send(booking);
}

export async function putBooking(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { roomId } = req.body;
    const bookingId = Number(req.params.bookingId);

    const booking = await bookingService.updateBooking(userId, roomId, bookingId);
    res.status(httpStatus.OK).send(booking);
}