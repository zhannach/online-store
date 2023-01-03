import interpolate from "../../helpers/interpolate";
import rangeSliderInit from '../../helpers/multiple-slider'
import 'nouislider/dist/nouislider.css';
import '../../assets/styles/multiple-slider.scss'
import { target } from 'nouislider';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
}

interface ApiProductsResponse {
  products: Product[]
  total: number;
  skip: number;
  limit: number;
}

interface Filter {
  name: string,
  type: FilterType,
  childSelector: string,
  element: HTMLElement,
  values: Array<string | number>,
  match: (product: Product, values: Array<string | number>) => boolean,
  options: Set<number | string>,
}

enum FilterType {
  Checkbox,
  Range,
}


export default class ProductsPage {
  sortFuncs: Map<string, (a: Product, b: Product) => number>
  allProducts: Product[]
  filteredProducts: Product[]
  total: number = 1
  filters: Filter[]
  allProductsContainer: HTMLElement
  searchInputEl: HTMLInputElement
  sortSelectEl: HTMLSelectElement
  viewModeEls: NodeListOf<HTMLButtonElement>
  foundAmount: HTMLElement

  constructor() {
    this.allProducts = []
    this.filteredProducts = []
    this.filters = []
    this.sortFuncs = new Map([
      ["price-asc", (a: Product, b: Product) => a.price - b.price],
      ["price-desc", (a: Product, b: Product) => b.price - a.price],
      ["popularity-asc", (a: Product, b: Product) => a.rating - b.rating],
      ["popularity-desc", (a: Product, b: Product) => b.rating - a.rating],
    ]),
      this.allProductsContainer = document.querySelector('.home-products__items') as HTMLElement
    this.searchInputEl = document.querySelector('.sort-products__search-input') as HTMLInputElement
    this.sortSelectEl = document.querySelector('.home__sort-bar') as HTMLSelectElement
    this.viewModeEls = document.querySelectorAll('.products-view__btn') as NodeListOf<HTMLButtonElement>
    this.foundAmount = document.querySelector('.home__found-amount') as HTMLElement
  }

  fetchProducts = async function (page: number = 1, limit: number = 100): Promise<ApiProductsResponse> {
    // const skip = limit * (page - 1)
    const response = await fetch('https://dummyjson.com/products')
    if (!response.ok) {
      throw new Error("Page not found")
    }
    const data = await response.json()
    return data;
  }

