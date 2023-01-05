import { purchaseForm } from '../pages/purchase-modal/purchase';
import App from './app/app';

type Routes = { [key: string]: string };

const routes: Routes = {
  '/': '/pages/main-page.html',
  '/item': '/pages/item.html',
  '/404': '/pages/error404.html',
  '/cart': '/pages/cart.html',
};

//const root = document.getElementById<HTMLDivElement>('#main__container');
const root = document.getElementById('root') as HTMLDivElement;
const app = new App();

async function handleLocation() {
  const path = window.location.pathname;
  const route = routes[path] || routes['/404'];
  const html = await fetch(route).then((data) => data.text());
  root.innerHTML = html;
  if (path === '/cart') app.start();
}

function router(event: { preventDefault: () => void; target: { href: string | URL | null | undefined } }) {
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
