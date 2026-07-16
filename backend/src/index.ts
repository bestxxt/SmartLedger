import express from 'express';
import cors from 'cors';
import passport from 'passport';
import morgan from 'morgan';
import 'dotenv/config';

import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import userRoutes from './routes/users';
import entityRoutes from './routes/entities';
import recurringRoutes from './routes/recurring';
import hotwordRoutes from './routes/hotwords';
import categoryRoutes from './routes/categories';

// Make sure passport strategy is configured
import './middleware/auth';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(morgan('dev')); // Add morgan for request logging
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/hotwords', hotwordRoutes);
app.use('/api/categories', categoryRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
