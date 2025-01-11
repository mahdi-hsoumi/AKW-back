import { Router } from 'express';
import { isAuthenticatedUser } from '../middlewares/auth';
import { getMe } from '../controllers/userController';
const router = Router();

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     summary: Get current user information
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *       401:
 *         description: No token, authorization denied
 *       500:
 *         description: Server error
 */
router.get('/me', isAuthenticatedUser, getMe);

export default router;
