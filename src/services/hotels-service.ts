import { noPaymentError, notFoundError } from '@/errors';
import { hotelsRepository } from '@/repositories';

async function getAllHotels(userId: number) {
    const enrollment = await hotelsRepository.findPaidEnrollment(userId);
    if (!enrollment) throw notFoundError();
    if (enrollment.status !== "PAID" || !enrollment.TicketType.includesHotel || enrollment.TicketType.isRemote) throw noPaymentError();

    const hotels = await hotelsRepository.findAllHotels();
    if (hotels.length === 0) throw notFoundError();
    return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
    const enrollment = await hotelsRepository.findPaidEnrollment(userId);
    if (!enrollment) throw notFoundError();
    if (enrollment.status !== "PAID" || !enrollment.TicketType.includesHotel || enrollment.TicketType.isRemote) throw noPaymentError();
    const hotel = await hotelsRepository.findHotelById(hotelId);
    if (!hotel) throw notFoundError();
    return hotel;
}


export const hotelsService = {
    getAllHotels,
    getHotelById,
};
