import { Router } from 'express';
import { getAllHotels, getHotelById } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter
    .all('/*', authenticateToken)
    .get('/:hotelId', getHotelById)
    .get('/', getAllHotels);

export { hotelsRouter };
