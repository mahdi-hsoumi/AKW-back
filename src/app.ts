import express from 'express';
import errorHandler from './middlewares/errorHandler';
import helmet from 'helmet';
import cors from 'cors';
import limiter from './config/rateLimit';
import setupSwagger from './config/swagger';

const app = express();

// Configure middleware
app.use(helmet());

const corsOptions = {
  origin: 'http://your-frontend-domain.com',
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(errorHandler);
app.use(limiter);

setupSwagger(app);

// Routes
app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
