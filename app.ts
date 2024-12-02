// imports
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import mongoose from 'mongoose';

// router imports
import indexRouter from './routes/indexRouter';
import userRouter from './routes/userRouter';
import productRouter from './routes/productRouter';


// loads the environment variables 
dotenv.config();

// setup a connection to the MongoDB via mongoose
mongoose.set('strictQuery', false);
const mongoConnectionURI: string = process.env.MONGO_URI || "mongodb://localhost:27017/imagined_dev";

main().catch((err) => console.log(err));
async function main(){
  try{
    await mongoose.connect(mongoConnectionURI);
    console.log("Connected To MongoDB...");
  } catch(err){
    console.error("Connection Error to MongoDB...")
  }
}

// an instance of the express module
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev')); 

// defining middlewares to be used by express
// this list includes an index route, user routes,
// product and order routes
app.use('/', indexRouter);
app.use('/api/users/', userRouter);
app.use('/api/products/', productRouter);


// setup the express http server so we
// can listen to requests at port 3000
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
