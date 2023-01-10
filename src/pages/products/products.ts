import interpolate from '../../helpers/interpolate';
import rangeSliderInit from '../../helpers/multiple-slider';
import 'nouislider/dist/nouislider.css';
import '../../assets/styles/multiple-slider.scss';
import { target } from 'nouislider';
import { Product, ApiProductsResponse, Filter, FilterType } from '../../types/products';
import { Router } from '../../helpers/router';
import Cart from '../../helpers/cart';

export default class ProductsPage {
  private sortFuncs: Map<string, (a: Product, b: Product) => number>;
  private allProducts: Product[] = [];
  private filteredProducts: Product[] = [];
  private total = 1;
  private filters: Filter[] = [];
  private allProductsContainer: HTMLElement;
  private searchInputEl: HTMLInputElement;
  private sortSelectEl: HTMLSelectElement;
  private viewModeEls: NodeListOf<HTMLButtonElement>;
  private foundAmount: HTMLElement;
  private itemTemplate: HTMLTemplateElement;
  private cart: Cart;
  private router: Router;

  constructor(cart: Cart, router: Router) {
    this.cart = cart;
    this.router = router;
    this.sortFuncs = new Map([
      ['price-asc', (a: Product, b: Product) => a.price - b.price],
      ['price-desc', (a: Product, b: Product) => b.price - a.price],
      ['popularity-asc', (a: Product, b: Product) => a.rating - b.rating],
      ['popularity-desc', (a: Product, b: Product) => b.rating - a.rating],
    ]);
    this.itemTemplate = document.querySelector('#item-template') as HTMLTemplateElement;
    this.allProductsContainer = document.querySelector('.home-products__items') as HTMLElement;
    this.searchInputEl = document.querySelector('.sort-products__search-input') as HTMLInputElement;
    this.sortSelectEl = document.querySelector('.home__sort-bar') as HTMLSelectElement;
    this.viewModeEls = document.querySelectorAll('.products-view__btn') as NodeListOf<HTMLButtonElement>;
    this.foundAmount = document.querySelector('.home__found-amount') as HTMLElement;
  }

