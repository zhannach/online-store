import { Products } from '../../components/types';
import { randomInt, arrayRemove } from '../../components/utils/utils';
import { PromoNodes, PromoCodes } from '../../components/types';

class Cart {
  private _data: Products[] = [];
  private _subtotal!: HTMLDivElement;
  private _total!: HTMLDivElement;
  private _discount = 0;

  draw(products: Products[]) {
    this._data = products;
    this._total = document.querySelector('.totals__value') as HTMLDivElement;
    this._subtotal = document.querySelector('.subtotals__value') as HTMLDivElement;
    const container = document.querySelector<HTMLOListElement>('.cart-item__list');
    const fragment = document.createDocumentFragment();
    const cartItemTemp = document.querySelector('#cartItemTemp') as HTMLTemplateElement;

    this._data.forEach((item, idx) => {
      item.quantity = 1 * randomInt(1, 5);
      const cartClone = cartItemTemp.content.cloneNode(true) as HTMLElement;
      const amount = cartClone.querySelector('.cart-item__amount') as HTMLSpanElement;
      const btnPlus = cartClone.querySelector('.btn-plus') as HTMLDivElement;
      const btnMinus = cartClone.querySelector('.btn-minus') as HTMLDivElement;
      const stock = cartClone.querySelector('.amount__name') as HTMLSpanElement;
      const total = cartClone.querySelector('.cart-item__total') as HTMLDivElement;

      (cartClone.querySelector('.cart-item__image') as HTMLDivElement).style.backgroundImage = `url(${item.thumbnail})`;
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

    if (container) {
      container.innerHTML = '';
      container.appendChild(fragment);
    }

    this.drawTotals();
    this.applyPromo();
  }

  drawTotals() {
    if (this._total && this._subtotal) {
      let sum = this._data.reduce((accum, cur) => cur.price * cur.quantity + accum, 0);
      this._subtotal.textContent = `$${sum}`;
      if (this._discount) sum *= (100 - this._discount) / 100;
      this._total.textContent = `$${sum.toFixed(0)}`;
    }
  }

  updateItem(amount: HTMLSpanElement, stock: HTMLSpanElement, btn: HTMLDivElement, total: HTMLDivElement, idx: number) {
    const updateData = () => {
      if (!btn && !amount && !this._data[idx].quantity) return;
      const item = this._data[idx];
      if (item.stock && btn.classList.contains('btn-plus')) {
        item.quantity += 1;
        item.stock -= 1;
        amount.textContent = `${item.quantity}`;
        stock.textContent = `${item.stock}`;
        total.textContent = `${item.price * item.quantity}`;
      }
      if (item.quantity && btn.classList.contains('btn-minus')) {
        item.quantity -= 1;
        item.stock += 1;
        amount.textContent = `${item.quantity}`;
        stock.textContent = `${item.stock}`;
        total.textContent = `${item.price * item.quantity}`;
      }
      this.drawTotals();
    };
    btn.addEventListener('click', updateData);
  }

  applyPromo() {
    const promoAddList: PromoNodes[] = [];
    let promoDropList: PromoNodes[] = [];

    const promoData: PromoCodes = {
      rss: { desc: 'Rolling Scopes School - 10%', discount: 10 },
      epm: { desc: 'EPAM Systems - 10%', discount: 10 },
    };

    let lastPromo: keyof PromoNodes;

    //const promoTitleTempalte = `<h3 class="promo__title-code">Applied codes</h3>`;

    const inputPromo = document.querySelector('.price__promo') as HTMLInputElement;
    const totalPromo = document.querySelector('.cart-total__promo') as HTMLDivElement;
    const priceSubTotals = document.querySelector('.price__subtotals') as HTMLDivElement;

    const showPromo = (value: string, type: string): HTMLElement => {
      const node = document.createElement('div');
      const button = document.createElement('span');

      node.classList.add('promo__add-code');
      node.textContent = `${promoData[value].desc} `;
      button.textContent = `${type}`;

      node.append(button);
      if (type == 'Add') {
        totalPromo.after(node);
        button.addEventListener('click', () => applyPromo(value, type));
      }
      if (type === 'Drop') {
        inputPromo.before(node);
        button.addEventListener('click', () => applyPromo(value, type));
      }
      return node;
    };

    const applyPromo = (value: string, type: string) => {
      if (type === 'Add') {
        const nodeAdd = promoAddList.pop();
        if (nodeAdd) nodeAdd[value].remove();
        const nodeDrop = showPromo(value, 'Drop');
        promoDropList.push({ [value]: nodeDrop });
        priceSubTotals.classList.add('line-through');
        this._discount += promoData[value].discount;
        this.drawTotals();
      }
      if (type === 'Drop') {
        const nodeDrop = promoDropList.find((x) => x[value] instanceof HTMLElement);
        if (nodeDrop) {
          nodeDrop[value].remove();
          promoDropList = arrayRemove(promoDropList, nodeDrop);
        }
        this._discount -= promoData[value].discount;
        this.drawTotals();
        handlePromo.apply(inputPromo);
        if (this._discount === 0) priceSubTotals.classList.remove('line-through');
      }
    };

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
}

export default Cart;
