class ProductRepository {
  constructor(productModel) {
    this.model = productModel;
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
module.exports = new ProductRepository(require('../dao/models/Product.model'));
