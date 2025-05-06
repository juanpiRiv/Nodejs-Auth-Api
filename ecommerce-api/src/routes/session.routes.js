import express from 'express';
import passport from 'passport';
import { login, register, current, logout } from '../controllers/session.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import UserDTO from '../dtos/user.dto.js';

const router = express.Router();

router.post('/login', login);

router.post('/register', register);

router.get('/current',
  passport.authenticate('jwt',{session:false}),
  (req,res) => {
    const dto = new UserDTO(req.user);
    res.json({status:'success', payload: dto});
  }
);

router.get('/logout', logout);

export default router;
