import Cart from '../dao/models/Cart.model.js';
class CartRepository {
  constructor(cartModel) {
    this.model = cartModel;
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
  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }
}

export default new CartRepository(Cart);
