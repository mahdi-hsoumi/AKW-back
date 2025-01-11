// src/routes/kyc.ts
import { Router } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import s3 from '../config/s3';
import {
  submitKYC,
  getKYC,
  updateKYCStatus,
  getKPI,
  listKYC,
} from '../controllers/kycController';
import { isAdmin, isAuthenticatedUser } from '../middlewares/auth';
import validate from '../middlewares/validate';
import {
  submitKYCSchema,
  updateKYCStatusSchema,
  listKYCQuerySchema,
} from '../validators/kyc';

import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    acl: 'public-read',
    key: (req, file, cb) => {
      cb(null, `kyc/${Date.now().toString()}_${file.originalname}`);
    },
  }),
});

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
 *         multipart/form-data:
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
 *                 format: binary
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
  upload.single('idDocument'),
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
 * /api/kyc/kpi:
 *   get:
 *     summary: Get KPI data
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KPI data retrieved successfully
 *       401:
 *         description: No token, authorization denied
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/kpi', isAdmin, getKPI);

/**
 * @swagger
 * /api/kyc/list:
 *   get:
 *     summary: List KYC applications
 *     tags: [KYC]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: Filter by KYC status
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of KYC applications
 *       401:
 *         description: No token, authorization denied
 *       403:
 *         description: Access denied
 *       500:
 *         description: Server error
 */
router.get('/list', isAdmin, validate(listKYCQuerySchema), listKYC);

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
