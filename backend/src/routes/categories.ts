import { Router } from 'express';
import { authenticateJwt } from '../middleware/auth';
import { prisma } from '../prisma';

const router = Router();

const PRESET_CATEGORIES = [
  { name: 'Dining', icon: null, imageUrl: '/icons/icon_11.png', type: 'expense' },
  { name: 'Groceries', icon: null, imageUrl: '/icons/icon_16.png', type: 'expense' },
  { name: 'Transport', icon: null, imageUrl: '/icons/icon_24.png', type: 'expense' },
  { name: 'Housing', icon: null, imageUrl: '/icons/icon_14.png', type: 'expense' },
  { name: 'Utilities', icon: null, imageUrl: '/icons/icon_07.png', type: 'expense' },
  { name: 'Shopping', icon: null, imageUrl: '/icons/icon_18.png', type: 'expense' },
  { name: 'Entertainment', icon: null, imageUrl: '/icons/icon_17.png', type: 'expense' },
  { name: 'Salary / Income', icon: null, imageUrl: '/icons/icon_03.png', type: 'income' },
];

// Get all categories for user (creates defaults if none exist)
router.get('/', authenticateJwt, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    let categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    if (categories.length === 0) {
      // Seed default categories
      await prisma.category.createMany({
        data: PRESET_CATEGORIES.map(c => ({
          ...c,
          userId
        }))
      });
      categories = await prisma.category.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' }
      });
    }

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create new category
router.post('/', authenticateJwt, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, icon, imageUrl, type } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const category = await prisma.category.create({
      data: {
        userId,
        name,
        icon: icon || null,
        imageUrl: imageUrl || null,
        type
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// Update category
router.put('/:id', authenticateJwt, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { name, icon, imageUrl, type } = req.body;

    const category = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: name !== undefined ? name : category.name,
        icon: icon !== undefined ? icon : category.icon,
        imageUrl: imageUrl !== undefined ? imageUrl : category.imageUrl,
        type: type !== undefined ? type : category.type,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category
router.delete('/:id', authenticateJwt, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await prisma.category.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
