import cardVisa from '../../assets/image/card-visa.svg';
import card from '../../assets/image/card.svg';
import cardMaster from '../../assets/image/card-mastercard.svg';
import cardAmex from '../../assets/image/card-american-express.svg';
import { Flags, Cards, Inputs } from '../../components/types';

export const purchaseForm = () => {
  const creditCards: Cards = {
    '0': card,
    '3': cardAmex,
    '4': cardVisa,
    '5': cardMaster,
  };

  const spanIcon = document.querySelector('.card-icon') as HTMLInputElement;

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
    return document.querySelector(name) as HTMLInputElement;
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
    name: function (): boolean {
      const value = inputs.name.value.trim().split(' ');
      if (value.length < 2) return false;
      const result = value.reduce((pv, cv) => {
        if (cv.length >= 3) return pv + 1;
        return 0;
      }, 0);
      return result >= 2 ? true : false;
    },

    phone: function (): boolean {
      let value = inputs.phone.value.trim();
      if (value.length < 10) return false;
      if (value[0] !== '+') return false;
      value = value.slice(1);
      const regexp = new RegExp(/\b\d{9,}\b/g);
      return regexp.test(value);
    },

    address: function (): boolean {
      const value = inputs.address.value.trim().split(' ');
      if (value.length < 3) return false;
      const result = value.reduce((pv, cv) => {
        if (cv.length >= 5) return pv + 1;
        return 0;
      }, 0);
      return result >= 3 ? true : false;
    },

    email: function (): boolean {
      const value = inputs.email.value.trim().toLocaleLowerCase();
      const regexp = new RegExp(/\S+@\S+\.\S+/);
      return regexp.test(value);
    },

    number: function (): boolean {
      const value = inputs.number.value;
      const regexp = new RegExp(/^[0-9]{16}$/);
      return regexp.test(value);
    },

    exp: function (): boolean {
      const value = inputs.exp.value;
      const regexp = new RegExp(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/);
      return regexp.test(value);
    },

    cvv: function (): boolean {
      const value = inputs.cvv.value;
      const regexp = new RegExp(/^[0-9]{3}$/);
      return regexp.test(value);
    },
  };

  function handleValidation(this: HTMLInputElement) {
    for (const key in validateFlags) {
      const errorDiv = document.querySelector(`.person-${key} .error`) as HTMLDivElement;
      const valid = validateFlags[key]();
      if (!valid && !errorDiv) {
        const container = document.querySelector(`.person-${key}`) as HTMLDivElement;
        const errorMsg = `<div class="error">Error</div>`;
        container.insertAdjacentHTML('beforeend', errorMsg);
      }
      if (errorDiv && valid) {
        errorDiv.remove();
      }
    }
  }
  document.querySelector<HTMLInputElement>('.proceed-btn')?.addEventListener('click', handleValidation);
};
