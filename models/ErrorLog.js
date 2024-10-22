import mongoose from 'mongoose';

const ErrorLogSchema = new mongoose.Schema({
  runId: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ErrorLog = mongoose.model('ErrorLog', ErrorLogSchema);

export default ErrorLog;