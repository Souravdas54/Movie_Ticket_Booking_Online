//importing modules
import dotenv from 'dotenv'
import mongoose from 'mongoose'

dotenv.config()

//details from the env
const username = process.env.DB_USERNAME
const password = process.env.DB_PASSWORD
const dbName = 'Movie_Ticket_Booking'

const connectionString = `mongodb+srv://${username}:${password}@cluster0.ewwcraz.mongodb.net/${dbName}`


//db connection
export const connectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connect(connectionString)
        console.log(`Database connection succeffully ✔ to ${dbName}`)

    } catch (error) {
        console.error('Database connection error:', error);
        throw new Error(`Connection failed: No internet connection or MongoDB server unreachable.`);
    }
};

