import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Protect all user routes
router.use(authenticateJwt);

// Get current user info & stats
router.get('/me', async (req: any, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                language: true,
                currency: true,
                locations: true,
                tags: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Dynamically calculate stats from transactions
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            select: { amount: true, type: true }
        });

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        const balance = totalIncome - totalExpense;

        res.json({
            ...user,
            stats: {
                totalIncome,
                totalExpense,
                balance,
                totalTransactions: transactions.length
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// Update tags and locations
router.put('/me/tags', async (req: any, res) => {
    try {
        const { tags, locations } = req.body;
        
        const updatedUser = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                tags: tags ? JSON.stringify(tags) : undefined,
                locations: locations ? JSON.stringify(locations) : undefined
            },
            select: { tags: true, locations: true }
        });
        
        res.json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update tags/locations' });
    }
});

export default router;
