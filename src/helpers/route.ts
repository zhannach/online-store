import ProductsPage from "../pages/products/products";
import ItemPage from "../pages/item/item";

type Routes = { [pattern: string]: string };

const routes: Routes = {
  '/': '/pages/products.html',
  '/item': '/pages/item.html',
  '/404': '/pages/error404.html',
  '/cart': '/pages/cart.html',
  '/purchase': '/pages/purchase.html',
};

const root = document.getElementById('root') as HTMLDivElement;

export default async function handleLocation() {
  const path = window.location.pathname;
  const itemPageMatched = path.match(/^\/item\/([0-9]+)$/i)
  const route = routes[itemPageMatched ? '/item' : path] || routes['/404'];
  const html = await fetch(route).then((data) => data.text());
  root.innerHTML = html;
  if (itemPageMatched) {
    return new ItemPage().run(itemPageMatched[1])
  }
  if (path === '/') {
    return new ProductsPage().run()
  }
}

export function handleLinkRoute(event: Event) {
  event.preventDefault();
  if (event.target && event.target instanceof HTMLAnchorElement) {
    history.pushState({}, event.target.title || 'newUrl', event.target.href);
    handleLocation();
    navColorLink();
  }
}

export function redirectTo(link: string, title: string = '') {
  history.pushState({}, title, link);
  handleLocation();
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