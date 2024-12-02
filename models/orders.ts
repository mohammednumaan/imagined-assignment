// imports
import mongoose, { Date, Model, model, ObjectId, Schema } from "mongoose";

// an interface to explicitily 
// describe each order document
interface Order{
    user: ObjectId,
    product: ObjectId,
    quantity: number,
    orderDate: Date
}

// defining a document schema of type "Order".
// each order will have a user, product, quantity
// and orderDate as attributes/fields
const orderSchema: Schema<Order> = new Schema({
    user: {type: mongoose.Types.ObjectId, ref: "User"},
    product: {type: mongoose.Types.ObjectId, ref: "Product"},
    quantity: {type: Number, required: true},
    orderDate: {type: Date, default: Date.now(), required: true}, 
})

// initializing a "Order" model
const Order: Model<Order> = model<Order>('Order', orderSchema);

// exports
export default Order;