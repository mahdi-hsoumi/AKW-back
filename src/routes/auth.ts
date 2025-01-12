import { Router } from 'express';
import { register, login, promoteToAdmin } from '../controllers/authController';
import validate from '../middlewares/validate';
import { registerSchema, loginSchema, promoteSchema } from '../validators/auth';
import rateLimit from 'express-rate-limit';
import logger from '../config/logger';
import { isAdmin } from '../middlewares/auth';

const router = Router();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 5 login requests per windowMs
  message: 'Too many login attempts from this IP, please try again later.',
});

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: User already exists
 */
router.post(
  '/register',
  validate(registerSchema),
  (req, res, next) => {
    logger.info(`User registration attempt: ${req.body.email}`);
    next();
  },
  register,
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  limiter,
  validate(loginSchema),
  (req, res, next) => {
    logger.info(`User login attempt: ${req.body.email}`);
    next();
  },
  login,
);

/**
 * @swagger
 * /api/auth/promote:
 *   post:
 *     summary: Promote a user to admin
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *     responses:
 *       200:
 *         description: User promoted to admin
 *       400:
 *         description: Invalid request
 *       401:
 *         description: No token, authorization denied or Token is not valid
 *       403:
 *         description: Access denied
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post(
  '/promote',
  isAdmin,
  limiter,
  validate(promoteSchema),
  (req, res, next) => {
    logger.info(`Promotion attempt for user: ${req.body.email}`);
    next();
  },
  promoteToAdmin,
);

export default router;
