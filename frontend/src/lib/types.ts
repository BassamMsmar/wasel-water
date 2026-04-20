export type ImageValue = string | null | undefined;

export type Brand = {
  id: number;
  name: string;
  slug: string;
  image?: ImageValue;
  logo?: ImageValue;
  products_count?: number;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: ImageValue;
};

export type ProductImage = {
  id?: number;
  image?: ImageValue;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  image?: ImageValue;
  flag?: number | null;
  flag_name?: string | null;
  old_price?: string | number | null;
  new_price?: string | number | null;
  price?: string | number | null;
  stock?: number | null;
  is_available?: boolean;
  discount_percent?: number;
  is_new?: boolean;
  rating?: number | string | null;
  reviews_count?: number;
  description?: string | null;
  subtitle?: string | null;
  descriptions?: string | null;
  quantity?: number | null;
  brand?: number | string | null;
  brand_data?: Brand | null;
  category?: number | string | null;
  category_data?: Category | null;
  product_image?: ProductImage[];
  images?: ProductImage[];
  tags?: string[];
  sales_count?: number;
  product_type?: string | null;
  sku?: string | null;
  linkVideo?: string | null;
  create_at?: string;
};

export type Offer = {
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  image?: ImageValue;
  description?: string | null;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type CartItem = {
  product: Product;
  quantity: number;
};
