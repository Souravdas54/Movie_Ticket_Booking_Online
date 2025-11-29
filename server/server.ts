import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import ejs from 'ejs'
// import session from 'express-session';
// import flash from 'connect-flash';
import cookieParser from "cookie-parser";
import cors from 'cors'
import { connectDatabase } from './config/dbConnection';
import { createDefaultRoles } from './middleware/role.middleware';
import { swaggerSetup } from "./swagger";

connectDatabase()

const app = express();

// swaggerSetup(app);

// Routers
import { adminRouter } from './routes/ejs router/admin.route';
import { userRouter } from './routes/user.route';
import { movieRouter } from './routes/movie.route';
import { theaterRouter } from './routes/theater.route';
import { showRouter } from './routes/show.route';
import { bookingRouter } from './routes/booking.route';

// import { showRepository } from "./repository/show.repo";

// setInterval(() => {
//     showRepository.releaseExpiredLocks().catch(console.error);
// }, 60 * 1000);

app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// app.use(session({
//     name: "movie-session", // খুব গুরুত্বপূর্ণ
//     secret: process.env.SESSION_SECRET || 'MyS3cr3tK3Yforemost345',
//     resave: false,
//     saveUninitialized: false,
//     rolling: true,
//     cookie: {
//         secure: false,          // localhost এ সবসময় false
//         httpOnly: true,
//         sameSite: 'lax',
//         maxAge: 24 * 60 * 60 * 1000
//     }
// }));

// Flash middleware (MUST be after session)
// app.use(flash());

// // Make flash messages available in all responses
// app.use((req, res, next) => {
//     res.locals.success = req.flash('success');
//     res.locals.error = req.flash('error');
//     res.locals.warning = req.flash('warning');
//     res.locals.info = req.flash('info');
//     next();
// });

app.use(createDefaultRoles);

// Admin Router
app.use('/admin', adminRouter)
// Router
app.use('/auth', userRouter)
// Movie
app.use('/movies', movieRouter)
// Theater
app.use('/theaters', theaterRouter)
// Show
app.use('/shows', showRouter)
// Booking
app.use('/booking', bookingRouter)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error'
    });
});

// 404 handler
// app.use('*', (req, res) => {
//     res.status(404).json({
//         success: false,
//         message: 'Route not found'
//     });
// });

// console.log("RUNNING MODE:", process.env.NODE_ENV);

app.listen(process.env.PORT, () =>
    console.log(`Server is listening on port http://localhost:${process.env.PORT}`)
)
