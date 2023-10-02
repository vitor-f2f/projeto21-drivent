import { prisma } from '@/config';

async function findPaidEnrollment(userId: number) {
    const enrollment = await prisma.enrollment.findUnique({
        where: { userId },
        include: {
            Ticket: {
                include: {
                    TicketType: true,
                },

            },
        },
    });
    if (!enrollment || !enrollment.Ticket) return null;
    return enrollment.Ticket;
}

async function findAllHotels() {
    const result = await prisma.hotel.findMany();
    return result;
}

async function findHotelById(hotelId: number) {
    const result = await prisma.hotel.findUnique({
        where: { id: hotelId },
        include: {
            Rooms: true,
        },
    });

    if (!result) return null;

    return result;
}

export const hotelsRepository = {
    findAllHotels,
    findHotelById,
    findPaidEnrollment
};
