// imports
import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

// router imports
import indexRouter from './routes/indexRouter';
import userRouter from './routes/userRouter';


// loads the environment variables 
dotenv.config();

// an instance of the express module
const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev')); 

app.use('/', indexRouter);
app.use('/api/users/', userRouter);


const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
