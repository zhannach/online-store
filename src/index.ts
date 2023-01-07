import './components/route';
import './pages/purchase-modal/purchase';
import './global.scss';
import './assets/styles/item.scss';
import './assets/styles/cart.scss';
import './assets/styles/main-page.scss';
import './assets/styles/purchase-modal.css';
import './assets/styles/products.scss';
import './assets/styles/page-404.scss';
import './assets/styles/cart.scss';
import './pages/products/products';
import './pages/item/item';
import { handleLinkRoute } from './helpers/route';
import '@splidejs/splide/css';

const titleStore = document.querySelector('.header__name') 
titleStore?.addEventListener('click', handleLinkRoute)