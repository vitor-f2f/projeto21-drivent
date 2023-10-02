import { noPaymentError, notFoundError } from '@/errors';
import { hotelsRepository } from '@/repositories';

async function getAllHotels(userId: number) {
    const enrollment = await hotelsRepository.findPaidEnrollment(userId);
    if (!enrollment) throw notFoundError();
    if (enrollment !== "PAID") throw noPaymentError();
    const hotels = await hotelsRepository.findAllHotels();
    return hotels;
}

async function getHotelById(userId: number, hotelId: number) {
    const enrollment = await hotelsRepository.findPaidEnrollment(userId);
    if (!enrollment) throw notFoundError;
    if (enrollment !== "PAID") throw noPaymentError();
    const hotels = await hotelsRepository.findHotelById(hotelId);
    return hotels;
}


export const hotelsService = {
    getAllHotels,
    getHotelById,
};
