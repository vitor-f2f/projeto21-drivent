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
    if (!enrollment) return null;

    const ticket = await prisma.ticket.findFirst({
        where: {
            enrollmentId: enrollment.id,
        },
        include: {
            TicketType: true,
        }
    });

    if (!ticket) return null;

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

async function postTicket(userId: number, ticketType: number) {
    const enrollment = await prisma.enrollment.findFirst({
        where: {
            userId: userId
        }
    })
    if (!enrollment) return null;
    const ticket = await prisma.ticket.create({
        data: {
            status: "RESERVED",
            ticketTypeId: ticketType,
            enrollmentId: enrollment.id
        },
        include: { TicketType: true }
    })
    return ticket;
}

export const ticketsRepository = {
    findTypes,
    findTicket,
    postTicket
};
