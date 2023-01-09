import { Product } from '../../types/products';
import interpolate from '../../helpers/interpolate';
import { Router } from '../../helpers/router';
import Cart from '../../helpers/cart';

export default class ItemPage {
  item: Product | null = null;
  mainContainerEl: HTMLElement;
  cart: Cart;
  private router: Router;

  constructor(cart: Cart, router: Router) {
    this.cart = cart;
    this.router = router;
    this.mainContainerEl = document.querySelector('#root') as HTMLElement;
  }

  fetchProduct = async function (itemId: string): Promise<Product> {
    const response = await fetch(`https://dummyjson.com/products/${itemId}`);
    if (!response.ok) {
      throw new Error('Page not found');
    }
    const data = await response.json();
    return data;
  };

  async run(itemId: string | null) {
    console.log(itemId);
    if (!itemId) return;
    this.item = await this.fetchProduct(itemId);
    document.title = this.item.title;
    this.render();
    this.attachEvents();
  }

  attachEvents() {
    const images = document.querySelectorAll('.item__image') as NodeList;
    images.forEach((image) => {
      image.addEventListener('click', () => this.showImage(image as HTMLImageElement));
    });

    const addToCartEl = document.querySelector('.item__add-to-cart') as HTMLElement;
    addToCartEl.addEventListener('click', () => {
      if (this.item && this.cart.inCart(this.item)) {
        return this.router.redirectTo('/cart', 'Cart');
      }
      if (this.item) this.cart.add(this.item);
      addToCartEl.innerHTML = 'In cart  <span class="svg__add-to-cart"></span>';
    });

    const navBarLink = document.querySelector('.navbar__link') as HTMLLinkElement;
    navBarLink.addEventListener('click', (e) => this.router.handleLinkRoute(e));

    const btnQuickBuy = document.querySelector('.btn__quick-buy') as HTMLButtonElement;
    btnQuickBuy.addEventListener('click', () => { 
      if (this.item) this.cart.add(this.item);
      this.router.redirectTo('/cart#checkout', 'cart')
     
    });
  }

  render() {
    if (!this.item) return;
    const template = document.querySelector('#item-template') as HTMLTemplateElement;
    this.mainContainerEl.innerHTML = interpolate(template.innerHTML, { item: this.item });
    if (this.cart.inCart(this.item)) {
      const addToCartEl = document.querySelector('.item__add-to-cart') as HTMLElement;
      addToCartEl.innerHTML = 'In cart <span class="svg__add-to-cart"></span>';
    }
  }

  showImage(image: HTMLImageElement) {
    const mainImage = document.querySelector('.item__image-main') as HTMLImageElement;
    mainImage.style.backgroundImage = `${image.style.backgroundImage}`;
  }
}
