import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import KYC from '../models/kyc';
import User from '../models/user';
import { isAdmin, isAuthenticatedUser } from '../middlewares/auth';
import path from 'path';

import dotenv from 'dotenv';

dotenv.config();
process.env.JWT_SECRET = 'your_test_secret';

// Mock the S3 upload
jest.mock('aws-sdk', () => {
  const S3 = {
    upload: jest.fn().mockReturnThis(),
    promise: jest.fn().mockResolvedValue({ Location: 'mocked_s3_url' }),
  };
  return { S3: jest.fn(() => S3) };
});

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
        .field('name', 'John Doe')
        .attach(
          'idDocument',
          path.resolve(__dirname, '../../static/testFile.jpg'),
        );
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

  describe('GET /api/kyc/kpi', () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await KYC.deleteMany({});
    });

    it('should retrieve KPI data', async () => {
      (isAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });

      await User.create({
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'hashedpassword',
        role: 'user',
      });

      await KYC.create([
        {
          userId: new mongoose.Types.ObjectId(),
          name: 'User1',
          idDocument: 'path/to/idDocument1',
          status: 'approved',
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: 'User2',
          idDocument: 'path/to/idDocument2',
          status: 'rejected',
        },
        {
          userId: new mongoose.Types.ObjectId(),
          name: 'User3',
          idDocument: 'path/to/idDocument3',
          status: 'pending',
        },
      ]);

      const response = await request(app)
        .get('/api/kyc/kpi')
        .set('Authorization', 'Bearer mockToken');

      expect(response.status).toBe(200);
      expect(response.body.totalUsers).toBe(1);
      expect(response.body.approvedKYCs).toBe(1);
      expect(response.body.rejectedKYCs).toBe(1);
      expect(response.body.pendingKYCs).toBe(1);
    });
  });

  describe('GET /api/kyc/list', () => {
    beforeEach(async () => {
      await User.deleteMany({});
      await KYC.deleteMany({});
    });

    it('should list KYC applications with filtering, sorting, and pagination', async () => {
      (isAdmin as jest.Mock).mockImplementation((req, res, next) => {
        next();
      });

      const userId1 = new mongoose.Types.ObjectId();
      const userId2 = new mongoose.Types.ObjectId();
      const userId3 = new mongoose.Types.ObjectId();

      await User.create([
        {
          _id: userId1,
          username: 'user1',
          email: 'user1@example.com',
          password: 'hashedpassword1',
          role: 'user',
        },
        {
          _id: userId2,
          username: 'user2',
          email: 'user2@example.com',
          password: 'hashedpassword2',
          role: 'user',
        },
        {
          _id: userId3,
          username: 'user3',
          email: 'user3@example.com',
          password: 'hashedpassword3',
          role: 'user',
        },
      ]);

      await KYC.create([
        {
          userId: userId1,
          name: 'User1',
          idDocument: 'path/to/idDocument1',
          status: 'approved',
        },
        {
          userId: userId2,
          name: 'User2',
          idDocument: 'path/to/idDocument2',
          status: 'rejected',
        },
        {
          userId: userId3,
          name: 'User3',
          idDocument: 'path/to/idDocument3',
          status: 'pending',
        },
      ]);

      const response = await request(app)
        .get('/api/kyc/list')
        .set('Authorization', 'Bearer mockToken')
        .query({
          status: 'approved',
          sortBy: 'name',
          sortOrder: 'asc',
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.kycs.length).toBe(1);
      expect(response.body.kycs[0].name).toBe('User1');
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.pages).toBe(1);
    });
  });
});
