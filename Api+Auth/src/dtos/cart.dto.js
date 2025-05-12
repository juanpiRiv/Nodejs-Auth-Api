import ProductDTO from './product.dto.js';

class CartDTO {
  constructor(cart) {
    this.id = cart.id;
    this.products = cart.products.map(product => ({
      product: new ProductDTO(product.product),
      quantity: product.quantity
    }));
  }
}

export default CartDTO;
