// imports
import { Request, Response } from 'express';
import User from '../models/user';

// a simple middleware that handles a "POST" request for user creation
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // check if the user exists, if it does exist,
    // we notify the client that the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'User Already Exists!' });
      return;
    }

    // else, we create a new user with the provided details
    // and store it in the mongo databas
    const newUser = await User.create({ name, email, password });
    res.status(201).json({ message: 'User Created Successfully.', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating user', error });
  }
};

// a simple middleware that handles a "POST" request for user updation
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 
    const updatedInfo = req.body; 

    // check if the user exists in the database
    // it it doesn't notify the client that there is no 
    // such user 
    const userExists = await User.findById({ id });
    if (!userExists) {
      res.status(400).json({ message: 'User Not Found!' });
      return;
    }

    // else, we get the relevant user and update their information
    // here, we ensure data integrity by validating the new data,
    // we make sure that the new data follows the schema rules via the 
    // runValidators option
    const updatedUser = await User.findByIdAndUpdate(id, updatedInfo, {
      new: true, 
      runValidators: true, 
    });

    res.status(200).json({ message: 'User Updated Successfully', user: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating user', error });
  }
};



