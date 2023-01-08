import { Product } from '../../types/products';
import interpolate from '../../helpers/interpolate';
import { handleLinkRoute, redirectTo } from '../../helpers/route';

export default class ItemPage {
  item: Product | null;
  mainContainerEl: HTMLElement;

  constructor() {
    this.item = null;
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

  async run(itemId: string) {
    this.item = await this.fetchProduct(itemId);
    document.title = this.item.title;
    this.renderItem();
    this.attachEvent();
  }

  attachEvent() {
    const images = document.querySelectorAll('.item__image') as NodeList;
    images.forEach((image) => {
      image.addEventListener('click', () => this.showImage(image as HTMLImageElement))
    });
    const addToCartEl = document.querySelector('.item__add-to-cart') as HTMLElement
    addToCartEl.addEventListener('click', () => {
      addToCartEl.innerHTML = 'In cart  <span class="svg__add-to-cart"></span>'
    });

    const navBarLink = document.querySelector('.navbar__link') as HTMLLinkElement
    navBarLink.addEventListener('click', handleLinkRoute)

    const btnQuickBuy = document.querySelector('.btn__quick-buy')  as HTMLButtonElement
    btnQuickBuy.addEventListener('click', () => redirectTo('http://localhost:8080/', 'cart'))
  }

  renderItem() {
    const template = document.querySelector('#item-template') as HTMLTemplateElement;
    console.log(this.mainContainerEl, template, this.item);
    this.mainContainerEl.innerHTML = interpolate(template.innerHTML, { item: this.item });
  }

  showImage(image: HTMLImageElement) {
    const mainImage = document.querySelector('.item__image-main') as HTMLImageElement;
    mainImage.style.backgroundImage = `${image.style.backgroundImage}`;
  }
}
