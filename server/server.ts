import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { connectDatabase } from './config/dbConnection';
connectDatabase()
const app = express();

import { createDefaultRoles } from './middleware/role.middleware';
import cors from 'cors'

// Routers
import { userRouter } from './routes/user.router';
import { movieRouter } from './routes/movie.router';


app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(createDefaultRoles);

// Router call
app.use('/auth',userRouter)
app.use(movieRouter)


app.listen(process.env.PORT, () =>
    console.log(`Server is listening on port http://localhost:${process.env.PORT}`)
)
