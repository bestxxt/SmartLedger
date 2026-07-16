import express from 'express';
import { prisma } from '../prisma';
import { authenticateJwt } from '../middleware/auth';

const router = express.Router();

router.use(authenticateJwt);

// Get all recurring transactions for the user
router.get('/', async (req: any, res) => {
  try {
    const recurring = await prisma.recurringTransaction.findMany({
      where: { userId: req.user.id },
      orderBy: { nextDate: 'asc' }
    });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recurring transactions' });
  }
});

// Create a new recurring transaction
router.post('/', async (req: any, res) => {
  try {
    const { amount, type, category, frequency, nextDate, note } = req.body;
    
    const recurring = await prisma.recurringTransaction.create({
      data: {
        userId: req.user.id,
        amount: parseFloat(amount),
        type,
        category,
        frequency,
        nextDate: new Date(nextDate),
        note
      }
    });
    
    res.status(201).json(recurring);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create recurring transaction' });
  }
});

// Update a recurring transaction
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category, frequency, nextDate, note, active } = req.body;

    const existing = await prisma.recurringTransaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await prisma.recurringTransaction.update({
      where: { id },
      data: {
        amount: amount !== undefined ? parseFloat(amount) : undefined,
        type,
        category,
        frequency,
        nextDate: nextDate ? new Date(nextDate) : undefined,
        note,
        active
      }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete a recurring transaction
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.recurringTransaction.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }

    await prisma.recurringTransaction.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
