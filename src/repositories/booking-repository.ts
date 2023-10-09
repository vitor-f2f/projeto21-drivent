import { prisma } from '@/config';

async function findBooking(userId: number) {
    const booking = await prisma.booking.findFirst({
        where: { userId },
        include: {
            Room: true,
        },
    });
    if (!booking || !booking.Room) return null;
    return booking;
}

async function checkRoom(roomId: number) {
    return await prisma.room.findFirst({
        where: {
            id: roomId
        },
        include: {
            Booking: true
        }
    })
}

async function postBooking(userId: number, roomId: number) {
    const result = await prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
    return result;
}

async function updateBooking(bookingId: number, roomId: number) {
    const result = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            roomId
        }
    });

    if (!result) return null;

    return result;
}

export const bookingRepository = {
    updateBooking,
    postBooking,
    checkRoom,
    findBooking
};