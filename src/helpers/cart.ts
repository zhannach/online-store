import { Product } from "../types/products"

export type CartItem = {
  product: Product
  quantity: number
}

export type CartParams = {
  storage: Storage
  onUpdate: (cart: Cart) => void
}

type PromoDesc = {
  desc: string;
  discount: number;
};

export type PromoCodes = {
  [key: string]: PromoDesc;
};

export default class Cart {
  private storage: Storage
  private updateCallback: (cart: Cart) => void
  private promoData: PromoCodes = {
    rss: { desc: 'Rolling Scopes School - 10%', discount: 10 },
    epm: { desc: 'EPAM Systems - 10%', discount: 10 },
  };
  private cartItems: CartItem[] = []
  private cartPromo: string[] = []

  constructor({ storage, onUpdate }: CartParams) {
    this.storage = storage
    this.updateCallback = onUpdate
    this.getStorageData()
  }

  private getStorageData() {
    this.cartItems = JSON.parse(
      this.storage.getItem('rss-online-cart-data') as string
    ) || []
    this.cartPromo = JSON.parse(
      this.storage.getItem('rss-online-cart-promo') as string
    ) || []
  }

  private saveCartData() {
    this.storage.setItem('rss-online-cart-data', JSON.stringify(this.cartItems))
  }

  private savePromoData() {
    this.storage.setItem('rss-online-cart-promo', JSON.stringify(this.cartPromo))
  }

  add(product: Product) {
    this.update(product, 1)
  }

  remove(product: Product) {
    this.update(product, 0)
  }

  update(product: Product, quantity: number) {
    if (quantity < 1) {
      this.cartItems = this.cartItems.filter(item => item.product.id !== product.id)
    } else {
      const index = this.getItemIndex(product.id)
      if (index > -1) {
        this.cartItems[index].quantity = quantity
      } else {
        this.cartItems.push({ product, quantity } as CartItem)
      }
    }
    console.log(this.cartItems)
    this.saveCartData()
    this.updateCallback(this)
  }

  inCart(product: Product): boolean {
    for (const item of this.cartItems) {
      if (item.product.id === product.id) return true
    }
    return false
  }

  clear() {

  }

  getItemIndex(productId: number): number {
    let index = -1
    console.log(this.cartItems)
    this.cartItems.forEach((item, i) => {
      if (item.product.id === productId) {
        index = i
        return false
      }
    })
    return index
  }

  getItems() {
    return this.cartItems
  }

  addPromo(code: string) {
    if (!this.promoData[code]) {
      return alert('Invalid promo code!')
    }
    if (!this.cartPromo.includes(code)) {
      this.cartPromo.push(code)
      this.savePromoData()
    }
  }

  removePromo(code: string) {
    if (this.cartPromo.includes(code)) {
      this.cartPromo = this.cartPromo.filter((c) => c !== code)
      this.savePromoData()
    }
  }

  getPromoData() {
    return this.promoData
  }

  getPromoCodes() {
    return this.cartPromo
  }

  getDiscount(): number {
    return this.cartPromo.reduce((discount, code) => {
      return this.promoData[code] ? discount + this.promoData[code].discount : discount
    }, 0)
  }

  getSubTotal(): number {
    return this.cartItems.reduce((sum: number, item: CartItem) => {
      return sum + (item.quantity * item.product.price)
    }, 0)
  }

  getTotal(): number {
    const discount = this.getDiscount()
    return this.getSubTotal() * (discount ? (100 - discount) / 100 : 1)
  }

  getCount(): number {
    return this.cartItems.reduce((sum: number, item: CartItem) => {
      return sum + item.quantity
    }, 0)
  }
}