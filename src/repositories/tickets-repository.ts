import { prisma } from '@/config';
import { notFoundError } from '@/errors';

async function findTypes() {
    return prisma.ticketType.findMany();
}

async function findTicket(id: number) {
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId: id
        }
    })
    if (!enrollment) throw notFoundError();

    const ticket = await prisma.ticket.findFirst({
        where: {
            enrollmentId: enrollment.id,
        },
        include: {
            TicketType: true,
        }
    });

    if (!ticket) throw notFoundError();

    const result = {
        id: ticket.id,
        status: ticket.status,
        ticketTypeId: ticket.ticketTypeId,
        enrollmentId: ticket.enrollmentId,
        TicketType: {
            id: ticket.TicketType.id,
            name: ticket.TicketType.name,
            price: ticket.TicketType.price,
            isRemote: ticket.TicketType.isRemote,
            includesHotel: ticket.TicketType.includesHotel,
            createdAt: ticket.TicketType.createdAt,
            updatedAt: ticket.TicketType.updatedAt,
        },
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
    };
    return result;
}
export const ticketsRepository = {
    findTypes,
    findTicket
};
