import express from 'express';
import consign from 'consign';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import socket from 'socket.io';
import morgan from 'morgan' 

import database from './config/database';

const app = express();

const server = require('http').createServer();

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

//app.gameDB = config
app.database = database;
app.io = socket(server);

dotenv.config();

consign()
.include('./config/passport')
.then('./utils')
.then('middlewares')
.then('./apis')
.then('./models')
.then('./routes')
.into(app);

server.listen(process.env.SOCKET_PORT, () => {
  console.log('Socket.IO running...');
});

app.listen(process.env.PORT, () => {
  console.log('Server is running...');
});
