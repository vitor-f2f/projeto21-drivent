import { Router } from 'express';
import { getAllHotels, getHotel } from '@/controllers';
import { authenticateToken } from '@/middlewares';

const hotelsRouter = Router();

hotelsRouter
    .all('/*', authenticateToken)
    .get('/:hotelId', getHotel)
    .get('/', getAllHotels);

export { hotelsRouter };
