
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
import { createServer } from 'http';
import router from './routes/router';
import stripeWebhookRouter from "./routes/user/webhook.routes";
import { container } from "./configs/container";
import { RevenueDistributionCronService } from "./services/implementation/cronjob/revenue.distribution";
import { SocketConfig } from "./configs/socket";

const PORT: string | undefined = process.env.PORT;

const app=express();
const httpServer = createServer(app);
const corsOptions={
    origin: process.env.CLIENT_SERVER, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  
};

const socketConfig = container.resolve(SocketConfig);
socketConfig.initializeSocket(httpServer);


// stripe listen --forward-to localhost:3000/webhooks/stripe
const revenueDistributionCron = container.resolve(RevenueDistributionCronService);
revenueDistributionCron.startCronJob();
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
