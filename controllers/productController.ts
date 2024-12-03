// imports
import { body, validationResult } from "express-validator";
import { Request, Response } from 'express';
import Product from '../models/products';
import Category from '../models/category';
import Order from '../models/orders';
import mongoose, { mongo } from 'mongoose';


// a simple middleware that handles a "GET" request for fetching all the products
const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
    
        // we fetch all the products in the database
        const allProducts = await Product.find({});
    
        // check if any product exists in the database,
        // if it doesn't, notify the client that there are no products
        if (!allProducts) {
          res.status(404).json({ message: 'No Products Found' });
          return;
        }
    
        // else, we send all the product's info to the client
        res.status(200).json({ message: 'All Products retrieved successfully', allProducts });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all products', error });
      }
}

// a simple middleware that handles a "GET" request for fetching a specific product
const getSpecificProduct = async (req: Request, res: Response): Promise<void> => {
    try {
  
      // retrieve the specific product's id
      const { productId } = req.params; 
  
      // find the product in the database
      // by the id recieved from the query parameters
      const product = await Product.findById(productId);
  
      // check if the product exists in the database,
      // if it doesn't, notify the client that the product is nt found
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
  
      // else, we send the product info to the client
      res.status(200).json({ message: 'Product retrieved successfully', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching product', error });
    }
}

// a simple middleware that handles a "GET" request for fetching users who bought a specific product
const getUsersForProduct = async (req: Request, res: Response): Promise<void> => {
  try {

    // retrieve the specific product's id
    const { productId } = req.params; 

    // find the product in the database
    // by the id recieved from the query parameters
    const product = await Product.findById(productId);

    // check if the product exists in the database,
    // if it doesn't, notify the client that the product is nt found
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // then, we fetch all the orders for that specific product
    const users = await Order.aggregate([
      {$match: {product: new mongoose.Types.ObjectId(productId)}},
      {
          $lookup: {
              from: "users",
              localField: "user",
              foreignField: "_id",
              as: "allUsers",
          },
      },

      { $unwind: "$allUsers" },

      {
          $group: {
              _id: "$allUsers._id",
              name: { $first: "$allUsers.name" },
              email: { $first: "$allUsers.email" },
          },
      },
  ]);

    // we are now ready to send the user payload to the client
    res.status(200).json({ message: 'Users retrieved successfully', users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
}

// a simple middleware to handle a "GET" request to compute and retrieve
// the total stock quantity for all products
const getTotalProductQuantity = async (req: Request, res: Response): Promise<void> => {
    try {
        
        // we compute the total stock quantity by using aggregation functions,
        // here we first group all the products together and compute the sum
        // of each product's quantity
        const allProducts = await Product.aggregate([
            { $group: { _id: null, totalStockQuantity: { $sum: "$stock" } } }
        ])

        // then, we proceed to "extract" the final quantity value from the above array,
        // if the length is 0, we simply set the total as 0, else, we set the aggregated value
        const totalQuantity = allProducts.length > 0 ? allProducts[0].totalStockQuantity : 0;
        
        res.status(200).json({ message: 'Computed total stock quantity successfully', totalQuantity });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error computing total stock quantity', error });
    }
}


// a simple middleware that handles a "POST" request for product creation
const createProduct = [

  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Product name is required and must be a string."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0."),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0."),
  body("category")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category name is required and must be a string."),

  async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, price, stock } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // first, we check if the category exists, if it doesn't we
    // create the category and proceed to create the product
    let relatedCategory = await Category.findOne({name: category});
    if (!relatedCategory){
        relatedCategory = await Category.create({name: category});
    }

    // check if the product exists, if it does exist,
    // we notify the client that the product already exists
    const productExists = await Product.findOne({name, category: relatedCategory});
    if (productExists){
          res.status(400).json({ message: 'Product Already Exists!' });
          return;
    }

    // else, we create a new product with the provided details
    // and store it in the mongo database
    const newProduct = await Product.create({ name, category: relatedCategory, price, stock });
    res.status(201).json({ message: 'Product Created Successfully.', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating product', error });
  }
}];

// a simple middleware that handles a "POST" request for product updation
const updateProduct = [
  
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Product name is required and must be a string."),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number greater than or equal to 0."),
  body("stock")
    .isInt({ min: 0 })
    .withMessage("Stock must be an integer greater than or equal to 0."),
  body("category")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Category name is required and must be a string."),

  async (req: Request, res: Response): Promise<void> => {
  try {
    
    const { productId } = req.params; 
    const updatedInfo = req.body;   

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // check if the user exists in the database
    // it it doesn't notify the client that there is no 
    // such user 
    const productExists = await Product.findById(productId);
    if (!productExists) {
      res.status(400).json({ message: 'Product Not Found!' });
      return;
    }

    // else, we get the relevant product and update their information
    // here, we ensure  data integrity by validating the new data,
    // we make sure that the new data follows the schema rules via the 
    // runValidators option
    const updatedProduct = await Product.findByIdAndUpdate(productId, updatedInfo, {
      new: true, 
      runValidators: true, 
    });

    res.status(200).json({ message: 'Product Updated Successfully', user: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating product', error });
  }
}];  


// exports
export default {getAllProducts, getSpecificProduct, getUsersForProduct, getTotalProductQuantity,  createProduct, updateProduct}