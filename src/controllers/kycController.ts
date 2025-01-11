import { Request, Response } from 'express';
import KYC from '../models/kyc';
import User from '../models/user';

// Submit KYC data
export const submitKYC = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  const userId = req.userId;
  const file = req.file;

  try {
    // Check if a KYC record already exists for the user
    const existingKYC = await KYC.findOne({ userId });
    if (existingKYC) {
      res.status(400).json({ message: 'KYC data already submitted' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const idDocumentUrl = (file as any).location;
    const kyc = new KYC({ userId, name, idDocument: idDocumentUrl });
    await kyc.save();
    res.status(201).json({ message: 'KYC data submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Retrieve KYC data
export const getKYC = async (req: Request, res: Response): Promise<void> => {
  const userId = req.userId;

  try {
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      res.status(404).json({ message: 'KYC data not found' });
      return;
    }
    res.status(200).json(kyc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update KYC status (admin only)
export const updateKYCStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      res.status(404).json({ message: 'KYC data not found' });
      return;
    }

    kyc.status = status;
    await kyc.save();

    res.status(200).json({ message: 'KYC status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get KPI data
export const getKPI = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const approvedKYCs = await KYC.countDocuments({ status: 'approved' });
    const rejectedKYCs = await KYC.countDocuments({ status: 'rejected' });
    const pendingKYCs = await KYC.countDocuments({ status: 'pending' });

    res.status(200).json({
      totalUsers,
      approvedKYCs,
      rejectedKYCs,
      pendingKYCs,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// List KYC applications with filtering, sorting, and pagination
export const listKYC = async (req: Request, res: Response): Promise<void> => {
  const { status, sortBy, sortOrder, page = 1, limit = 10 } = req.query;
  const filter: { status?: string } = {};
  if (status) {
    filter.status = status as string;
  }

  const sortOptions: { [key: string]: 1 | -1 } = {};
  if (sortBy && sortOrder) {
    sortOptions[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
  }

  const pageNumber = parseInt(page as string, 10);
  const pageSize = parseInt(limit as string, 10);

  try {
    const kycs = await KYC.find(filter)
      .sort(sortOptions)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);
    const total = await KYC.countDocuments(filter);

    res.status(200).json({
      kycs,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
