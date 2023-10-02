import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { hotelsService } from '@/services';

export async function getAllHotels(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotels = await hotelsService.getAllHotels(userId);
    return res.status(httpStatus.OK).send(hotels);
}

export async function getHotel(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const hotelId = parseInt(req.params.hotelId);
    const ticket = await hotelsService.getHotelById(userId, hotelId);
    res.status(httpStatus.OK).send(ticket);
}
