import jwt from 'jsonwebtoken';

class JwtUtils {
    generateToken(user) {
        const payload = {
            sub: user._id,
            email: user.email,
            role: user.role
        };

        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            throw new Error('Token inválido o expirado');
        }
    }
}

const jwtUtils = new JwtUtils();
export default jwtUtils;
