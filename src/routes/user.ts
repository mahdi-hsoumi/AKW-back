// AKW-back/src/routes/user.ts
import { Router } from 'express';
import { isAuthenticatedUser } from '../middlewares/auth';
import User from '../models/user';

const router = Router();

router.get('/me', isAuthenticatedUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('username role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
