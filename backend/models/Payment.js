import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  paymentType: {
    type: String,
    enum: ['fine', 'municipal', 'utility'],
    required: true
  },
  referenceNumber: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'eft', 'instant_eft', 'mobile_money'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  gateway: {
    type: String,
    enum: ['payfast', 'paygate', 'ozow'],
    required: true
  },
  gatewayReference: String,
  description: String,
  completedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

export default mongoose.model('Payment', paymentSchema);