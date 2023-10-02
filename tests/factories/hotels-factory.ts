import { Hotel } from '@prisma/client';
import { createUser } from './users-factory';
import { prisma } from '@/config';
import faker from '@faker-js/faker';

export async function createHotel(token: string): Promise<Hotel> {
    return await prisma.hotel.create({
        data: {
            name: faker.company.companyName(),
            image: faker.image.imageUrl(),
        },
    });
}
