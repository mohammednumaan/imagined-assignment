// imports
import { Request, Response } from 'express';
import Product from '../models/products';
import Category from '../models/category';


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
const getProduct = async (req: Request, res: Response): Promise<void> => {
    try {
  
      // retrieve the specific product's id
      const { id } = req.params; 
  
      // find the product in the database
      // by the id recieved from the query parameters
      const product = await Product.findById(id);
  
      // check if the product exists in the database,
      // if it doesn't, notify the client that the product is nt found
      if (!product) {
        res.status(404).json({ message: 'Product not found' });
        return;
      }
  
      // else, we send the user info to the client
      // note: we wouldn't send the entire info to the client due to 
      // security reasons to avoid sending passwords (if implemented) and other 
      // sensitive info. Instead, we send basic details such as name.
      res.status(200).json({ message: 'Product retrieved successfully', product });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error fetching product', error });
    }
  }


// a simple middleware that handles a "POST" request for product creation
const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, price, stock } = req.body;

    // first, we check if the category exists, if it doesn't we
    // create the category and proceed to create the product
    let relatedCategory = await Category.findOne({name: category});
    if (!relatedCategory){
        relatedCategory = await Category.create({name: category});
    }

    // check if the product exists, if it does exist,
    // we notify the client that the product already exists
    const productExists = await Product.findOne({name, category: relatedCategory});
    if (!productExists){
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
};

// a simple middleware that handles a "POST" request for product updation
const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params; 
    const updatedInfo = req.body; 

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
};

export default {getAllProducts, getProduct, createProduct, updateProduct}