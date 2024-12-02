// imports
import mongoose, { Model, model , Schema } from "mongoose";

// an interface to explicitily 
// describe each category document
interface Category{
    name: string,
}

// defining a document schema of type "Order".
// each order will have a name as attributes/fields
const categorySchema: Schema<Category> = new Schema({
    name: {type: String, required: true},
})

// initializing a "Category" model
const Category: Model<Category> = model<Category>('Category', categorySchema);

// exports
export default Category;