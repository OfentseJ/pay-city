import mongoose from 'mongoose';

const municipalAccountSchema = new mongoose.Schema({
  accountNumber: {
    type: String,
    required: true,
    unique: true
  },
  idNumber: {
    type: String,
    required: true,
    match: /^[0-9]{13}$/
  },
  municipality: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['residential', 'commercial', 'industrial'],
    required: true
  },
  propertyAddress: {
    street: String,
    suburb: String,
    city: String,
    province: String,
    postalCode: String
  },
  currentBalance: {
    type: Number,
    required: true,
    default: 0
  },
  lastReadingDate: Date,
  nextReadingDate: Date,
  services: [{
    type: {
      type: String,
      enum: ['electricity', 'water', 'refuse', 'sewerage', 'rates']
    },
    currentReading: Number,
    previousReading: Number,
    consumption: Number,
    amount: Number
  }],
  status: {
    type: String,
    enum: ['active', 'suspended', 'closed'],
    default: 'active'
  }
}, {
  timestamps: true
});

export default mongoose.model('MunicipalAccount', municipalAccountSchema);
