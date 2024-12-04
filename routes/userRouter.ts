// imports
import { Router } from 'express';
import userController from '../controllers/userControllers';

// create a router instance to handle routes 
// for the user route
const router = Router();

// various routes to handle retrieval, creation and updation of users 
router.get('/', userController.getAllUsers);
router.get('/:userId', userController.getUser);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);


// exports
export default router;
