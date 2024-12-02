// imports
import { Router } from 'express';
import orderController from '../controllers/orderController';

// create a router instance to handle routes 
// for the order route
const router = Router();

// various routes to handle retrieval, creation and updation of product 
router.get('/past-week', orderController.getWeeklyOrder);
router.get('/:orderId', orderController.getOrder);

router.post('/', orderController.createOrders);

// exports
export default router;
