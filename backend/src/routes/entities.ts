import express from 'express';
import { prisma } from '../prisma';
import { authenticateJwt } from '../middleware/auth';

const router = express.Router();

router.use(authenticateJwt);

// Get all entities for the user
router.get('/', async (req: any, res) => {
  try {
    const entities = await prisma.trackingEntity.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { transactions: true } } }
    });
    res.json(entities);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entities' });
  }
});

// Create a new entity
router.post('/', async (req: any, res) => {
  try {
    const { name, type, purchasePrice, residualValue, purchaseDate, status } = req.body;
    
    const entity = await prisma.trackingEntity.create({
      data: {
        userId: req.user.id,
        name,
        type,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        residualValue: residualValue ? parseFloat(residualValue) : null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        status: status || 'active'
      }
    });
    
    res.status(201).json(entity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create entity' });
  }
});

// Update an entity
router.put('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { name, type, purchasePrice, residualValue, purchaseDate, status } = req.body;

    const existingEntity = await prisma.trackingEntity.findUnique({ where: { id } });
    if (!existingEntity || existingEntity.userId !== req.user.id) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    const updatedEntity = await prisma.trackingEntity.update({
      where: { id },
      data: {
        name,
        type,
        purchasePrice: purchasePrice !== undefined ? (purchasePrice ? parseFloat(purchasePrice) : null) : undefined,
        residualValue: residualValue !== undefined ? (residualValue ? parseFloat(residualValue) : null) : undefined,
        purchaseDate: purchaseDate !== undefined ? (purchaseDate ? new Date(purchaseDate) : null) : undefined,
        status
      }
    });
    
    res.json(updatedEntity);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entity' });
  }
});

// Delete an entity
router.delete('/:id', async (req: any, res) => {
  try {
    const { id } = req.params;
    
    const existingEntity = await prisma.trackingEntity.findUnique({ where: { id } });
    if (!existingEntity || existingEntity.userId !== req.user.id) {
      return res.status(404).json({ error: 'Entity not found' });
    }

    await prisma.trackingEntity.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entity' });
  }
});

export default router;
