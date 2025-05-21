
import "reflect-metadata";
import express from 'express';
import http from 'http';
import cors from 'cors';
import morgan from 'morgan';
import * as admin from 'firebase-admin';
import serviceAccount from './configs/serviceAccountKey.json';
import dotenv from 'dotenv';
dotenv.config();
import './configs/container/index';
import connectDB from './configs/db';
import cookieParser from 'cookie-parser';
import router from './routes/router';
import stripeWebhookRouter from "./routes/user/webhook.routes";
import { container } from "./configs/container";
import { RevenueDistributionCronService } from "./services/implementation/cronjob/revenue.distribution";
import configureSocketIO from "./configs/socket";
import { debounceMiddleware } from './middlewares/debounce.middleware';


const PORT: string | undefined = process.env.PORT;

const app=express();
const server = http.createServer(app);
const corsOptions={
    origin: process.env.CLIENT_SERVER, 
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,  
};
const io = configureSocketIO(server);

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

app.use('/api', debounceMiddleware(500));
//Database Connection
connectDB();

app.set('io', io);

app.use('/api',router)


//firebase config
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});


if(!PORT) {
    throw new Error('PORT is not defined in env')
}

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

