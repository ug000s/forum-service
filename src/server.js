import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRouter from './routes/post.routes.js';

dotenv.config();
const port = process.env.PORT || 8080;

const app = express();

// Middleware
app.use(express.json());
app.use(postRouter);

// 404
app.use((req, res) => res.status(404).type('text/plain', {charset: 'utf-8'}).send('Not Found'));

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {dbName: process.env.DB_NAME});
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`Press Ctrl+C to stop the server`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
    // process.exit(1);
  }
}

startServer();