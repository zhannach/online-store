import cardVisa from '../../assets/image/card-visa.svg';
import card from '../../assets/image/card.svg';
import cardMaster from '../../assets/image/card-mastercard.svg';
import cardAmex from '../../assets/image/card-american-express.svg';
import { Flags, Cards, Inputs } from '../../types/cart';
import purchaseTemplate from './template';

export const purchaseForm = () => {
  const creditCards: Cards = {
    '0': card,
    '3': cardAmex,
    '4': cardVisa,
    '5': cardMaster,
  };
  const root = document.getElementById('root') as HTMLDivElement;
  const purchaseTemp = document.createElement('template') as HTMLTemplateElement;
  purchaseTemp.innerHTML = purchaseTemplate;

  const purchaseClone = purchaseTemp.content.cloneNode(true) as HTMLElement;
  const modal = purchaseClone.querySelector('.modal') as HTMLDivElement;
  const spanIcon = purchaseClone.querySelector('.card-icon') as HTMLInputElement;

  const inputs: Inputs = {
    name: queryInputs('.name-input'),
    phone: queryInputs('.phone-input'),
    address: queryInputs('.address-input'),
    email: queryInputs('.email-input'),
    number: queryInputs('.card-input'),
    exp: queryInputs('.exp-input'),
    cvv: queryInputs('.cvv-input'),
  };

  function queryInputs(name: string): HTMLInputElement {
    return purchaseClone.querySelector(name) as HTMLInputElement;
  }

  function handleCardNumber(this: HTMLInputElement) {
    const value = this.value.replace(/[^\d]/g, '');
    this.value = value;
    const firstNumber = value[0];
    if (creditCards[firstNumber]) {
      spanIcon.style.backgroundImage = `url(${creditCards[firstNumber]})`;
    } else {
      spanIcon.style.backgroundImage = `url(${creditCards[0]})`;
    }
  }
  inputs.number.addEventListener('keyup', handleCardNumber);

  function handleExpiry(this: HTMLInputElement) {
    const value =
      this.value.replace(/\//g, '').substring(0, 2) +
      (this.value.length > 2 ? '/' : '') +
      this.value.replace(/\//g, '').substring(2, 4);
    this.value = value;
  }
  inputs.exp.addEventListener('keyup', handleExpiry);

  const validateFlags: Flags = {
    name: function (input: string): boolean {
      const value = input.split(' ');
      if (value.length < 2) return false;
      const result = value.reduce((pv, cv) => {
        if (cv.length >= 3) return pv + 1;
        return 0;
      }, 0);
      return result >= 2 ? true : false;
    },

    phone: function (input: string): boolean {
      let value = input;
      if (value.length < 10) return false;
      if (value[0] !== '+') return false;
      value = value.slice(1);
      const regexp = new RegExp(/\b\d{9,}\b/g);
      return regexp.test(value);
    },

    address: function (input: string): boolean {
      const value = input.split(' ');
      if (value.length < 3) return false;
      const result = value.reduce((pv, cv) => {
        if (cv.length >= 5) return pv + 1;
        return 0;
      }, 0);
      return result >= 3 ? true : false;
    },

    email: function (input: string): boolean {
      const value = input.toLocaleLowerCase();
      const regexp = new RegExp(/\S+@\S+\.\S+/);
      return regexp.test(value);
    },

    number: function (input: string): boolean {
      const value = input;
      const regexp = new RegExp(/^[0-9]{16}$/);
      return regexp.test(value);
    },

    exp: function (input: string): boolean {
      const value = input;
      const regexp = new RegExp(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
      return regexp.test(value);
    },

    cvv: function (input: string): boolean {
      const value = input;
      const regexp = new RegExp(/^[0-9]{3}$/);
      return regexp.test(value);
    },
  };

  function handleValidation(this: HTMLInputElement) {
    const validInputs: boolean[] = [];
    for (const key in validateFlags) {
      const errorDiv = document.querySelector(`.person-${key} .error`) as HTMLDivElement;
      const valid = validateFlags[key](inputs[key].value.trim());
      validInputs.push(valid);
      if (!valid && !errorDiv) {
        const container = document.querySelector(`.person-${key}`) as HTMLDivElement;
        const errorMsg = `<div class="error">Error</div>`;
        container.insertAdjacentHTML('beforeend', errorMsg);
      }
      if (errorDiv && valid) {
        errorDiv.remove();
      }
    }
    const isAllInputsValid = validInputs.every((x) => x);
    if (isAllInputsValid) return;
    let i = 2;
    const timerId = setInterval(() => {
      modal.innerHTML = `<h2 class="order-complete">Your order is complete. Redirect to main page ${i}</h2>`;
      i -= 1;
    }, 1000);

    setTimeout(() => {
      clearInterval(timerId);
      modal.remove();
      localStorage.clear();
      const url = window.location.origin;
      window.location.replace(url);
    }, 4000);
  }

  function handleModal(event: MouseEvent) {
    const target = event.target as HTMLDivElement;
    const isClose = target.classList.contains('modal');
    if (isClose) modal.remove();
  }
  modal.addEventListener('click', (event) => handleModal(event));

  purchaseClone.querySelector<HTMLInputElement>('.proceed-btn')?.addEventListener('click', handleValidation);
  root.appendChild(purchaseClone);
};
