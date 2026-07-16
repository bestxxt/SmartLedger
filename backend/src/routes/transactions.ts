import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Protect all transaction routes
router.use(authenticateJwt);

// Get all transactions for current user
router.get('/', async (req: any, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            where: { userId: req.user.id },
            orderBy: { timestamp: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

// Create new transaction
router.post('/', async (req: any, res) => {
    try {
        const { amount, type, category, timestamp, note, currency, emoji, imageUrl, entityId, recurringId } = req.body;
        
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                amount: parseFloat(amount),
                type,
                category,
                timestamp: new Date(timestamp),
                note,
                currency,
                emoji,
                imageUrl,
                entityId,
                recurringId
            }
        });
        
        res.status(201).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create transaction' });
    }
});

// Update transaction
router.put('/:id', async (req: any, res) => {
    try {
        const { id } = req.params;
        const { amount, type, category, timestamp, note, currency, emoji, imageUrl, entityId, recurringId } = req.body;
        
        // Ensure user owns this transaction
        const existing = await prisma.transaction.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.status(404).json({ error: 'Transaction not found' });

        const transaction = await prisma.transaction.update({
            where: { id },
            data: {
                amount: amount ? parseFloat(amount) : undefined,
                type,
                category,
                timestamp: timestamp ? new Date(timestamp) : undefined,
                note,
                currency,
                emoji,
                imageUrl,
                entityId,
                recurringId
            }
        });
        
        res.json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update transaction' });
    }
});

// Delete transaction
router.delete('/:id', async (req: any, res) => {
    try {
        const { id } = req.params;
        
        // Ensure user owns this transaction
        const existing = await prisma.transaction.findFirst({
            where: { id, userId: req.user.id }
        });
        if (!existing) return res.status(404).json({ error: 'Transaction not found' });

        await prisma.transaction.delete({
            where: { id }
        });
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete transaction' });
    }
});

export default router;
