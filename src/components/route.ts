import cart from '../pages/cart';
import error404 from '../pages/error404';
import index from '../pages/index';
import product from '../pages/product-detail';

type Routes = { [key: string]: string};

const routes: Routes = {
  '/': index,
  '/product-detail': product,
  '/cart': cart,
  '/404': error404,
};

const root = document.getElementById('root') as HTMLDivElement;

function handleLocation() {
  const path = window.location.pathname;
  const route = routes[path] || routes['/404'];
  root.innerHTML = route;
};

function router(event: { preventDefault: () => void; target: { href: string | URL | null | undefined; }; }) {
  event.preventDefault();
  history.pushState({}, 'newUrl', event.target.href);
  handleLocation();
  navColorLink();
}

window.addEventListener('popstate', function () {
  handleLocation();
});

window.addEventListener('DOMContentLoaded', function () {
  handleLocation();
  navColorLink();
});

const links = [...document.querySelectorAll<HTMLAnchorElement>('.nav-link')];

function navColorLink() {
  links.forEach((link) => {
    if (link.href === window.location.href) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}