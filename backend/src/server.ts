
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as admin from 'firebase-admin';
import serviceAccount from './configs/serviceAccountKey.json';
import dotenv from 'dotenv';
dotenv.config();
import './configs/container';
import connectDB from './configs/db';
import cookieParser from 'cookie-parser';
import router from './routes/router';

const PORT: string | undefined = process.env.PORT;



const app=express();
const corsOptions={
    origin: process.env.CLIENT_SERVER, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  
};


//Middlewares
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());


//Database Connection
connectDB();


app.use('/api',router)


//firebase config
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});


if(!PORT) {
    throw new Error('PORT is not defined in env')
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})