  fetchProducts = async function (limit = 100): Promise<ApiProductsResponse> {
    // const skip = limit * (page - 1)
    const response = await fetch(`https://dummyjson.com/products?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Page not found');
    }
    const data = await response.json();
    return data;
  };

  async run() {
    // /products/19
    // /\/products\/([0-9]+)/i
    const data: ApiProductsResponse = await this.fetchProducts();
    this.allProducts = data.products;
    this.total = data.total;
    this.initFilters();
    this.parseUrl();
    this.filteredProducts = this.filterProducts();
    this.renderProducts();
    this.renderFilterSidebar();
    this.attachEvents();
  }

  initFilters() {
    this.filters = [
      {
        name: 'category',
        type: FilterType.Checkbox,
        childSelector: '.checkbox-input',
        element: document.querySelector('.filter-category') as HTMLElement,
        values: [],
        options: new Set(),
        match: (product: Product, values: Array<string | number>) => {
          return values.length === 0 || values.includes(product.category);
        },
      },
      {
        name: 'brand',
        type: FilterType.Checkbox,
        childSelector: '.checkbox-input',
        element: document.querySelector('.filter-brand') as HTMLElement,
        values: [],
        options: new Set(),
        match: (product: Product, values: Array<string | number>) => {
          return values.length === 0 || values.includes(product.brand);
        },
      },
      {
        name: 'price',
        type: FilterType.Range,
        childSelector: '.filter-price__input',
        element: document.querySelector('.filter-price') as HTMLElement,
        values: [],
        options: new Set(),
        match: (product: Product, values: Array<string | number>) => {
          if (values[0] === 0 || values[1] === 0) return true;
          return product.price <= values[1] && product.price >= values[0];
        },
      },
      {
        name: 'stock',
        type: FilterType.Range,
        childSelector: '.filter-stock__input',
        element: document.querySelector('.filter-stock') as HTMLElement,
        // only filtered allProducts
        values: [],
        // all allProducts
        options: new Set(),
        match: (product: Product, values: Array<string | number>) => {
          if (values[0] === 0 || values[1] === 0) return true;
          return product.stock <= values[1] && product.stock >= values[0];
        },
      },
    ];
    // init all unique options that exist in products
    this.allProducts.forEach((product) => {
      this.filters.forEach((filter) => {
        const filterValue = product[filter.name as keyof Product] ?? null;
        if (typeof filterValue === 'number' || typeof filterValue === 'string') {
          filter.options.add(filterValue);
        }
      });
    });
  }

  // add event for all input element on the page, if they change
  attachEvents() {
    const filterSection = document.querySelector('.home-products__filters') as HTMLElement;
    const allInputs = filterSection.querySelectorAll('input') as NodeList;
    allInputs.forEach((input) => {
      input.addEventListener('change', () => this.filter());
    });
    const searchBtnEl = document.querySelector('.sort-products__search-btn') as HTMLButtonElement;
    searchBtnEl.addEventListener('click', () => this.filter());

    this.sortSelectEl.addEventListener('change', () => {
      if (this.sortFuncs.has(this.sortSelectEl.value)) {
        this.filteredProducts.sort(this.sortFuncs.get(this.sortSelectEl.value));
      }
      this.renderProducts();
      this.updateURL();
    });

    this.viewModeEls.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('selected')) return;
        this.allProductsContainer.classList.toggle('double-view');
        this.viewModeEls.forEach((el) => el.classList.toggle('selected'));
        this.updateURL();
      });
    });

    const reserBtn = filterSection.querySelector('.filter__btn-reset') as HTMLButtonElement;
    reserBtn.addEventListener('click', () => this.resetFilters());

    const copyBtn = filterSection.querySelector('.filter__btn-copy') as HTMLButtonElement;
    copyBtn.addEventListener('click', () => {
      const linkValue = window.location.href;
      navigator.clipboard.writeText(linkValue);
      if (copyBtn.innerText !== 'Copied!') {
        const originalText = copyBtn.innerText;
        copyBtn.innerText = 'Copied!';
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 1000);
      }
    });
  }

  // render data allProducts on the page
  renderProducts() {
    const productCards: string[] = this.filteredProducts.map((item, index) => {
      return interpolate(this.itemTemplate.innerHTML, { index, item });
    });
    if (productCards.length > 0) {
      this.foundAmount.innerText = `${productCards.length}`;
      this.allProductsContainer.innerHTML = productCards.join('');
    } else {
      this.allProductsContainer.innerHTML = `<h2 class="home-products__not-found">No products found</h2>`;
      this.foundAmount.innerText = '0';
    }
    const links = this.allProductsContainer.querySelectorAll('a');
    [...links].forEach((link) => {
      link.addEventListener('click', (e) => this.router.handleLinkRoute(e));
    });
    this.allProductsContainer.querySelectorAll('.home-products__item').forEach((item, index) => {
      // const index = Number(item.getAttribute('data-index'))
      const product = this.filteredProducts[index];
      const addBtn = item.querySelector('.home-btn__add');
      if (addBtn && this.cart.inCart(product)) {
        addBtn.className = 'home-btn__add in-cart';
      }
      addBtn?.addEventListener('click', () => {
        if (this.cart.inCart(product)) {
          return this.router.redirectTo('/cart');
        }
        addBtn.classList.add('in-cart');
        this.cart.add(product);
      });
    });
  }

  renderFilterSidebar() {
    this.filters.forEach((filter) => {
      const filteredProducts = this.filterProducts(filter.name);
      if (filter.type === FilterType.Checkbox) {
        const listEl = filter.element.querySelector('.filter-list') as HTMLDivElement;
        filter.options.forEach((option) => {
          const element = document.createElement('div');
          const checked = filter.values.includes(option) ? 'checked' : '';
          const countAll = this.getFilterOptionMatchCount(option, filter, this.allProducts);
          const countFiltered = this.getFilterOptionMatchCount(option, filter, filteredProducts);
          element.classList.add('checkbox-line', 'item-active');
          element.innerHTML = ` <input type="checkbox" class="checkbox-input" id="${option}" value="${option}" ${checked}>
          <label for="${option}">${option}</label>
          <span class="checkbox-amount">${countFiltered}/${countAll}</span>`;
          listEl.appendChild(element);
        });
      } else if (filter.type === FilterType.Range) {
        const options = filteredProducts.map((p) => p[filter.name as keyof Product]) as number[]
        const min = Math.min(...options);
        const max = Math.max(...options);
        const minValue = Math.min(...(filter.options as Set<number>));
        const maxValue = Math.max(...(filter.options as Set<number>));
        const minInput = filter.element.querySelector('.input__min') as HTMLInputElement;
        const maxInput = filter.element.querySelector('.input__max') as HTMLInputElement;
        const values = filter.values || [min, max]
        if (values[0] < min) values[0] = min
        if (values[1] > max) values[1] = max
        if (values[0] > max) values[0] = max
        if (values[1] < min) values[1] = min
        minInput.value = values[0] ? values[0].toString() : min.toString();
        maxInput.value = values[1] ? values[1].toString() : max.toString();
        rangeSliderInit({
          parentEl: filter.element,
          sliderSelector: '.filter-multi-input',
          textPrefix: filter.name === 'price' ? '$' : '',
          minValue,
          maxValue,
          startValue: Number(minInput.value),
          endValue: Number(maxInput.value),
          callback: () => this.filter(),
        });
      }
    });
  }

  getFilterOptionMatchCount(value: string | number, filter: Filter, products: Product[]): number {
    return products.reduce((acc: number, product) => {
      return filter.match(product, [value]) ? acc + 1 : acc;
    }, 0);
  }

  filter() {
    this.filters = this.filters.map((filter) => {
      filter.values = this.getFilteredValues(filter.element, filter.childSelector, filter.type);
      return filter;
    });
    this.filters.forEach((filter) => {
      const filteredProducts = this.filterProducts(filter.name);
      if (filter.type === FilterType.Checkbox) {
        const listEl = filter.element.querySelector('.filter-list') as HTMLDivElement;
        let index = 0;
        filter.options.forEach((option) => {
          const countAll = this.getFilterOptionMatchCount(option, filter, this.allProducts);
          const countFiltered = this.getFilterOptionMatchCount(option, filter, filteredProducts);
          const counter = listEl.children[index]?.querySelector('.checkbox-amount');
          if (counter) counter.innerHTML = `${countFiltered}/${countAll}`;
          index++;
        });
      } else if (filter.type === FilterType.Range) {
        const options = filteredProducts.map((p) => p[filter.name as keyof Product]) as number[]
        const input = filter.element.querySelector('.filter-multi-input') as target;
        const min = Math.min(...options);
        const max = Math.max(...options);
        const values = [...filter.values]
        if (values[0] < min) values[0] = min
        if (values[1] > max) values[1] = max
        if (values[0] > max) values[0] = max
        if (values[1] < min) values[1] = min
        input.noUiSlider?.set(values)
      }
    });
    this.filteredProducts = this.filterProducts();
    this.renderProducts();
    this.updateURL();
  }

  resetFilters() {
    this.filters.forEach((filter) => {
      if (filter.type === FilterType.Checkbox) {
        const inputs = filter.element.querySelectorAll(`input`);
        inputs.forEach((input) => (input.checked = false));
      } else if (filter.type === FilterType.Range) {
        const input = filter.element.querySelector('.filter-multi-input') as target;
        const minValue = Math.min(...(filter.options as Set<number>));
        const maxValue = Math.max(...(filter.options as Set<number>));
        input.noUiSlider?.set([minValue, maxValue]);
      }
    });
    this.filter();
  }

  filterProducts(excludeFilter = ''): Product[] {
    return this.allProducts
      .filter((product: Product) => {
        for (const filter of this.filters) {
          if (filter.name !== excludeFilter && filter.values.length !== 0 && !filter.match(product, filter.values)) {
            return false;
          }
        }
        if (this.searchInputEl.value.trim() !== '' && !this.inSearch(product)) {
          return false;
        }
        return true;
      })
      .sort(this.sortFuncs.get(this.sortSelectEl.value || 'price-asc'));
  }
  // selecte checked values to one array

  getFilteredValues(parentElement: HTMLElement, selector: string, filterType: FilterType): Array<string | number> {
    const allValues = parentElement.querySelectorAll(selector);
    const returnValues: Array<string | number> = [];
    allValues.forEach((elem) => {
      const input = elem as HTMLInputElement;
      if (input.checked || filterType === FilterType.Range) {
        returnValues.push(filterType === FilterType.Range ? Number(input.value) : input.value);
      }
    });
    return returnValues;
  }

  inSearch(product: Product) {
    const value = this.searchInputEl.value.toLowerCase();
    return (
      product.category.toLowerCase().includes(value) ||
      product.title.toLowerCase().includes(value) ||
      product.brand.toLowerCase().includes(value) ||
      product.description.toLowerCase().includes(value) ||
      product.price.toString() === value ||
      product.stock.toString() === value
    );
  }

  updateURL() {
    const search: string[] = [];
    // loop filters => add search elems: caterory=smartphones/laptops
    this.filters.forEach((filter) => {
      if (filter.values.length === 0) return;
      if (filter.type === FilterType.Range) {
        const minValue = Math.min(...(filter.options as Set<number>));
        const maxValue = Math.max(...(filter.options as Set<number>));
        if (minValue === filter.values[0] && maxValue === filter.values[1]) return;
      }
      search.push(`${filter.name}=${filter.values.join('/')}`);
    });
    // view = add view by class
    if (this.allProductsContainer.className.includes('double-view')) {
      search.push(`view=grid`);
    }

    // search = add search input value
    if (this.searchInputEl.value !== '') {
      search.push(`search=${encodeURIComponent(this.searchInputEl.value)}`);
    }
    // sort = ??
    if (this.sortSelectEl.value !== 'price-asc') {
      search.push(`sort=${this.sortSelectEl.value}`);
    }

    let url = window.location.pathname;
    if (search.length) {
      url += `?${search.join('&')}`;
    }
    history.pushState({}, '', url);
  }

  parseUrl() {
    const queryString = window.location.search;
    const query: Map<string, string> = new Map();
    const pairs = (queryString[0] === '?' ? queryString.slice(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
    }
    // loop filters => add search elems: caterory=smartphones/laptops
    this.filters.forEach((filter) => {
      if (!query.get(filter.name)) return;
      filter.values = query.get(filter.name)?.split('/') as string[];
      if (filter.type === FilterType.Range) {
        filter.values = filter.values.map((v) => Number(v)) as number[];
      }
    });
    // view = add view by class
    if (query.get('view') === 'grid') {
      this.allProductsContainer.classList.add('double-view');
      this.viewModeEls.forEach((el) => el.classList.toggle('selected'));
    }
    // search = add search input value
    if (query.get('search')) {
      this.searchInputEl.value = query.get('search') as string;
    }
    // sort = ??
    if (query.get('sort')) {
      this.sortSelectEl.value = query.get('sort') as string;
    }
  }
}
