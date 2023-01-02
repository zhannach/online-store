import Cart from '../../pages/shopping-cart/cart';
import { Products } from '../types';

class AppView {
  private _cart: Cart;
  constructor() {
    this._cart = new Cart();
  }

  drawCart(data: Products[]): void {
    this._cart.draw(data);
  }
}

export default AppView;
