import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors'
import mongoose from "mongoose";
import { config } from "../config"
import router from './router/indexRouter'


const app = express();
const databaseURL = config.MONGODB_URL;

app.use(cors({
  credentials: true,
}));

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const server = http.createServer(app)

server.listen(8000, () => { console.log('Server is running on port http://localhost:8000/'); });
console.log(`db is running at ${databaseURL}`);

mongoose.Promise = Promise;
mongoose.connect(databaseURL);
mongoose.connection.on('error', (error: Error) => console.log(error));

app.use('/', router())
