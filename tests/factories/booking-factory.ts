import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createBooking(userId: number, roomId: number) {
    return await prisma.booking.create({
        data: {
            userId: userId,
            roomId: roomId,
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent()
        },
    });
}
