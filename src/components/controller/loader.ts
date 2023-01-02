import { Products } from '../types';

class Loader {
  async load(callback: (data: Products[]) => void) {
    try {
      const resp = await fetch('https://dummyjson.com/products?limit=20');
      const data = await resp.json();
      const products = data.products as Products[];
      callback(products.slice(0, 5));
    } catch (error) {
      console.log(error);
    }
  }

  getResp(callback: (data: Products[]) => void) {
    this.load((data) => callback(data));
  }
}

export default Loader;
