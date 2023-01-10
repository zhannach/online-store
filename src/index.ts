import './pages/purchase-modal/purchase';
import './global.scss';
import './assets/styles/item.scss';
import './assets/styles/cart.scss';
import './assets/styles/purchase-modal.css';
import './assets/styles/products.scss';
import './assets/styles/page-404.scss';
import './assets/styles/cart.scss';
import './pages/products/products';
import './pages/item/item';
import { Router, Route } from './helpers/router';
import ProductsPage from './pages/products/products';
import Cart from './helpers/cart';
import ItemPage from './pages/item/item';
import CartPage from './pages/shopping-cart/cart';

(function app() {
  const root = document.getElementById('root') as HTMLDivElement;
  const cartNumEl = document.querySelector('.cart__num') as HTMLElement;
  const cartSumEl = document.querySelector('.cart__sum') as HTMLElement;

  const cart = new Cart({
    storage: localStorage,
    onUpdate: (cart) => {
      cartNumEl.innerText = cart.getCount().toString();
      cartSumEl.innerText = `$${cart.getTotal().toFixed(2)}`;
    },
  });

  const routes: Route[] = [
    {
      path: '/',
      src: '/pages/products.html',
      action: async (router) => {
        await new ProductsPage(cart, router).run();
      },
    },
    {
      path: /^\/item\/([0-9]+)$/i,
      src: '/pages/item.html',
      action: async (router, matched) => {
        const itemId = typeof matched === 'object' && matched?.length ? matched[1] : null;
        await new ItemPage(cart, router).run(itemId);
      },
    },
    {
      path: '/cart',
      src: '/pages/cart.html',
      action: async (router) => {
        await new CartPage(cart, router).run();
      },
    },
  ];

  const router = new Router(routes, root, '/pages/error404.html');

  cartNumEl.innerText = cart.getCount().toString();
  cartSumEl.innerText = `$${cart.getTotal().toFixed(2)}`;

  const titleStore = document.querySelector('.header__name');
  titleStore?.addEventListener('click', (e) => router.handleLinkRoute(e));
  const cartLink = document.querySelector('.header__cart');
  cartLink?.addEventListener('click', (e) => router.handleLinkRoute(e));
})();
