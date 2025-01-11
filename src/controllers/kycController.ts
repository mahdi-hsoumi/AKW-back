import { Request, Response } from 'express';
import KYC from '../models/kyc';

// Submit KYC data
export const submitKYC = async (req: Request, res: Response): Promise<void> => {
  const { name, idDocument } = req.body;
  const userId = req.userId;

  try {
    const kyc = new KYC({ userId, name, idDocument });
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
