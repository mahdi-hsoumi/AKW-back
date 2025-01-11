import mongoose, { Document, Schema } from 'mongoose';

export interface IKYC extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  idDocument: string; // Path to the uploaded ID document
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const KYCSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    idDocument: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true },
);

export default mongoose.model<IKYC>('KYC', KYCSchema);
