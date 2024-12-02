// imports
import { Router } from 'express';

// create a router instance to handle routes 
// for the index route
const router = Router();

router.get('/', (req, res) => {
    res.send("Welcome To The E-Commerce Application.")
})


// exports
export default router;