  async run() {
    // /products/19
    // /\/products\/([0-9]+)/i
    const data: ApiProductsResponse = await this.fetchProducts()
    this.allProducts = data.products
    this.total = data.total
    this.initFilters()
    this.parseUrl('?category=smartphones/laptops/home-decoration&brand=Apple/Samsung/OPPO&price=234/1421&stock=17/130&view=grid&sort=price-desc')
    this.filterProducts()
    this.render()
    this.renderFilterSidebar()
    this.attachEvents()
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
          return values.length === 0 || values.includes(product.category)
        }
      },
      {
        name: 'brand',
        type: FilterType.Checkbox,
        childSelector: '.checkbox-input',
        element: document.querySelector('.filter-brand') as HTMLElement,
        values: [],
        options: new Set(),
        match: (product: Product, values: Array<string | number>) => {
          return values.length === 0 || values.includes(product.brand)
        }
      },
      {
        name: 'price',
        type: FilterType.Range,
        childSelector: '.filter-price__input',
        element: document.querySelector('.filter-price') as HTMLElement,
        values: [],
        options: new Set(),
        match: (product: Product, values: Array<string | number>) => {
          if (values[0] === 0 || values[1] === 0) return true
          return product.price <= values[1] && product.price >= values[0]
        }
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
          if (values[0] === 0 || values[1] === 0) return true
          return product.stock <= values[1] && product.stock >= values[0]
        }
      },
    ]
    // init all unique options that exist in products
    this.allProducts.forEach((product) => {
      this.filters.forEach((filter) => {
        const filterValue = product[filter.name as keyof Product] ?? null
        if (typeof filterValue === 'number' || typeof filterValue === 'string') {
          filter.options.add(filterValue)
        }
      })
    })
  }

  // add event for all input element on the page, if they change
  attachEvents() {
    const filterSection = document.querySelector('.home-products__filters') as HTMLElement;
    const allInputs = filterSection.querySelectorAll('input') as NodeList;
    allInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.filter()
      })
    })
    const searchBtnEl = document.querySelector('.sort-products__search-btn') as HTMLButtonElement
    searchBtnEl.addEventListener('click', () => this.filter())

    this.sortSelectEl.addEventListener('change', () => {
      if (this.sortFuncs.has(this.sortSelectEl.value)) {
        this.filteredProducts.sort(this.sortFuncs.get(this.sortSelectEl.value))
      }
      this.render()
      this.updateURL()
    })

    this.viewModeEls.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('selected')) return
        this.allProductsContainer.classList.toggle('double-view')
        this.viewModeEls.forEach((el) => el.classList.toggle('selected'))
        this.updateURL()
      })
    })

    const reserBtn = filterSection.querySelector('.filter__btn-reset') as HTMLButtonElement
    reserBtn.addEventListener('click', () => this.resetFilters())

    const copyBtn = filterSection.querySelector('.filter__btn-copy') as HTMLButtonElement
    copyBtn.addEventListener('click', () => {
      const linkValue = window.location.href;
      if (linkValue) {
        navigator.clipboard.writeText(linkValue)
          .then(() => {
            if (copyBtn.innerText !== 'Copied!') {
              const originalText = copyBtn.innerText;
              copyBtn.innerText = 'Copied!';
              setTimeout(() => {
                copyBtn.innerText = originalText;
              }, 1000);
            }
          })
          .catch(err => {
            console.log('Something went wrong', err);
          })
      }
    })
  }

  // render data allProducts on the page
  render() {
    const template = document.querySelector('#item-template') as HTMLTemplateElement;
    const productCarts: string[] = this.filteredProducts.map((item) => {
      return interpolate(template.innerHTML, { item })
    })
    if (productCarts.length > 0) {
      this.foundAmount.innerText = `${productCarts.length}`
      this.allProductsContainer.innerHTML = productCarts.join('');
    } else {
      this.allProductsContainer.innerHTML = `<h2 class="home-products__not-found">No products found</h2>`
      this.foundAmount.innerText = '0'

    }
  }

  renderFilterSidebar() {
    this.filters.forEach(filter => {
      if (filter.type === FilterType.Checkbox) {
        const listEl = filter.element.querySelector('.filter-list') as HTMLDivElement
        filter.options.forEach(option => {
          const element = document.createElement('div')
          const checked = filter.values.includes(option) ? 'checked' : ''
          element.classList.add('checkbox-line', 'item-active')
          element.innerHTML = ` <input type="checkbox" class="checkbox-input" id="${option}" value="${option}" ${checked}>
          <label for="${option}">${option}</label>
          <span class="checkbox-amount">5/5</span>`
          listEl.appendChild(element)
        })
      } else if (filter.type === FilterType.Range) {
        const minValue = Math.min(...filter.options as Set<number>)
        const maxValue = Math.max(...filter.options as Set<number>)
        const minInput = filter.element.querySelector('.input__min') as HTMLInputElement
        const maxInput = filter.element.querySelector('.input__max') as HTMLInputElement
        minInput.value = filter.values[0] ? filter.values[0].toString() : minValue.toString()
        maxInput.value = filter.values[1] ? filter.values[1].toString() : maxValue.toString()
        rangeSliderInit({
          parentEl: filter.element,
          sliderSelector: '.filter-multi-input',
          textPrefix: filter.name === 'price' ? '$' : '',
          minValue,
          maxValue,
          startValue: Number(minInput.value),
          endValue: Number(maxInput.value),
          callback: () => this.filter()
        })
      }
    })
  }

  filter() {
    this.filters = this.filters.map((filter) => {
      filter.values = this.getFilteredValues(filter.element, filter.childSelector, filter.type)
      return filter
    })
    this.filterProducts()
    this.render()
    this.updateURL()
  }

  resetFilters() {
    this.filters.forEach((filter) => {
      if (filter.type === FilterType.Checkbox) {
        const inputs = filter.element.querySelectorAll(`input`)
        inputs.forEach((input) => input.checked = false)
      } else if (filter.type === FilterType.Range) {
        const input = filter.element.querySelector('.filter-multi-input') as target;
        const minValue = Math.min(...filter.options as Set<number>)
        const maxValue = Math.max(...filter.options as Set<number>)
        input.noUiSlider?.set([minValue, maxValue])
      }
    })
    this.filter()
  }

  filterProducts() {
    this.filteredProducts = this.allProducts.filter((product: Product) => {
      for (const filter of this.filters) {
        if (filter.values.length !== 0 && !filter.match(product, filter.values)) {
          return false
        }
      }
      if (this.searchInputEl.value.trim() !== '' && !this.inSearch(product)) {
        return false
      }
      return true
    })
      .sort(this.sortFuncs.get(this.sortSelectEl.value || 'price-asc'))
  }
  // selecte checked values to one array

  getFilteredValues(parentElement: HTMLElement, selector: string, filterType: FilterType): Array<string | number> {
    const allValues = parentElement.querySelectorAll(selector);
    const returnValues: Array<string | number> = []
    allValues.forEach((elem) => {
      const input = elem as HTMLInputElement;
      if (input.checked || filterType === FilterType.Range) {
        returnValues.push(filterType === FilterType.Range ? Number(input.value) : input.value)
      }
    })
    return returnValues;
  }

  inSearch(product: Product) {
    const value = this.searchInputEl.value.toLowerCase()
    return product.category.toLowerCase().includes(value) || product.title.toLowerCase().includes(value) ||
      product.brand.toLowerCase().includes(value) || product.description.toLowerCase().includes(value) ||
      product.price.toString() === value || product.stock.toString() === value
  }

  updateURL() {
    const search: string[] = []
    // loop filters => add search elems: caterory=smartphones/laptops
    this.filters.forEach((filter) => {
      if (filter.values.length === 0) return
      if (filter.type === FilterType.Range) {
        const minValue = Math.min(...filter.options as Set<number>)
        const maxValue = Math.max(...filter.options as Set<number>)
        if (minValue === filter.values[0] && maxValue === filter.values[1]) return
      }
      search.push(`${filter.name}=${filter.values.join('/')}`)
    })
    // view = add view by class
    if (this.allProductsContainer.className.includes('double-view')) {
      search.push(`view=grid`)
    }

    // search = add search input value
    if (this.searchInputEl.value !== '') {
      search.push(`search=${encodeURIComponent(this.searchInputEl.value)}`)
    }
    // sort = ??
    if (this.sortSelectEl.value !== 'price-asc') {
      search.push(`sort=${this.sortSelectEl.value}`)
    }

    let url = window.location.pathname;
    if (search.length) {
      url += `?${search.join('&')}`
    }
    history.pushState({}, '', url)

  }

  parseUrl(queryString: string) {
    const query: Map<string, string> = new Map
    //const queryString = window.location.search
    const pairs = (queryString[0] === '?' ? queryString.slice(1) : queryString).split('&');
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].split('=');
      query.set(decodeURIComponent(pair[0]), decodeURIComponent(pair[1] || ''));
    }
    // loop filters => add search elems: caterory=smartphones/laptops
    this.filters.forEach((filter) => {
      if (!query.get(filter.name)) return
      filter.values = query.get(filter.name)?.split('/') as string[]
      if (filter.type === FilterType.Range) {
        filter.values = filter.values.map((v) => Number(v)) as number[]
      }
    })
    // view = add view by class
    if (query.get('view') === 'grid') {
      this.allProductsContainer.classList.add('double-view')
      this.viewModeEls.forEach((el) => el.classList.toggle('selected'))
    }
    // search = add search input value
    if (query.get('search')) {
      this.searchInputEl.value = query.get('search') as string
    }
    // sort = ??
    if (query.get('sort')) {
      this.sortSelectEl.value = query.get('sort') as string
    }
  }
}

