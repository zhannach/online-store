import { Products } from '../../types/cart';
import { arrayRemove } from '../../helpers/utils';
import { PromoNodes, PromoCodes } from '../../types/cart';
import cartTemplate from './template';
import { purchaseForm as purchase } from '../purchase-modal/purchase';

class Cart {
  private _data: Products[] = [];
  private _discount = 0;
  private _quantityCart = 0;
  private _queryFlag = true;
  private _promo: string[] = [];

  private _cartItems: HTMLElement[] = [];
  private _subtotal!: HTMLDivElement;
  private _total!: HTMLDivElement;
  private _container!: HTMLOListElement;
  private _headerTotal!: HTMLSpanElement;
  private _headerCart!: HTMLSpanElement;

  query(): boolean {
    this._total = document.querySelector('.totals__value') as HTMLDivElement;
    this._subtotal = document.querySelector('.subtotals__value') as HTMLDivElement;
    this._container = document.querySelector('.cart-item__list') as HTMLOListElement;
    this._headerTotal = document.querySelector('.cart__sum') as HTMLSpanElement;
    this._headerCart = document.querySelector('.cart__num') as HTMLSpanElement;
    return false;
  }

  draw(products: Products[]) {
    if (this._queryFlag) {
      this._queryFlag = this.query();
      this.getLocalStorage(products);
    }
    const fragment = document.createDocumentFragment();
    const cartItemTemp = document.createElement('template');
    cartItemTemp.innerHTML = cartTemplate;

    this._data.forEach((item, idx) => {
      item.quantity = item.quantity ? item.quantity : 1;
      const cartClone = cartItemTemp.content.cloneNode(true) as HTMLElement;
      const amount = cartClone.querySelector('.cart-item__amount') as HTMLSpanElement;
      const btnPlus = cartClone.querySelector('.btn-plus') as HTMLDivElement;
      const btnMinus = cartClone.querySelector('.btn-minus') as HTMLDivElement;
      const stock = cartClone.querySelector('.amount__name') as HTMLSpanElement;
      const total = cartClone.querySelector('.cart-item__total') as HTMLDivElement;

      (cartClone.querySelector('.cart-item__image') as HTMLDivElement).style.backgroundImage = `url(${item.thumbnail})`;
      (cartClone.querySelector('.cart-item__id') as HTMLTitleElement).textContent = `${idx + 1}`;
      (cartClone.querySelector('.cart-item__title') as HTMLTitleElement).textContent = item.title;
      (cartClone.querySelector('.brand__name') as HTMLTitleElement).textContent = item.brand;
      (cartClone.querySelector('.cart-category__name') as HTMLSpanElement).textContent = item.category;
      (cartClone.querySelector('.cart-item__price') as HTMLDivElement).textContent = `${item.price}`;

      amount.textContent = `${item.quantity}`;
      stock.textContent = `${item.stock}`;
      total.textContent = `${item.price * item.quantity}`;
      this.updateItem(amount, stock, btnPlus, total, idx);
      this.updateItem(amount, stock, btnMinus, total, idx);

      fragment.append(cartClone);
    });

    this._container.innerHTML = '';
    this._container.appendChild(fragment);
    this._quantityCart = this._data.reduce((accum, curr) => accum + curr.quantity, 0);
    this._headerCart.textContent = `${this._quantityCart}`;

    this.drawTotals();
    this.applyPromo();
    this.pagination();
    this.purchaseModal();
    this.setLocalStorage().data;
  }

  drawTotals() {
    if (this._total && this._subtotal) {
      let sum = this._data.reduce((accum, cur) => cur.price * cur.quantity + accum, 0);
      this._subtotal.textContent = `$${sum}`;
      if (this._discount) sum *= (100 - this._discount) / 100;
      const totalSum = `$${sum.toFixed(0)}`;
      this._total.textContent = totalSum;
      this._headerTotal.textContent = totalSum;
    }
  }

