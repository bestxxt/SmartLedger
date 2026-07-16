import express from 'express';
import { prisma } from '../prisma';
import { authenticateJwt } from '../middleware/auth';

const router = express.Router();

router.use(authenticateJwt);

// Get all hotwords for the user
router.get('/', async (req: any, res) => {
  try {
    const hotwords = await prisma.hotword.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(hotwords);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch hotwords' });
  }
});

// Create a new hotword
router.post('/', async (req: any, res) => {
  try {
    const { word, context, replacement } = req.body;
    
    const hotword = await prisma.hotword.create({
      data: {
        userId: req.user.id,
        word,
        context,
        replacement
      }
    });
    
    res.status(201).json(hotword);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hotword' });
  }
});

// Update a hotword
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { word, context, replacement } = req.body;

    const existing = await prisma.hotword.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }

    const updated = await prisma.hotword.update({
      where: { id },
      data: {
        word,
        context,
        replacement
      }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// Delete a hotword
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const existing = await prisma.hotword.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user.id) {
      return res.status(404).json({ error: 'Not found' });
    }

    await prisma.hotword.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
