import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import userService from '../services/user.service.js';
import bcrypt from 'bcrypt';

// Configuración para extraer el token JWT de las cookies
const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
        token = req.cookies['authToken'];
    }
    return token;
};

const initializePassport = () => {
    passport.use('login', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            console.log('Login attempt:', { email, password }); // Para depuración
            if (!email || !password) {
                return done(null, false, { message: 'Email y contraseña son obligatorios' });
            }
            try {
                const result = await userService.loginUser(email, password);

                if (!result) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }

                return done(null, result.user);
            } catch (error) {
                return done(error);
            }
        }
    ));



    // Estrategia local para register
    passport.use('register', new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const newUserData = {
                    ...req.body
                };

                const { user } = await userService.registerUser(newUserData); //  hace el service
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));


    // Estrategia current para extraer usuario del token
    passport.use('jwt', new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: process.env.JWT_SECRET
        },
        async (jwt_payload, done) => {
            try {
                const user = await userService.getCurrentUser(jwt_payload.sub);
                if (!user) {
                    return done(null, false, { message: 'Usuario no encontrado' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    ));
};

export default initializePassport;
