import userModel from '../models/user.model.js';

class UserManager {
    async getUserByEmail(email) {
        try {
            const user = await userModel.findOne({ email });
            return user;
        } catch (error) {
            console.error('Error al obtener el usuario por email:', error);
            throw error;
        }
    }

    async getUserById(id) {
        try {
            const user = await userModel.findById(id);
            return user;
        } catch (error) {
            console.error('Error al obtener el usuario por ID:', error);
            throw error;
        }
    }

    async createUser(userData) {
        try {
            const newUser = await userModel.create(userData);
            return newUser;
        } catch (error) {
            console.error('Error al crear el usuario:', error);
            throw error;
        }
    }
}

const userManager = new UserManager();
export default userManager;
