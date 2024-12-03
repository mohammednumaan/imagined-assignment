// imports
import mongoose, { Model, model, Schema } from "mongoose";


// an interface to explicitily 
// describe each user document
interface User{
    name: string,
    email: string, 
    phone: string,
}


// defining a document schema of type "User".
// each user will have a name, email and phone
// as attributes/fields
const userSchema: Schema<User> = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},
})

// setting up basic indexing for the category field
// to optimize querying for the user collection 
userSchema.index({ email: 1 });

// initializing a "User" model
const User: Model<User> = model<User>('User', userSchema);

// exports
export default User;