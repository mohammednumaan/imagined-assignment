// imports
import { Request, Response } from 'express';
import apicache from 'apicache';
import User from '../models/user';

// a basic cache implmentation to improve performance
const cache = apicache.middleware;

// a simple middleware that handles a "GET" request for fetching all the users
const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
    
        // we fetch all the products in the database
        const allUsers = await User.find({}).sort({email: 1});
    
        // check if any product exists in the database,
        // if it doesn't, notify the client that there are no products
        if (!allUsers) {
          res.status(404).json({ message: 'No Users Found' });
          return;
        }
    
        // else, we send all the product's info to the client
        res.status(200).json({ message: 'All Users retrieved successfully', allUsers });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching all users', error });
      }
}

// we implement a basic cache-aside strategy and cache the data for 10 minutes 
// this significantly improved performance
export const cachedGetAllUsers = [cache('10 minutes'), getAllUsers];


// a simple middleware thath handles a "GET" request for fetching users
const getUser = async (req: Request, res: Response): Promise<void> => {
  try {

    // retrieve the specific user's id
    const { userId } = req.params; 

    // find the user in the database
    // by the id recieved from the query parameters
    const user = await User.findById(userId);

    // check if the user exists in the database,
    // if it doesn't, notify the client that the user is not found
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // else, we send the user info to the client
    // note: we wouldn't send the entire info to the client due to 
    // security reasons to avoid sending passwords (if implemented) and other 
    // sensitive info. Instead, we send basic details such as name.
    res.status(200).json({ message: 'User retrieved successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching user', error });
  }
}

// a simple middleware that handles a "POST" request for user creation
const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body;

    // check if the user exists, if it does exist,
    // we notify the client that the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User Already Exists!' });
      return;
    }

    // else, we create a new user with the provided details
    // and store it in the mongo database
    const newUser = await User.create({ name, email, phone });
    res.status(201).json({ message: 'User Created Successfully.', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// a simple middleware that handles a "POST" request for user updation
const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params; 
    const updatedInfo = req.body; 

    // check if the user exists in the database
    // it it doesn't notify the client that there is no 
    // such user 
    const userExists = await User.findById(userId);
    if (!userExists) {
      res.status(400).json({ message: 'User Not Found!' });
      return;
    }

    // else, we get the relevant user and update their information
    // here, we ensure  data integrity by validating the new data,
    // we make sure that the new data follows the schema rules via the 
    // runValidators option
    const updatedUser = await User.findByIdAndUpdate(userId, updatedInfo, {
      new: true, 
      runValidators: true, 
    });

    res.status(200).json({ message: 'User Updated Successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user', error });
  }
};


// exporting the controllers/middlewares
export default {cachedGetAllUsers, getUser, createUser, updateUser};