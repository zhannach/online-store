export interface Product {
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

export interface ApiProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Filter {
  name: string;
  type: FilterType;
  childSelector: string;
  element: HTMLElement;
  values: Array<string | number>;
  match: (product: Product, values: Array<string | number>) => boolean;
  options: Set<number | string>;
}

export enum FilterType {
  Checkbox,
  Range,
}
