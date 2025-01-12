import dotenv from 'dotenv';
import app from './app';
import connectDB from './config/database';
import logger from './config/logger';

dotenv.config();

const port = process.env.PORT || 3000;

// Connect to the database
connectDB();

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
