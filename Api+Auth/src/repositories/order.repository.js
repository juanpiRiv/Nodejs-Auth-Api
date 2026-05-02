import orderModel from '../dao/models/Order.model.js';

class OrderRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        return this.model.create(data);
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async update(id, data) {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async findOne(filter) {
        return this.model.findOne(filter);
    }

    async findOneAndUpdate(filter, data, options = { new: true }) {
        return this.model.findOneAndUpdate(filter, data, options);
    }
}

export default new OrderRepository(orderModel);
