// imports
import { Router } from 'express';
import orderController from '../controllers/orderController';

// create a router instance to handle routes 
// for the order route
const router = Router();

// various routes to handle retrieval, creation and updation of orders 
router.get('/', orderController.cachedGetAllOrders);

router.get('/past-week', orderController.cachedGetAllWeeklyOrders);
router.get('/:userId', orderController.getUserOrders);

router.post('/', orderController.createOrders);
router.put('/:orderId/:productId', orderController.updateOrder);


// exports
export default router;
    