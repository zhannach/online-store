import interpolate from "../../helpers/interpolate";
import rangeSliderInit from '../../helpers/multiple-slider'
import 'nouislider/dist/nouislider.css';
import '../../assets/styles/multiple-slider.scss'


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
  allProducts: Product[]
  filteredProducts: Product[]
  total: number = 1
  filters: Filter[]
  allProductsContainer: HTMLElement;
  searchInputEl: HTMLInputElement

  constructor() {
    this.allProducts = []
    this.filteredProducts = []
    this.filters = []
    this.allProductsContainer = document.querySelector('.home-products__items') as HTMLElement
    this.searchInputEl = document.querySelector('.sort-products__search-input') as HTMLInputElement
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
    // /allProducts/19
    // /\/allProducts\/([0-9]+)/i
    const data: ApiProductsResponse = await this.fetchProducts()
    this.filteredProducts = data.products
    this.allProducts = data.products
    this.total = data.total
    this.render()
    this.initFilters()
    this.renderFilterSidebar()
    this.attachEvents()
    this.changeView()
    this.sortProducts()
    this.searchProducts()
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
  }

  // render data allProducts on the page
  render() {
    const template = document.querySelector('#item-template') as HTMLTemplateElement;
    const productCarts: string[] = this.filteredProducts.map((item) => {
      return interpolate(template.innerHTML, { item })
    })
    if (productCarts.length > 0) {
      this.allProductsContainer.innerHTML = productCarts.join('');
    } else {
      this.allProductsContainer.innerHTML = `<h2 class="home-products__not-found">No products found</h2>`
    }
  }

  renderFilterSidebar() {
    this.filters.forEach(filter => {
      if (filter.type === FilterType.Checkbox) {
        const listEl = filter.element.querySelector('.filter-list') as HTMLDivElement
        filter.options.forEach(option => {
          const element = document.createElement('div')
          element.classList.add('checkbox-line', 'item-active')
          element.innerHTML = ` <input type="checkbox" class="checkbox-input" id="${option}" value="${option}">
          <label for="${option}">${option}</label>
          <span class="checkbox-amount">5/5</span>`
          listEl.appendChild(element)
        })
      } else if (filter.type === FilterType.Range) {
        const minValue = Math.min(...filter.options as Set<number>)
        const maxValue = Math.max(...filter.options as Set<number>)
        const minInput = filter.element.querySelector('.input__min') as HTMLInputElement
        const maxInput = filter.element.querySelector('.input__max') as HTMLInputElement
        minInput.value = minValue.toString()
        maxInput.value = maxValue.toString()
        console.log(maxValue.toString())
        rangeSliderInit({
          parentEl: filter.element,
          sliderSelector: '.filter-multi-input',
          textPrefix: filter.name === 'price' ? '$' : '',
          minValue,
          maxValue,
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
    this.render()
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

  changeView() {
    const viewListBtn = document.querySelector('.products-view__list') as HTMLButtonElement
    const viewPairBtn = document.querySelector('.products-view__pair') as HTMLButtonElement
    viewPairBtn.addEventListener('click', () => {
      console.log('click')
      this.allProductsContainer.classList.add('double-view')
    })
    viewListBtn.addEventListener('click', () => {
      console.log('click')
      this.allProductsContainer.classList.remove('double-view')
    })
  }

  sortProducts() {
    const sortSelectEl = document.querySelector('.home__sort-bar') as HTMLSelectElement;
    console.log(sortSelectEl.value)
    sortSelectEl.addEventListener('change', () => {
      if (sortSelectEl.value === 'price-asc') {
        this.filteredProducts.sort((a: Product, b: Product) => a.price - b.price)
      } else if (sortSelectEl.value === 'price-desc') {
        this.filteredProducts.sort((a: Product, b: Product) => b.price - a.price)
      } else if (sortSelectEl.value === 'popularity-asc') {
        this.filteredProducts.sort((a: Product, b: Product) => a.rating - b.rating)
      } else if (sortSelectEl.value === 'popularity-desc') {
        this.filteredProducts.sort((a: Product, b: Product) => b.rating - a.rating)
      }
      this.render()
    })
  }

  searchProducts() {
    const searchBtnEl = document.querySelector('.sort-products__search-btn') as HTMLButtonElement
    searchBtnEl.addEventListener('click', () => {
      this.filteredProducts.filter((product) => {
        if (product.category.includes(this.searchInputEl.value) || product.title.includes(this.searchInputEl.value) ||
          product.brand.includes(this.searchInputEl.value) || product.description.includes(this.searchInputEl.value)) {

        }
      })
    })

  }

  inSearch(product: Product) {
    const value = this.searchInputEl.value.toLowerCase()
    return product.category.toLowerCase().includes(value) || product.title.toLowerCase().includes(value) ||
      product.brand.toLowerCase().includes(value) || product.description.toLowerCase().includes(value) ||
      product.price.toString() === value || product.stock.toString() === value
  }
}

