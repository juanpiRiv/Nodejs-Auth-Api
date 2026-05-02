import orderRepository from '../repositories/order.repository.js';

class OrderService {
    async createOrder(orderData) {
        return orderRepository.create(orderData);
    }

    async getOrderById(orderId) {
        return orderRepository.findById(orderId);
    }

    async getOrderByExternalReference(externalReference) {
        return orderRepository.findOne({ _id: externalReference });
    }

    async updateOrder(orderId, data) {
        return orderRepository.update(orderId, data);
    }

    async acquireOrderForProcessing(orderId, mpPaymentId) {
        return orderRepository.findOneAndUpdate(
            { _id: orderId, status: 'pending' },
            { status: 'processing', mpPaymentId: String(mpPaymentId) },
            { new: true }
        );
    }
}

export default new OrderService();
