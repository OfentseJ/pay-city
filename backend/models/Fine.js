import mongoose from 'mongoose';

const fineSchema = new mongoose.Schema({
  fineNumber: {
    type: String,
    required: true,
    unique: true
  },
  idNumber: {
    type: String,
    required: true,
    match: /^[0-9]{13}$/
  },
  vehicleRegistration: {
    type: String,
    required: true,
    uppercase: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  dateIssued: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'disputed', 'overdue'],
    default: 'unpaid'
  },
  officerName: String,
  courtCode: String,
  paymentDate: Date,
  paymentReference: String
}, {
  timestamps: true
});

// Calculate if fine is overdue
fineSchema.virtual('isOverdue').get(function() {
  return this.status === 'unpaid' && new Date() > this.dueDate;
});

export default mongoose.model('Fine', fineSchema);