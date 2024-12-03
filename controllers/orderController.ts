// imports
import { body, validationResult } from "express-validator";
import { Request, Response } from 'express';
import Order from '../models/orders';
import Product from '../models/products';
import User from '../models/user';
import apicache from 'apicache';


// a basic cache implmentation to improve performance
const cache = apicache.middleware;

// a simple middleware thath handles a "GET" request for fetching orders of a specific user
const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {

      // retrieve the specific user's id
      const { userId } = req.params; 

    // find the order in the database
    // by the userId recieved from the query parameters
    const orders = await Order.find({user: userId}).populate("product").populate("user").sort({user: 1, orderDate: -1})


    // check if any orders exists in the database for the user,
    // if it doesn't, notify the client that no orders are placed
    if (orders.length == 0) {
      res.status(404).json({ message: 'No orders placed!' });
      return;
    }

    // finally, send the payload to the client
    res.status(200).json({ message: 'Orders retrieved successfully', orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching orders', error });
  }
}

// a simple middleware that handles a "GET" request for fecthing orders in the past 7 days
const getWeeklyOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      
      // computing the dates from today to the last 7 days
      let currentDate = new Date();
      let lastSeventhDay = new Date();
      lastSeventhDay.setDate(currentDate.getDate() - 7);

      // we now perform an aggregation to fetch order documents
      // for the past 7 days
      const lastSevenDaysOrders = await Order.aggregate([
       {
        $match: {
            orderDate: { $gte: lastSeventhDay, $lte: currentDate}
        },
        
       },
       {$sort: {orderDate: -1}} 
      ])

      // finally, send the payload to the client
      res.status(200).json({ message: 'Last 7 Order retrieved successfully', lastSevenDaysOrders });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching orders for the last 7 days', error });
    }
}

// we implement a basic cache-aside strategy and cache the data for 10 minutes 
// this significantly improved performance
export const cachedGetAllWeeklyOrders = [cache('10 minutes'), getWeeklyOrder];

// a simple middleware thath handles a "POST" request for order creation
const createOrders = [
  
  body("userId").trim().isMongoId().withMessage("User ID must be a valid Id").escape(),
  body("product").trim().isMongoId().withMessage("Product ID must be a valid Id").escape(),
  body("quantity")
  .optional()
  .trim()
  .escape(),
  body("orderDate")
    .optional()
    .trim()
    .isISO8601()
    .withMessage("Order date must be a valid date")
    .escape(),
  
  async (req: Request, res: Response): Promise<void> => {
    try {

        // retrieve order information
        const { userId, product, quantity} = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          res.status(400).json({ errors: errors.array() });
          return;
        }
        
        // check if the user exists
        const user = await User.findById(userId);
        if (!user){
            res.status(400).json({ message: 'User Does Not Exists!' });
            return;
        }

        // similarly, we check if the product exists
        const requiredProduct = await Product.findById(product);
        if (!requiredProduct){
              res.status(400).json({ message: 'Product Does Not Exists!' });
              return;
        } 

        // we then check if the ordered quantity is a valid quantity
        if (quantity > requiredProduct.stock){
          res.status(400).json({message: "Error creating the order. Order quantity exceeds the available stock! "})
          return;
        } else{

          // we update the product's stock
          const updatedStock = requiredProduct.stock - quantity;
          
          await Product.findByIdAndUpdate(
            product,
            {stock: updatedStock}
          )
        }
    
        // finally, we create a new order with the provided details
        // and store it in the mongo database
        const newOrder = await Order.create({ user, product, quantity, orderDate: new Date(), status: "placed"});
        res.status(201).json({ message: 'Order Placed Successfully.', newOrder});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error placing order', error });
    }
}];

// a simple middleware to handle a "PUT" request to handle updation of orders
const updateOrder = [

  body("quantity")
  .optional()
  .trim()
  .escape(),
  body("orderDate")
    .optional()
    .trim()
    .isISO8601()
    .withMessage("Order date must be a valid date")
    .escape(),
  body("status")
    .optional()
    .trim()
    .escape(),
  
  
  async (req: Request, res: Response): Promise<void> => {
  try {

      // retrieve the order and product id 
      // as well as the updated fields
      const { orderId, productId } = req.params; 
      let { quantity, orderDate, status } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      // if there is no re-schedule, status
      // we default them to the default values
      if (!orderDate) orderDate = new Date();
      if (!status) status = "placed"
      
      // check if the order exists, if it doesn't
      // we notify the client that no orders were found
      const order = await Order.findById(orderId);
      if (!order){
        res.status(404).json({ message: "Order not found" });
        return;
      }
      
      // similarly, we check if the product exists
      const product = await Product.findById(productId);
      if (!product){
        res.status(404).json({ message: "Product not found" });
        return;
      }
      

      // if no quantity is present, we default
      // its values to its exisitng quantity value
      if (!quantity) quantity = order.quantity;
      
      // then, we proceed to check the updated status,
      // if the status is cancelled, we proceed to "re-stock"
      // and update the relevant product and order info
      if (status === "cancelled"){

          // computing the new stock quantity value
          const updatedStock = product.stock + quantity;
          await Product.findByIdAndUpdate(
            productId,
            {stock: updatedStock}
          )
          
          // we then update the order.
          // note that, we are not deleting it
          // for enterprise applications we would "BACK-UP" this data
          // and probably do a routine deletion of redundant/unnecessary data
          await Order.findByIdAndUpdate(
            orderId,
            { product: productId, quantity: 0, orderDate, status},
        )
        res.status(200).json({message: "Order Cancelled Successfully! "})
        return;
      }

      // we now check if the quantity is a valid quantity
      if (quantity > product.stock){
        res.status(400).json({message: "Error updating the order. Order quantity exceeds the available stock! "})
        return;
      } else{

          let updatedStock;
          if (status === "placed"){
            updatedStock = (quantity < order.quantity) ? product.stock + (order.quantity - quantity) : product.stock - (quantity - order.quantity)
            await Product.findByIdAndUpdate(
              productId,
              {stock: updatedStock}
            )
          }
      }

      // we are now ready to proceed to update the order in a regular way
      // i.e updating quantity, status and etc,.
      const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { product: product.id, quantity, orderDate, status},
          { new: true, runValidators: true } 
      ).populate("user product");

      res.status(200).json({ message: "Order updated successfully", updatedOrder});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating order", error});
  }
}];

// exports
export default {getUserOrders, cachedGetAllWeeklyOrders, createOrders, updateOrder}