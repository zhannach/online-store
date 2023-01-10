import { arrayRemove } from '../../helpers/utils';
import { PromoNodes, PromoCodes } from '../../types/cart';
import cartTemplate from './template';
import { purchaseForm as purchase } from '../purchase-modal/purchase';
import Cart, { CartItem } from '../../helpers/cart';
import { Router } from '../../helpers/router';

class CartPage {
  private _quantityCart = 0;
  private _queryFlag = true;

  private _cartItems: HTMLElement[] = [];
  private _subtotal!: HTMLDivElement;
  private _total!: HTMLDivElement;
  private _container!: HTMLOListElement;
  private _headerTotal!: HTMLSpanElement;
  private _headerCart!: HTMLSpanElement;
  private mainEl: HTMLElement;
  private cart: Cart;
  private router: Router;

  constructor(cart: Cart, router: Router) {
    this.cart = cart;
    this.router = router;
    this._total = document.querySelector('.totals__value') as HTMLDivElement;
    this._subtotal = document.querySelector('.subtotals__value') as HTMLDivElement;
    this._container = document.querySelector('.cart-item__list') as HTMLOListElement;
    this._headerTotal = document.querySelector('.cart__sum') as HTMLSpanElement;
    this._headerCart = document.querySelector('.cart__num') as HTMLSpanElement;
    this.mainEl = document.querySelector('.main__content') as HTMLElement;
  }

  async run() {
    if (!this.cart.getCount()) {
      this.mainEl.innerHTML = `<h2 class="category__title">Cart is Empty</h2>`;
      return;
    }
    this.render();
    if (window.location.hash === '#checkout') {
      purchase();
    }
  }

  render() {
    const fragment = document.createDocumentFragment();
    const cartItemTemp = document.createElement('template');
    cartItemTemp.innerHTML = cartTemplate;
    this.cart.getItems().forEach((item: CartItem, idx) => {
      item.quantity = item.quantity ? item.quantity : 1;
      const cartClone = cartItemTemp.content.cloneNode(true) as HTMLElement;
      const amount = cartClone.querySelector('.cart-item__amount') as HTMLSpanElement;
      const btnPlus = cartClone.querySelector('.btn-plus') as HTMLDivElement;
      const btnMinus = cartClone.querySelector('.btn-minus') as HTMLDivElement;
      const stock = cartClone.querySelector('.amount__name') as HTMLSpanElement;
      const total = cartClone.querySelector('.cart-item__total') as HTMLDivElement;

      (
        cartClone.querySelector('.cart-item__image') as HTMLDivElement
      ).style.backgroundImage = `url(${item.product.thumbnail})`;
      (cartClone.querySelector('.cart-item__id') as HTMLTitleElement).textContent = `${idx + 1}`;
      (cartClone.querySelector('.cart-item__title') as HTMLTitleElement).textContent = item.product.title;
      (cartClone.querySelector('.brand__name') as HTMLTitleElement).textContent = item.product.brand;
      (cartClone.querySelector('.cart-category__name') as HTMLSpanElement).textContent = item.product.category;
      (cartClone.querySelector('.cart-item__price') as HTMLDivElement).textContent = `$${item.product.price.toFixed(
        2
      )}`;

      amount.textContent = `${item.quantity}`;
      stock.textContent = `${item.product.stock}`;
      total.textContent = `$${(item.product.price * item.quantity).toFixed(2)}`;
      this.updateItem(amount, stock, btnPlus, total, idx);
      this.updateItem(amount, stock, btnMinus, total, idx);

      fragment.append(cartClone);
    });

    this._container.innerHTML = '';
    this._container.appendChild(fragment);
    this._quantityCart = this.cart.getCount();
    this._headerCart.textContent = `${this._quantityCart}`;
    const linkBackToHome = document.querySelector('.navbar__link');
    linkBackToHome?.addEventListener('click', (e) => this.router.handleLinkRoute(e));

    this.renderTotals();
    this.applyPromo();
    this.pagination();
    this.purchaseModal();
  }

