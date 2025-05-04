import orderDAO from '../dao/order.dao.js';

class OrderService {
    async createOrder(orderData) {
        return await orderDAO.createOrder(orderData);
    }
}

export default new OrderService();
