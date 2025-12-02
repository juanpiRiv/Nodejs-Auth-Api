import express from 'express';
import passport from 'passport'; 
import UserDTO from '../dtos/user.dto.js';

const router = express.Router();

const authenticateJWT = passport.authenticate('jwt', { session: false });


export default router;
