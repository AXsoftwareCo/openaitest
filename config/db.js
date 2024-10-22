import mongoose from 'mongoose';
import winston from 'winston';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    winston.info('Conectado a MongoDB');
  } catch (error) {
    winston.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;