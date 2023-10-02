import { generateCPF, getStates } from '@brazilian-utils/brazilian-utils';
import faker from '@faker-js/faker';
import dayjs from 'dayjs';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';

import { createEnrollmentWithAddress, createUser, createhAddressWithCEP, createTicket, createTicketSpecial, createHotel, createRoom } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
})

const server = supertest(app);

describe('GET /hotels', () => {
    describe('when token is invalid', () => {
        it('should respond with status 401 if no token is given', async () => {
            const response = await server.get('/hotels');

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it('should respond with status 401 if given token is not valid', async () => {
            const token = faker.lorem.word();
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it('should respond with status 401 if there is no session for given token', async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })

    describe('when token is valid', () => {
        it('should respond with status 404 when there is no enrollment for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 404 when there is no ticket for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 402 when the user's ticket isn't paid yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketSpecial(false, true);
            await createTicket(enrollment.id, ticketType.id, 'RESERVED');

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 404 when there are no hotels available", async () => {
            const user = await createUser();
            const enrollment = await createEnrollmentWithAddress(user);
            const token = await generateValidToken(user);
            const ticketType = await createTicketSpecial(false, true);
            await createTicket(enrollment.id, ticketType.id, 'PAID');

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })

        it("should respond with status 402 when the user's ticket doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketSpecial(false, false);
            await createTicket(enrollment.id, ticketType.id, 'PAID');

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when the user's ticket is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketSpecial(true, true);
            await createTicket(enrollment.id, ticketType.id, 'PAID');

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it('should respond with status 200 and hotel data when ticket is paid', async () => {
            const user = await createUser();
            const enrollment = await createEnrollmentWithAddress(user);
            const token = await generateValidToken(user);
            const ticketType = await createTicketSpecial(false, true);
            await createHotel(token);
            await createTicket(enrollment.id, ticketType.id, 'PAID');

            const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String)
                    })
                ])
            );
        });
    });
});

describe('GET /hotels/:hotelId', () => {
    describe('when token is invalid', () => {
        it('should respond with status 401 if no token is given', async () => {
            const response = await server.get('/hotels/1');

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it('should respond with status 401 if given token is not valid', async () => {
            const token = faker.lorem.word();
            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });

        it('should respond with status 401 if there is no session for given token', async () => {
            const userWithoutSession = await createUser();
            const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.UNAUTHORIZED);
        });
    })

    describe('when token is valid', () => {
        it('should respond with status 404 when given hotel id is invalid', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.get('/hotels/0').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        })
        it('should respond with status 404 when there is no enrollment for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it('should respond with status 404 when there is no ticket for given user', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            await createEnrollmentWithAddress(user);
            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.NOT_FOUND);
        });

        it("should respond with status 402 when the user's ticket isn't paid yet", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketSpecial(false, true);
            await createTicket(enrollment.id, ticketType.id, 'RESERVED');

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when the user's ticket doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketSpecial(false, false);
            await createTicket(enrollment.id, ticketType.id, 'PAID');

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 402 when the user's ticket is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketSpecial(true, true);
            await createTicket(enrollment.id, ticketType.id, 'PAID');

            const response = await server.get('/hotels/1').set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
        });

        it("should respond with status 200 and array of hotel rooms available", async () => {
            const user = await createUser();
            const enrollment = await createEnrollmentWithAddress(user);
            const token = await generateValidToken(user);
            const ticketType = await createTicketSpecial(false, true);
            await createTicket(enrollment.id, ticketType.id, 'PAID');
            const hotel = await createHotel(token);
            await createRoom(hotel.id);
            await createRoom(hotel.id);

            const response = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`);
            expect(response.status).toBe(httpStatus.OK);
            expect(response.body).toEqual(
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    image: expect.any(String),
                    createdAt: expect.any(String),
                    updatedAt: expect.any(String),
                    Rooms: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                            capacity: expect.any(Number),
                            hotelId: expect.any(Number),
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String),
                        })
                    ])
                })
            );
        });
    });
});