  updateItem(amount: HTMLSpanElement, stock: HTMLSpanElement, btn: HTMLDivElement, total: HTMLDivElement, idx: number) {
    const removeCartContainer = () => {
      const root = document.getElementById('root') as HTMLDivElement;
      root.style.textAlign = 'center';
      root.style.fontSize = '2rem';
      root.style.margin = '2rem auto';
      root.innerHTML = `Cart is Empty`;
    };

    const removeItem = (index: number): void => {
      const cartItem = this._data[index];
      const cartNode = this._cartItems[index];
      cartNode.remove();
      this._cartItems = arrayRemove(this._cartItems, cartNode);
      this._data = arrayRemove(this._data, cartItem);
      this.draw(this._data);
      this.setLocalStorage().data;
      const isDataNull = this._data.length;
      if (!isDataNull) removeCartContainer();
    };

    const updateData = () => {
      if (!btn && !amount && !this._data[idx].quantity) return;
      const item = this._data[idx];
      if (item.stock && btn.classList.contains('btn-plus')) {
        item.quantity += 1;
        this._quantityCart += 1;
        this._headerCart.textContent = `${this._quantityCart}`;
        item.stock -= 1;
        amount.textContent = `${item.quantity}`;
        stock.textContent = `${item.stock}`;
        total.textContent = `${item.price * item.quantity}`;
      }
      if (item.quantity && btn.classList.contains('btn-minus')) {
        item.quantity -= 1;
        this._quantityCart -= 1;
        this._headerCart.textContent = `${this._quantityCart}`;
        item.stock += 1;
        if (item.quantity === 0) removeItem(idx);
        amount.textContent = `${item.quantity}`;
        stock.textContent = `${item.stock}`;
        total.textContent = `${item.price * item.quantity}`;
      }
      this.drawTotals();
      this.setLocalStorage().data;
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
        this._promo = promoDropList.map((item) => Object.keys(item)[0]);
        this.setLocalStorage().promo;
        priceSubTotals.classList.add('line-through');
        this._discount += promoData[value].discount;
        this.drawTotals();
      }
      if (type === 'Drop') {
        const nodeDrop = promoDropList.find((x) => x[value] instanceof HTMLElement);
        if (nodeDrop) {
          nodeDrop[value].remove();
          promoDropList = arrayRemove(promoDropList, nodeDrop);
          this._promo = promoDropList.map((item) => Object.keys(item)[0]);
          this.setLocalStorage().promo;
        }
        this._discount -= promoData[value].discount;
        this.drawTotals();
        handlePromo.apply(inputPromo);
        if (this._discount === 0) priceSubTotals.classList.remove('line-through');
      }
    };

    if (this._promo.length) {
      this._promo.forEach((item) => {
        setPromo(item, 'Add');
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

    let paginationLimit = 0;
    let currentPage = 1;
    let pageCount = 0;

    const setCurrentPage = (pageNum: number): void => {
      if (pageNum <= 0) return;
      if (pageNum > pageCount) return;
      currentPage = pageNum;
      pageNumber.textContent = `${currentPage}`;
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
      if (paginationNumbers && Number(paginationNumbers.value.trim()) > 0) {
        paginationLimit = Number(paginationNumbers.value.trim());
      } else {
        paginationLimit = 3;
        paginationNumbers.value = `${paginationLimit}`;
      }
      pageCount = Math.ceil(this._cartItems.length / paginationLimit);
      setCurrentPage(1);
    };
    prevBtn.addEventListener('click', () => setCurrentPage(currentPage - 1));
    nextBtn.addEventListener('click', () => setCurrentPage(currentPage + 1));
    paginationNumbers.addEventListener('change', handleItemsLimit);
    handleItemsLimit();
  }

  purchaseModal() {
    const buyBtn = document.querySelector('.btn__quick-buy') as HTMLButtonElement;
    buyBtn.addEventListener('click', purchase);
  }

  setLocalStorage() {
    return {
      data: localStorage.setItem('rss-online-cart-data', JSON.stringify(this._data)),
      promo: localStorage.setItem('rss-online-cart-promo', JSON.stringify(this._promo)),
    };
  }

  getLocalStorage(products: Products[]) {
    const localData = localStorage.getItem('rss-online-cart-data');
    if (localData) {
      const cartData = JSON.parse(localData);
      if (cartData.length) {
        this._data = cartData;
      } else this._data = products;
    }
    const localPromo = localStorage.getItem('rss-online-cart-promo');
    if (localPromo) {
      const cartPromo = JSON.parse(localPromo);
      if (cartPromo.length) {
        this._promo = cartPromo;
      }
    }
  }
}

export default Cart;
