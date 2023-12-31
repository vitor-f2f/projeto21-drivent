import { TicketStatus } from '@prisma/client';
import { invalidDataError, notFoundError, cannotBookRoomError } from '@/errors';
import { enrollmentRepository, bookingRepository, ticketsRepository } from '@/repositories';

async function validateUserBooking(userId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();

    const type = ticket.TicketType;

    if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
        throw cannotBookRoomError();
    }
}

async function getBooking(userId: number) {
    await validateUserBooking(userId);

    const booking = await bookingRepository.findBooking(userId);
    if (!booking) throw notFoundError();

    return {
        id: booking.id,
        Room: booking.Room
    };
}

async function postBooking(userId: number, roomId: number) {
    await validateUserBooking(userId);
    const room = await bookingRepository.checkRoom(roomId);

    if (!room || !roomId || isNaN(roomId)) throw notFoundError();
    if (room.Booking.length >= room.capacity) throw cannotBookRoomError();

    const response = await bookingRepository.postBooking(userId, roomId);
    return {
        bookingId: response.id
    }
}

async function updateBooking(userId: number, roomId: number, bookingId: number) {
    await validateUserBooking(userId);
    const room = await bookingRepository.checkRoom(roomId);

    if (!room || !roomId || isNaN(roomId)) throw notFoundError();
    if (room.Booking.length >= room.capacity) throw cannotBookRoomError();

    const booking = await bookingRepository.checkBooking(userId, bookingId);
    if (!booking) throw cannotBookRoomError();

    const response = await bookingRepository.updateBooking(bookingId, roomId);
    return {
        bookingId: response.id
    }
}

export const bookingService = {
    getBooking,
    postBooking,
    updateBooking
};
