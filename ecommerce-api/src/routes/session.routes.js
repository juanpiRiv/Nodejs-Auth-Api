import express from 'express';

const router = express.Router();

// Placeholder route for login
router.get('/login', (req, res) => {
  res.send('<h1>Login Route</h1>');
});

export default router;
