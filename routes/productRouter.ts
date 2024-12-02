// imports
import { Router } from 'express';
import productController from '../controllers/productController';

// create a router instance to handle routes 
// for the product route
const router = Router();

// various routes to handle retrieval, creation and updation of product 
router.get('/', productController.getAllProducts);
router.get('/:userId', productController.getProduct);

router.post('/', productController.createProduct);
router.put('/:userId', productController.updateProduct);


// exports
export default router;