  renderTotals() {
    if (this._total && this._subtotal) {
      const sum = this.cart.getSubTotal();
      this._subtotal.textContent = `$${sum.toFixed(2)}`;
      const totalSum = `$${this.cart.getTotal().toFixed(2)}`;
      this._total.textContent = totalSum;
      this._headerTotal.textContent = totalSum;
    }
  }

  updateItem(amount: HTMLSpanElement, stock: HTMLSpanElement, btn: HTMLDivElement, total: HTMLDivElement, idx: number) {
    const removeCartContainer = () => {
      this.mainEl.innerHTML = `<h2 class="category__title">Cart is Empty</h2>`;
    };

    const removeItem = (index: number): void => {
      const cartItem = this.cart.getItems()[index];
      const cartNode = this._cartItems[index];
      cartNode.remove();
      this._cartItems = arrayRemove(this._cartItems, cartNode);
      this.cart.remove(cartItem.product);
      this.render();
      const isDataNull = this.cart.getItems().length;
      if (!isDataNull) removeCartContainer();
    };

    const updateData = () => {
      if (!btn && !amount && !this.cart.getItems()[idx].quantity) return;
      const item = this.cart.getItems()[idx];
      let quantity = item.quantity;
      if (item.product.stock && btn.classList.contains('btn-plus')) {
        quantity += 1;
        this._quantityCart += 1;
        this._headerCart.textContent = `${this._quantityCart}`;
        item.product.stock -= 1;
        amount.textContent = `${quantity}`;
        stock.textContent = `${item.product.stock}`;
        total.textContent = `$${(item.product.price * quantity).toFixed(2)}`;
      }
      if (quantity && btn.classList.contains('btn-minus')) {
        quantity -= 1;
        this._quantityCart -= 1;
        this._headerCart.textContent = `${this._quantityCart}`;
        item.product.stock += 1;
        if (quantity === 0) removeItem(idx);
        amount.textContent = `${quantity}`;
        stock.textContent = `${item.product.stock}`;
        total.textContent = `$${(item.product.price * quantity).toFixed(2)}`;
      }
      this.cart.update(item.product, quantity);
      this.renderTotals();
    };
    btn.addEventListener('click', updateData);
  }

  applyPromo() {
    //const promoTitleTemplate = `<h3 class="promo__title-code">Applied codes</h3>`;
    let lastPromo: keyof PromoNodes;
    const inputPromo = document.querySelector('.price__promo') as HTMLInputElement;
    const totalPromo = document.querySelector('.cart-total__promo') as HTMLDivElement;
    const priceSubTotals = document.querySelector('.price__subtotals') as HTMLDivElement;
    const promoAddList: PromoNodes[] = [];
    let promoDropList: PromoNodes[] = [];
    const promoData: PromoCodes = {
      rss: { desc: 'Rolling Scopes School - 10%', discount: 10 },
      epm: { desc: 'EPAM Systems - 10%', discount: 10 },
    };
    const setPromo = (value: keyof PromoNodes, type: string) => {
      if (type === 'Add') {
        const nodeAdd = promoAddList.pop();
        if (nodeAdd) nodeAdd[value].remove();
        const nodeDrop = showPromo(value, 'Drop');
        promoDropList.push({ [value]: nodeDrop });
        this.cart.addPromo(value as string);
        priceSubTotals.classList.add('line-through');
        this.renderTotals();
      }
      if (type === 'Drop') {
        const nodeDrop = promoDropList.find((x) => x[value] instanceof HTMLElement);
        if (nodeDrop) {
          nodeDrop[value].remove();
          promoDropList = arrayRemove(promoDropList, nodeDrop);
          this.cart.removePromo(value as string);
        }
        this.renderTotals();
        handlePromo.apply(inputPromo);
        if (this.cart.getDiscount() === 0) {
          priceSubTotals.classList.remove('line-through');
        }
      }
    };

    const cartPromo = this.cart.getPromoCodes();

    if (cartPromo.length) {
      cartPromo.forEach((code) => {
        setPromo(code, 'Add');
      });
    }

    function showPromo(value: keyof PromoNodes, type: string): HTMLElement {
      const node = document.createElement('div');
      const button = document.createElement('span');

      node.classList.add('promo__add-code');
      node.textContent = `${promoData[value].desc} `;
      button.textContent = `${type}`;

      node.append(button);
      if (type == 'Add') {
        totalPromo.after(node);
        button.addEventListener('click', () => setPromo(value, type));
      }
      if (type === 'Drop') {
        inputPromo.before(node);
        button.addEventListener('click', () => setPromo(value, type));
      }
      return node;
    }

    function handlePromo(this: HTMLInputElement) {
      const value = this.value.trim().toLowerCase();
      if (
        promoData[value] &&
        !promoAddList.find((x) => x[value] instanceof HTMLElement) &&
        !promoDropList.find((x) => x[value] instanceof HTMLElement)
      ) {
        const node = showPromo(value, 'Add');
        promoAddList.push({ [value]: node });
        lastPromo = value;
      } else if (promoAddList.length && !promoAddList.find((x) => x[value] instanceof HTMLElement)) {
        const node = promoAddList.pop();
        if (node) node[lastPromo].remove();
      }
    }
    inputPromo.addEventListener('input', handlePromo);
  }

