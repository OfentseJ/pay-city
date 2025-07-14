import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import userRoutes from './routes/users.js';
// import fineRoutes from './routes/fines.js';
// import municipalRoutes from './routes/municipal.js';
// import utilityRoutes from './routes/utilities.js';
// import paymentRoutes from './routes/payments.js';

dotenv.config();

const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.use('/users', userRoutes);
// app.use('/api/fines', fineRoutes);
// app.use('/api/municipal', municipalRoutes);
// app.use('/api/utilities', utilityRoutes);
// app.use('/api/payments', paymentRoutes);

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'PayCity API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;