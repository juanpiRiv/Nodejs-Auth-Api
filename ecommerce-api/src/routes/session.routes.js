import express from 'express';
import passport from 'passport';
import { login, register, current, logout } from '../controllers/session.controller.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import UserDTO from '../dtos/user.dto.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { userRegisterSchema } from '../validations/user.validation.js';

const router = express.Router();

router.post('/login', login); // Consider adding validation for login if needed

router.post('/register', validateBody(userRegisterSchema), register);

router.get('/current',
  passport.authenticate('jwt',{session:false}),
  (req,res) => {
    const dto = new UserDTO(req.user);
    res.json({status:'success', payload: dto});
  }
);

router.get('/logout', logout);

export default router;
