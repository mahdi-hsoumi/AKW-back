import express from 'express';
import errorHandler from './middlewares/errorHandler';
import helmet from 'helmet';
import cors from 'cors';
import limiter from './config/rateLimit';
import setupSwagger from './config/swagger';
import authRoutes from './routes/auth';
import healthRoutes from './routes/health';
import kycRoutes from './routes/kyc';
import userRoutes from './routes/user';

const app = express();

// Trust the first proxy
app.set('trust proxy', 1);

// Configure middleware
app.use(helmet());

app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    credentials: true // Allow cookies to be sent
}))

app.use(express.json());
app.use(errorHandler);
app.use(limiter);

setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', healthRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
