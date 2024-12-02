// imports
import mongoose, { Model, model, ObjectId, Schema } from "mongoose";

// an interface to explicitily 
// describe each product document
interface Product{
    name: string,
    category: ObjectId, 
    price: number,
    stock: number

}

// defining a document schema of type "Product".
// each product will have a name
// and stock as attributes/fields
const productSchema: Schema<Product> = new Schema({
    name: {type: String, required: true},
    category: {type: mongoose.Types.ObjectId, ref: "Category", required: true},
    price: {type: Number, required: true},
    stock: {type: Number, required: true},
    
})

// initializing a "Product" model
const Product: Model<Product> = model<Product>('Product', productSchema);

// exports
export default Product;