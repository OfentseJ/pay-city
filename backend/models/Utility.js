import mongoose from 'mongoose';

const utilitySchema = new mongoose.Schema({
  meterNumber: {
    type: String,
    required: true,
    unique: true
  },
  idNumber: {
    type: String,
    required: true,
    match: /^[0-9]{13}$/
  },
  utilityType: {
    type: String,
    enum: ['electricity', 'water'],
    required: true
  },
  supplier: {
    type: String,
    required: true
  },
  tariffType: {
    type: String,
    enum: ['prepaid', 'postpaid'],
    required: true
  },
  address: {
    street: String,
    suburb: String,
    city: String,
    province: String,
    postalCode: String
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  lastTopUpDate: Date,
  lastTopUpAmount: Number,
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('Utility', utilitySchema);
