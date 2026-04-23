export type ImageValue = string | null | undefined;

export type Brand = {
  id: number;
  name: string;
  slug: string;
  image?: ImageValue;
  logo?: ImageValue;
  products_count?: number;
  cover_image?: ImageValue;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  seo_canonical_url?: string | null;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  image?: ImageValue;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  seo_canonical_url?: string | null;
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
  active?: boolean;
  quantity?: number | null;
  brand?: number | string | null;
  brand_data?: Brand | null;
  category?: number[] | number | string | null;
  category_data?: Category[] | null;
  product_image?: ProductImage[];
  images?: ProductImage[];
  tags?: string[];
  sales_count?: number;
  product_type?: string | null;
  sku?: string | null;
  linkVideo?: string | null;
  create_at?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  seo_canonical_url?: string | null;
};

export type Offer = {
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  image?: ImageValue;
  description?: string | null;
  products?: number | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  seo_canonical_url?: string | null;
};

export type Banner = {
  id: number;
  title?: string;
  description?: string | null;
  image?: ImageValue;
  link?: string | null;
  type?: string | null;
};

export type Flag = {
  id: number;
  name: string;
};

export type FeaturedProduct = {
  id: number;
  product?: number;
  order?: number;
  active?: boolean;
  product_details?: Product | null;
};

export type Branch = {
  id: number;
  name: string;
  active?: boolean;
};

export type UserAccount = {
  id: number;
  username: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_staff?: boolean;
  is_superuser?: boolean;
};

export type Customer = {
  id: number;
  user?: UserAccount | null;
  phone_number?: string | null;
  birth_date?: string | null;
  role?: string | null;
  branch?: number | null;
};

export type Address = {
  id: number;
  full_name?: string | null;
  phone_number?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  street?: string | null;
  building_number?: string | null;
  apartment_number?: string | null;
  location_link?: string | null;
  is_default?: boolean;
};

export type OrderStatus = {
  id: number;
  name: string;
  slug: string;
  color: string;
};

export type Company = {
  id: number;
  name: string;
  title?: string | null;
  description?: string | null;
  logo?: ImageValue;
  cover?: ImageValue;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  whatsapp?: string | null;
  facebook?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  tiktok?: string | null;
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
