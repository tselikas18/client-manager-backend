import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors'
import mongoose from "mongoose";
import { config } from "../config"
import router from './router/indexRouter'
import swaggerUi from 'swagger-ui-express';
import {specs} from "./swagger/swaggerConfig";

const app = express();
const databaseURL = config.MONGODB_URL;
// 'http://localhost:5173'

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://client-manager-frontend-676t.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.get('/', (req, res) => {
  res.json({
    message: 'Client Manager API is running',
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

app.use('/', router())

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.originalUrl
  });
});

const server = http.createServer(app)

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

console.log(`db is running at ${databaseURL}`);

mongoose.Promise = Promise;
mongoose.connect(databaseURL);
mongoose.connection.on('error', (error: Error) => console.log(error));