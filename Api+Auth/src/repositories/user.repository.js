import User from '../dao/models/user.model.js';
class UserRepository {
  constructor(userModel) {
    this.model = userModel;
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
  async findByCartId(cartId) {
    return this.model.findOne({ cart: cartId });
  }
}

export default new UserRepository(User);
