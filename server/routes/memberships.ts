import { Router, Request, Response } from 'express';
import { MembershipService } from '../services/membershipService';

const router = Router();
const membershipService = new MembershipService();

// Middleware to verify JWT token (simplified)
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // For now, just pass through - we'll implement proper JWT verification later
  (req as any).user = { id: 1 }; // Placeholder
  next();
};

// Add new membership
router.post('/add', authenticateToken, async (req, res) => {
  try {
    const { service, membershipType, price, status, startDate, endDate, notes } = req.body;
    const userId = (req as any).user.id;

    if (!service || !membershipType) {
      return res.status(400).json({ error: 'Service and membership type are required' });
    }

    const membership = await membershipService.addMembership({
      userId,
      service,
      membershipType,
      price,
      status,
      startDate: startDate ? parseInt(startDate) : undefined,
      endDate: endDate ? parseInt(endDate) : undefined,
      notes,
    });

    res.status(201).json({ 
      message: 'Membership added successfully',
      membership
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's memberships
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    
    const memberships = await membershipService.getUserMemberships(userId);
    res.json({ memberships });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update membership
router.put('/update/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { membershipType, price, status, startDate, endDate, notes } = req.body;
    const userId = (req as any).user.id;

    const membership = await membershipService.updateMembership(parseInt(id), userId, {
      membershipType,
      price,
      status,
      startDate: startDate ? parseInt(startDate) : undefined,
      endDate: endDate ? parseInt(endDate) : undefined,
      notes,
    });

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    res.json({ 
      message: 'Membership updated successfully',
      membership
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove membership
router.delete('/remove/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const success = await membershipService.removeMembership(parseInt(id), userId);

    if (!success) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    res.json({ message: 'Membership removed successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get membership by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const membership = await membershipService.getMembershipById(parseInt(id), userId);

    if (!membership) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    res.json({ membership });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router; 