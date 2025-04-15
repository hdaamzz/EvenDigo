
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import * as admin from 'firebase-admin';
import serviceAccount from './configs/serviceAccountKey.json';
import dotenv from 'dotenv';
dotenv.config();
// import session from "express-session";
import './configs/container';
import connectDB from './configs/db';
import cookieParser from 'cookie-parser';
import router from './routes/router';
import stripeWebhookRouter from "./routes/user/webhook.routes";

const PORT: string | undefined = process.env.PORT;

const app=express();
const corsOptions={
    origin: process.env.CLIENT_SERVER, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  
};
// stripe listen --forward-to localhost:3000/webhooks/stripe

app.use('/webhooks/stripe', express.raw({ type: 'application/json' }), stripeWebhookRouter);

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