  pagination() {
    this._cartItems = [...document.querySelectorAll<HTMLElement>('.cart-item')];
    const paginationNumbers = document.querySelector('.pagination__limit-index') as HTMLInputElement;
    const pageNumber = document.querySelector('.link-page') as HTMLDivElement;
    const prevBtn = document.querySelector('.link-prev') as HTMLDivElement;
    const nextBtn = document.querySelector('.link-next') as HTMLDivElement;

    let url = window.location.pathname;
    const params = new URLSearchParams(window.location.search);

    let paginationLimit = Number(params.get('limit'));
    if (!paginationLimit) paginationLimit = 5;
    paginationNumbers.value = `${paginationLimit}`;

    let currentPage = Number(params.get('page'));
    if (!currentPage || currentPage > Math.ceil(this._cartItems.length / paginationLimit)) {
      currentPage = 1;
    }
    let pageCount = 0;

    const setCurrentPage = (pageNum: number): void => {
      if (pageNum <= 0) return;
      if (pageNum > pageCount) return;
      currentPage = pageNum;
      pageNumber.textContent = `${currentPage}`;
      url = `?page=${currentPage}&limit=${paginationLimit}`;
      //history.pushState({}, '', url);
      const prevRange = (pageNum - 1) * paginationLimit;
      const currRange = pageNum * paginationLimit;
      this._cartItems.forEach((item, index) => {
        item.classList.add('hidden');
        if (index >= prevRange && index < currRange) {
          item.classList.remove('hidden');
        }
      });
    };
    const handleItemsLimit = () => {
      const value = Number(paginationNumbers.value.trim());
      if (value && value < 10) {
        paginationLimit = value;
      } else {
        paginationLimit = 5;
        paginationNumbers.value = `${paginationLimit}`;
      }
      url = `?page=${currentPage}&limit=${paginationLimit}`;
      history.pushState({}, '', url);
      pageCount = Math.ceil(this._cartItems.length / paginationLimit);
      setCurrentPage(currentPage);
    };
    prevBtn.addEventListener('click', () => setCurrentPage(currentPage - 1));
    nextBtn.addEventListener('click', () => setCurrentPage(currentPage + 1));
    paginationNumbers.addEventListener('change', handleItemsLimit);
    if (window.location.search) {
      handleItemsLimit();
    }
  }

  purchaseModal() {
    const buyBtn = document.querySelector('.btn__quick-buy') as HTMLButtonElement;
    buyBtn.addEventListener('click', purchase);
  }
}

export default CartPage;
