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
