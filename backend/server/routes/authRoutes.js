import express from 'express';
import passport from 'passport';
import { register, login, googleAuth, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

router.get('/google', 
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`
  }),
  googleAuth,
  (req, res) => {
    const token = req.user.token;
    res.redirect(`${process.env.CLIENT_URL}/auth/google/success?token=${token}`);
  }
);

export default router;
