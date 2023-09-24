import { prisma } from '@/config';

async function findTypes() {
    return prisma.ticketType.findMany();
}

export const ticketsRepository = {
    findTypes,
};
