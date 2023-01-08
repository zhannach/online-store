export type Products = {
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
  images: Array<string>;
  quantity: number;
};

export type SourceProducts = {
  products: Array<Products>;
  total: number;
  skip: number;
  limit: number;
};

export type Nullable<T> = T | null;

export type Flags = {
  [key: string]: () => boolean;
};

export type Inputs = {
  [key: string]: HTMLInputElement;
};

export type Cards = {
  [key: string]: string;
};

type PromoDesc = {
  desc: string;
  discount: number;
};

export type PromoCodes = {
  [key: string]: PromoDesc;
};

export type PromoNodes = {
  [key: string]: HTMLElement;
};
