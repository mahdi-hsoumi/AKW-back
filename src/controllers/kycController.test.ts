import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import KYC from '../models/kyc';
import { isAdmin, isAuthenticatedUser } from '../middlewares/auth';

import dotenv from 'dotenv';

dotenv.config();
process.env.JWT_SECRET = 'your_test_secret';

jest.mock('../middlewares/auth');

describe('KYC Controller', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || '', {});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/kyc/submit', () => {
    it('should submit KYC data', async () => {
      (isAuthenticatedUser as jest.Mock).mockImplementation(
        (req, res, next) => {
          req.userId = new mongoose.Types.ObjectId();
          next();
        },
      );

      const response = await request(app)
        .post('/api/kyc/submit')
        .set('Authorization', 'Bearer mockToken')
        .send({
          name: 'John Doe',
          idDocument: 'path/to/idDocument',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('KYC data submitted successfully');
    });
  });

  describe('GET /api/kyc', () => {
    it('should retrieve KYC data', async () => {
      const userId = new mongoose.Types.ObjectId();

      (isAuthenticatedUser as jest.Mock).mockImplementation(
        (req, res, next) => {
          req.userId = userId;
          next();
        },
      );

      const kyc = new KYC({
        userId: userId,
        name: 'John Doe',
        idDocument: 'path/to/idDocument',
        status: 'pending',
      });
      await kyc.save();

      const response = await request(app)
        .get('/api/kyc')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('John Doe');
    });
  });

  describe('PUT /api/kyc/:userId/status', () => {
    it('should update KYC status', async () => {
      (isAdmin as jest.Mock).mockImplementation((req, res, next) => {
        req.userId = new mongoose.Types.ObjectId();
        next();
      });

      const kyc = new KYC({
        userId: new mongoose.Types.ObjectId(),
        name: 'John Doe',
        idDocument: 'path/to/idDocument',
        status: 'pending',
      });
      await kyc.save();

      const response = await request(app)
        .put(`/api/kyc/${kyc.userId}/status`)
        .set('Authorization', 'Bearer mockToken')
        .send({
          status: 'approved',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('KYC status updated successfully');
    });
  });
});
