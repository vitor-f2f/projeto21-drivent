import { Hotel, Room } from '@prisma/client';
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

export async function createRoom(hotelId: number): Promise<Room> {
    return await prisma.room.create({
        data: {
            name: faker.name.findName(),
            capacity: faker.datatype.number(),
            hotelId,
            updatedAt: new Date()
        }
    })
}