import { Router } from 'express';
import {
  submitKYC,
  getKYC,
  updateKYCStatus,
} from '../controllers/kycController';
import { isAdmin, isAuthenticatedUser } from '../middlewares/auth';
import validate from '../middlewares/validate';
import { submitKYCSchema, updateKYCStatusSchema } from '../validators/kyc';

const router = Router();

/**
 * @swagger
 * /api/kyc/submit:
 *   post:
 *     summary: Submit KYC data
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - idDocument
 *             properties:
 *               name:
 *                 type: string
 *               idDocument:
 *                 type: string
 *     responses:
 *       201:
 *         description: KYC data submitted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: No token, authorization denied
 *       500:
 *         description: Server error
 */
router.post(
  '/submit',
  isAuthenticatedUser,
  validate(submitKYCSchema),
  submitKYC,
);

/**
 * @swagger
 * /api/kyc:
 *   get:
 *     summary: Retrieve KYC data
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC data retrieved successfully
 *       401:
 *         description: No token, authorization denied
 *       404:
 *         description: KYC data not found
 *       500:
 *         description: Server error
 */
router.get('/', isAuthenticatedUser, getKYC);

/**
 * @swagger
 * /api/kyc/{userId}/status:
 *   put:
 *     summary: Update KYC status
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: KYC status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: No token, authorization denied
 *       403:
 *         description: Access denied
 *       404:
 *         description: KYC data not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:userId/status',
  isAdmin,
  validate(updateKYCStatusSchema),
  updateKYCStatus,
);

export default router;
