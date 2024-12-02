// imports
import { Request, Response } from 'express';
import Order from '../models/orders';
import Product from '../models/products';
import User from '../models/user';

// a simple middleware thath handles a "GET" request for fetching orders
const getOrder = async (req: Request, res: Response): Promise<void> => {
  try {

    // retrieve the specific user's id
    const { orderId } = req.params; 

    // find the user in the database
    // by the id recieved from the query parameters
    const user = await Order.findById(orderId);

    // check if the user exists in the database,
    // if it doesn't, notify the client that the user is not found
    if (!user) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json({ message: 'Order retrieved successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching order', error });
  }
}

// a simple middleware thath handles a "GET" request for fecthing orders in the past 7 days
const getWeeklyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      
      let currentDate = new Date();
      let lastSeventhDay = new Date();
      lastSeventhDay.setDate(currentDate.getDate() - 7);

      const lastSevenDaysOrders = await Order.aggregate([
       {
        $match: {
            orderDate: { $gte: lastSeventhDay, $lte: currentDate}
        },
        
       },
       {$sort: {orderDate: -1}} 
      ])

      res.status(200).json({ message: 'Last 7 Order retrieved successfully', lastSevenDaysOrders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching orders for the last 7 days', error });
    }
}


// a simple middleware thath handles a "GET" request for fetching orders
const createOrders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userMail, product, quantity} = req.body;

        const user = await User.findOne({email: userMail});
        if (!user){
            res.status(400).json({ message: 'User Does Not Exists!' });
            return;
        }

        const requiredProduct = await Product.findById(product);
        if (!requiredProduct){
              res.status(400).json({ message: 'Product Does Not Exists!' });
              return;
        }
    
        // else, we create a new order with the provided details
        // and store it in the mongo database
        const newOrder = await Order.create({ user, product, quantity, orderDate: new Date()});
        res.status(201).json({ message: 'Order Placed Successfully.', newOrder});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error placing order', error });
    }
}

export default {getOrder, getWeeklyOrder, createOrders}