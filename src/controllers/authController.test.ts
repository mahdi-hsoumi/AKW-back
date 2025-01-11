import request from 'supertest';
import app from '../app';
import User from '../models/user';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();
process.env.JWT_SECRET = 'your_test_secret';

// Mock the User model
jest.mock('../models/user');

describe('Auth Controller', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI || '', {});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.prototype.save as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return 400 if user already exists', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post('/api/auth/register').send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should register the initial admin user', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'admin',
        email: process.env.INITIAL_ADMIN_EMAIL,
        password: 'hashedpassword',
        role: 'admin',
      };

      (User.findOne as jest.Mock).mockResolvedValue(null);
      (User.prototype.save as jest.Mock).mockResolvedValue(mockUser);

      const response = await request(app).post('/api/auth/register').send({
        username: 'admin',
        email: process.env.INITIAL_ADMIN_EMAIL,
        password: process.env.INITIAL_ADMIN_PASSWORD,
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        role: 'user',
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jest.spyOn(jwt, 'sign').mockImplementation(() => 'mockToken');

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mockToken');
    });

    it('should return 400 if credentials are invalid', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });

  describe('POST /api/auth/promote', () => {
    it('should promote a user to admin', async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        username: 'testuser',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        save: jest.fn().mockResolvedValue(true),
      };

      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ role: 'admin' }));

      const response = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', 'Bearer mockToken')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('User promoted to admin');
      expect(mockUser.role).toBe('admin');
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 404 if user is not found', async () => {
      (User.findOne as jest.Mock).mockResolvedValue(null);
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ role: 'admin' }));

      const response = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', 'Bearer mockToken')
        .send({ email: 'nonexistent@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });

    it('should return 403 if the requester is not an admin', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => ({ role: 'user' }));

      const response = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', 'Bearer mockToken')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Access denied');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .post('/api/auth/promote')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token, authorization denied');
    });

    it('should return 401 if the token is invalid', async () => {
      jest.spyOn(jwt, 'verify').mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .post('/api/auth/promote')
        .set('Authorization', 'Bearer invalidToken')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Token is not valid');
    });
  });
});
