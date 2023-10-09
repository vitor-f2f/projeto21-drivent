import supertest from 'supertest';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { TicketStatus } from '@prisma/client';
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketType, createUser, createBooking, createRoomWithHotelId, createHotel, createRoomForOne } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import app, { init } from '@/app';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    describe('when token is invalid', () => {
        it('should respond with status 401 if given token is not valid', async () => {
            const token = faker.lorem.word();
            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe('when token is valid', () => {
        it('should respond with status 404 when there is no booking for user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 200 when valid booking is found', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);
            const booking = await createBooking(user.id, createdRoom.id);

            const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual({
                id: booking.id,
                Room: {
                    id: createdRoom.id,
                    name: createdRoom.name,
                    hotelId: createdHotel.id,
                    capacity: createdRoom.capacity,
                    createdAt: createdRoom.createdAt.toISOString(),
                    updatedAt: createdRoom.updatedAt.toISOString()
                }
            })
        })
    })
})

describe('POST /booking', () => {
    describe('when token is invalid', () => {
        it('should respond with status 401 if given token is not valid', async () => {
            const token = faker.lorem.word();
            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe('when token is valid', () => {
        it('should respond with status 403 when user ticket is remote ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 403 when ticket does not include hotel', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 403 when ticket is not paid ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomWithHotelId(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 403 when room is full ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const user2 = await createUser();
            const token2 = await generateValidToken(user2);

            const enrollment2 = await createEnrollmentWithAddress(user2);
            const ticketType2 = await createTicketType(false, true);
            const ticket2 = await createTicket(enrollment2.id, ticketType2.id, TicketStatus.PAID);
            await createPayment(ticket2.id, ticketType2.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);
            await server.post('/booking').set('Authorization', `Bearer ${token2}`).send({ roomId: createdRoom.id });

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 404 when room does not exist ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id + 1 });
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with status 200 when booking is successful ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);

            const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number),
            })
        });

    })
})

describe('PUT /booking/:bookingId', () => {
    describe('when token is invalid', () => {
        it('should respond with status 401 if given token is not valid', async () => {
            const token = faker.lorem.word();
            const response = await server.post('/booking/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })
    describe('when token is valid', () => {
        it('should respond with status 404 when room does not exist ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            const response = await server.put(`/booking/${booking.body.bookingId}`).set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id + 1 });
            expect(response.status).toEqual(httpStatus.NOT_FOUND);
        });

        it('should respond with status 403 when user does not have previous booking ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);

            const response = await server.put(`/booking/1`).set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });

        it('should respond with status 403 when new room has no room', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);
            const createdRoom2 = await createRoomForOne(createdHotel.id);

            const user2 = await createUser();
            const token2 = await generateValidToken(user2);

            const enrollment2 = await createEnrollmentWithAddress(user2);
            const ticketType2 = await createTicketType(false, true);
            const ticket2 = await createTicket(enrollment2.id, ticketType2.id, TicketStatus.PAID);
            await createPayment(ticket2.id, ticketType2.price);

            await server.post('/booking').set('Authorization', `Bearer ${token2}`).send({ roomId: createdRoom2.id });

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            const response = await server.put(`/booking/${booking.body.bookingId}`).set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom2.id });
            expect(response.status).toEqual(httpStatus.FORBIDDEN);
        });


        it('should respond with status 200 when booking is successful ', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);

            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            await createPayment(ticket.id, ticketType.price);

            const createdHotel = await createHotel();
            const createdRoom = await createRoomForOne(createdHotel.id);
            const createdRoom2 = await createRoomForOne(createdHotel.id);

            const booking = await server.post('/booking').set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom.id });
            const response = await server.put(`/booking/${booking.body.bookingId}`).set('Authorization', `Bearer ${token}`).send({ roomId: createdRoom2.id });
            expect(response.status).toEqual(httpStatus.OK);
            expect(response.body).toEqual({
                bookingId: expect.any(Number),
            })
        });

    })
})