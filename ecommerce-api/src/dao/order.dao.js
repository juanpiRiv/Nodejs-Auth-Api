import Order from '../models/Order.model.js';

class OrderDAO {
    async createOrder(orderData) {
        return await Order.create(orderData);
    }
}

export default new OrderDAO();
