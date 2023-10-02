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
    if (!enrollment || !enrollment.Ticket || !enrollment.Ticket.TicketType.includesHotel) return null;
    return enrollment.Ticket.status;
}

async function findAllHotels() {
    const result = await prisma.hotel.findMany();
    return result;
}

async function findHotelById(hotelId: number) {
    const result = await prisma.hotel.findUnique({
        where: { id: hotelId }
    });

    return result;
}

export const hotelsRepository = {
    findAllHotels,
    findHotelById,
    findPaidEnrollment
};
