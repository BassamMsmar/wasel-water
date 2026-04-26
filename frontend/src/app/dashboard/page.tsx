"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import {
  ArrowUpRight,
  Boxes,
  Building2,
  Eye,
  Flag,
  GalleryVerticalEnd,
  Gift,
  Globe,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Package,
  PackagePlus,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Tags,
  Trash2,
  Users,
} from "lucide-react";
import { authFetchList, authRequest, getMyOrders, getProfile, isLoggedIn, logout } from "@/lib/auth";
import { getBanners, getBrands, getCategories, getOffers, getProducts } from "@/lib/api";
import { absoluteMediaUrl, money } from "@/lib/media";
import { ImageCropper } from "@/components/ImageCropper";
import type {
  Banner,
  Brand,
  Branch,
  Category,
  Customer,
  FeaturedProduct,
  Flag as ProductFlag,
  Offer,
  OrderStatus,
  Product,
  UserAccount,
} from "@/lib/types";

type Order = {
  id: number;
  created_at: string;
  total_price: string;
  is_paid: boolean;
  branch?: string | null;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  status: OrderStatus | null;
  items: { id: number; price: string; quantity: number }[];
};

type ModuleKey =
  | "products"
  | "categories"
  | "offers"
  | "banners"
  | "brands"
  | "flags"
  | "orders"
  | "branches"
  | "users";

type SidebarItem = {
  id: number;
  title: string;
  subtitle?: string;
  image?: string | null;
  badge?: string;
};

type ProductFormState = {
  name: string;
  slug: string;
  subtitle: string;
  descriptions: string;
  old_price: string;
  new_price: string;
  quantity: string;
  brand: string;
  flag: string;
  product_type: string;
  sku: string;
  linkVideo: string;
  active: boolean;
  category: number[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
};

type CategoryFormState = {
  name: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
};

type BrandFormState = {
  name: string;
  slug: string;
  description: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
};

type OfferFormState = {
  title: string;
  description: string;
  products: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  seo_canonical_url: string;
};

type BannerFormState = {
  title: string;
  description: string;
  link: string;
  type: string;
};

type FlagFormState = {
  name: string;
};

type BranchFormState = {
  name: string;
  active: boolean;
};

const adminModules: { key: ModuleKey; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { key: "products", label: "المنتجات", icon: Package },
  { key: "categories", label: "الأصناف", icon: Tags },
  { key: "offers", label: "العروض", icon: Gift },
  { key: "banners", label: "البنرات", icon: GalleryVerticalEnd },
  { key: "brands", label: "البراندات", icon: Building2 },
  { key: "flags", label: "الأوسمة", icon: Flag },
  { key: "orders", label: "الطلبات", icon: Boxes },
  { key: "branches", label: "الفروع", icon: MapPinned },
  { key: "users", label: "المستخدمون", icon: Users },
];

function primaryLabel(user: UserAccount | null) {
  return user?.first_name || user?.username || "المستخدم";
}

function slugifyText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-_]/g, "")
    .replace(/-+/g, "-");
}

function normalizeCategoryIds(product: Product | null | undefined) {
  const raw = product?.category;
  if (Array.isArray(raw)) return raw.map(Number).filter(Boolean);
  if (Array.isArray(product?.category_data)) return product?.category_data.map((item) => item.id) ?? [];
  if (typeof raw === "number") return [raw];
  return [];
}

function emptyProductForm(): ProductFormState {
  return {
    name: "",
    slug: "",
    subtitle: "",
    descriptions: "",
    old_price: "",
    new_price: "",
    quantity: "",
    brand: "",
    flag: "",
    product_type: "single",
    sku: "",
    linkVideo: "",
    active: true,
    category: [],
    seo_title: "",
    seo_description: "",
    seo_keywords: "",
    seo_canonical_url: "",
  };
}

function productToForm(product: Product | null): ProductFormState {
  if (!product) return emptyProductForm();
  return {
    name: product.name ?? "",
    slug: product.slug ?? "",
    subtitle: product.subtitle ?? "",
    descriptions: product.descriptions ?? product.description ?? "",
    old_price: product.old_price != null ? String(product.old_price) : "",
    new_price: product.new_price != null ? String(product.new_price) : "",
    quantity: product.quantity != null ? String(product.quantity) : "",
    brand: product.brand != null ? String(product.brand) : "",
    flag: product.flag != null ? String(product.flag) : "",
    product_type: product.product_type ?? "single",
    sku: product.sku ?? "",
    linkVideo: product.linkVideo ?? "",
    active: product.active ?? true,
    category: normalizeCategoryIds(product),
    seo_title: product.seo_title ?? "",
    seo_description: product.seo_description ?? "",
    seo_keywords: product.seo_keywords ?? "",
    seo_canonical_url: product.seo_canonical_url ?? "",
  };
}

function categoryToForm(category: Category | null): CategoryFormState {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    seo_title: category?.seo_title ?? "",
    seo_description: category?.seo_description ?? "",
    seo_keywords: category?.seo_keywords ?? "",
    seo_canonical_url: category?.seo_canonical_url ?? "",
  };
}

function brandToForm(brand: Brand | null): BrandFormState {
  return {
    name: brand?.name ?? "",
    slug: brand?.slug ?? "",
    description: brand?.description ?? "",
    seo_title: brand?.seo_title ?? "",
    seo_description: brand?.seo_description ?? "",
    seo_keywords: brand?.seo_keywords ?? "",
    seo_canonical_url: brand?.seo_canonical_url ?? "",
  };
}

function offerToForm(offer: Offer | null): OfferFormState {
  return {
    title: offer?.title ?? offer?.name ?? "",
    description: offer?.description ?? "",
    products: offer?.products != null ? String(offer.products) : "",
    seo_title: offer?.seo_title ?? "",
    seo_description: offer?.seo_description ?? "",
    seo_keywords: offer?.seo_keywords ?? "",
    seo_canonical_url: offer?.seo_canonical_url ?? "",
  };
}

function bannerToForm(banner: Banner | null): BannerFormState {
  return {
    title: banner?.title ?? "",
    description: banner?.description ?? "",
    link: banner?.link ?? "",
    type: banner?.type ?? "offer",
  };
}

function flagToForm(flag: ProductFlag | null): FlagFormState {
  return { name: flag?.name ?? "" };
}

function branchToForm(branch: Branch | null): BranchFormState {
  return {
    name: branch?.name ?? "",
    active: branch?.active ?? true,
  };
}

function upsertById<T extends { id: number }>(items: T[], item: T) {
  const existing = items.some((entry) => entry.id === item.id);
  return existing ? items.map((entry) => (entry.id === item.id ? item : entry)) : [item, ...items];
}

function GooglePreview({
  title,
  description,
  slug,
}: {
  title: string;
  description: string;
  slug: string;
}) {
  const fallbackTitle = title || "عنوان الصفحة سيظهر هنا";
  const fallbackDescription = description || "الوصف التعريفي سيظهر هنا بشكل مشابه لعرض نتائج البحث في جوجل.";
  const fallbackSlug = slug || "products/example-product";

  return (
    <div className="rounded-[24px] border border-[#dfeaf4] bg-white p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-black text-[#102231]">
        <Search className="h-4 w-4 text-[#2d78c8]" />
        معاينة الظهور في جوجل
      </div>
      <div className="rounded-[20px] border border-[#e4edf5] bg-[#fbfdff] p-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f0ff] text-[#2d78c8]">
            <Globe className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-xs font-bold text-[#617386]">wasel-store.sa</div>
            <div className="truncate text-[11px] text-[#8ea0b1]">https://wasel-store.sa/{fallbackSlug}</div>
          </div>
        </div>
        <div className="text-lg font-black leading-8 text-[#1a0dab]">{fallbackTitle}</div>
        <p className="mt-2 text-sm leading-7 text-[#52667b]">{fallbackDescription}</p>
      </div>
    </div>
  );
}

function ProductEditor({
  mode,
  form,
  product,
  imageFile,
  categories,
  brands,
  flags,
  featured,
  saving,
  onChange,
  onImageChange,
  onEditImage,
  onSave,
  onPreview,
}: {
  mode: "create" | "edit";
  form: ProductFormState;
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  flags: ProductFlag[];
  featured: FeaturedProduct[];
  saving: boolean;
  onChange: <K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) => void;
  onImageChange: (file: File | null) => void;
  onEditImage: () => void;
  imageFile: File | null;
  onSave: () => Promise<void>;
  onPreview: () => void;
}) {
  const previewTitle = form.seo_title || form.name;
  const previewDescription = form.seo_description || form.subtitle || form.descriptions;
  const previewSlug = form.slug || slugifyText(form.name);
  const featuredRecord = featured.find((item) => item.product === product?.id);

  return (
    <div className="grid gap-5">
      <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
        <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <span className="eyebrow mb-3">إدارة المنتجات</span>
            <h2 className="text-[1.8rem] font-black text-[#102231]">
              {mode === "create" ? "إضافة منتج جديد" : form.name || "تحرير المنتج"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-[#6c7f92]">
              نموذج كامل للمنتج يشمل الظهور، بيانات المتجر، وحقول SEO مع معاينة مباشرة لنتيجة البحث.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="button" className="btn btn-secondary" onClick={onPreview} disabled={!product?.slug && mode === "edit"}>
              <Eye className="h-4 w-4" />
              معاينة
            </button>
            <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ المنتج"}
            </button>
          </div>
        </div>

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1.55fr),380px]">
          <div className="grid gap-5">
            <section className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
              <h3 className="mb-4 text-lg font-black text-[#102231]">المعلومات الأساسية</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-group md:col-span-2">
                  <span className="form-label">اسم المنتج</span>
                  <input className="form-input" value={form.name} onChange={(event) => onChange("name", event.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">السعر القديم</span>
                  <input className="form-input" type="number" value={form.old_price} onChange={(event) => onChange("old_price", event.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">السعر الحالي</span>
                  <input className="form-input" type="number" value={form.new_price} onChange={(event) => onChange("new_price", event.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">الكمية</span>
                  <input className="form-input" type="number" value={form.quantity} onChange={(event) => onChange("quantity", event.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">نوع المنتج</span>
                  <select className="form-select" value={form.product_type} onChange={(event) => onChange("product_type", event.target.value)}>
                    <option value="single">منتج مفرد</option>
                    <option value="bundle">باقة / عرض</option>
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">البراند</span>
                  <select className="form-select" value={form.brand} onChange={(event) => onChange("brand", event.target.value)}>
                    <option value="">بدون براند</option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">الوسم</span>
                  <select className="form-select" value={form.flag} onChange={(event) => onChange("flag", event.target.value)}>
                    <option value="">بدون وسم</option>
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.id}>{flag.name}</option>
                    ))}
                  </select>
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">الوصف المختصر</span>
                  <input className="form-input" value={form.subtitle} onChange={(event) => onChange("subtitle", event.target.value)} />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">الوصف الكامل</span>
                  <textarea className="form-textarea" rows={6} value={form.descriptions} onChange={(event) => onChange("descriptions", event.target.value)} />
                </label>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#e4edf5] bg-[#f3f8fd] p-5">
              <h3 className="mb-4 text-lg font-black text-[#102231]">الظهور والربط</h3>
              <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,1fr),minmax(0,1fr)]">
                <section className="rounded-[20px] border border-[#d7e5f1] bg-white p-4 lg:row-span-2">
                  <h4 className="mb-3 text-sm font-black text-[#102231]">صورة المنتج</h4>
                  <div className="relative min-h-[220px] overflow-hidden rounded-[18px] border border-dashed border-[#c8d9ea] bg-[#f8fbff] mb-4">
                    {imageFile ? (
                      <img src={URL.createObjectURL(imageFile)} alt="preview" className="object-contain p-3 w-full h-full absolute inset-0" />
                    ) : product?.image ? (
                      <Image src={absoluteMediaUrl(product.image)} alt={product.name} fill unoptimized className="object-contain p-3" />
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center text-sm font-bold text-[#8da0b3]">
                        لا توجد صورة محفوظة بعد
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input className="form-input text-xs w-full" type="file" accept="image/*" onChange={(event) => onImageChange(event.target.files?.[0] ?? null)} />
                    <button type="button" onClick={onEditImage} className="btn btn-secondary btn-sm w-full" disabled={!imageFile && !product?.image}>
                      تعديل وضبط الصورة
                    </button>
                  </div>
                </section>

                <label className="form-group">
                  <span className="form-label">الرابط المختصر</span>
                  <input className="form-input bg-white" value={form.slug} onChange={(event) => onChange("slug", event.target.value)} placeholder="يُترك فارغًا ليُولد تلقائيًا" />
                </label>

                <label className="form-group">
                  <span className="form-label">حالة الظهور</span>
                  <select className="form-select bg-white" value={form.active ? "visible" : "hidden"} onChange={(event) => onChange("active", event.target.value === "visible")}>
                    <option value="visible">ظاهر في المتجر</option>
                    <option value="hidden">مخفي مؤقتًا</option>
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">SKU</span>
                  <input className="form-input bg-white" value={form.sku} onChange={(event) => onChange("sku", event.target.value)} />
                </label>

                <label className="form-group">
                  <span className="form-label">رابط الفيديو</span>
                  <input className="form-input bg-white" value={form.linkVideo} onChange={(event) => onChange("linkVideo", event.target.value)} />
                </label>

                <div className="form-group lg:col-span-3">
                  <span className="form-label">الأصناف المرتبطة</span>
                  <div className="flex flex-wrap gap-2 rounded-[20px] border border-[#dfeaf4] bg-white p-3">
                    {categories.map((category) => {
                      const checked = form.category.includes(category.id);
                      return (
                        <label key={category.id} className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${checked ? "border-[#2d78c8] bg-[#eef6ff] text-[#2d78c8]" : "border-[#dfeaf4] bg-[#fbfdff] text-[#617386]"}`}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(event) => {
                              const next = event.target.checked
                                ? [...form.category, category.id]
                                : form.category.filter((item) => item !== category.id);
                              onChange("category", next);
                            }}
                          />
                          {category.name}
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[24px] border border-[#e4edf5] bg-[#f3f8fd] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-black text-[#102231]">محركات البحث SEO</h3>
                {featuredRecord ? (
                  <span className="rounded-full border border-[#cfe0f0] bg-white px-3 py-1 text-xs font-black text-[#2d78c8]">
                    مميز في الرئيسية #{featuredRecord.order ?? 0}
                  </span>
                ) : null}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="form-group">
                  <span className="form-label">SEO Title</span>
                  <input className="form-input bg-white" value={form.seo_title} onChange={(event) => onChange("seo_title", event.target.value)} />
                </label>
                <label className="form-group">
                  <span className="form-label">SEO Keywords</span>
                  <input className="form-input bg-white" value={form.seo_keywords} onChange={(event) => onChange("seo_keywords", event.target.value)} />
                </label>
                <label className="form-group md:col-span-2">
                  <span className="form-label">SEO Description</span>
                  <textarea className="form-textarea bg-white" rows={4} value={form.seo_description} onChange={(event) => onChange("seo_description", event.target.value)} />
                </label>
                <label className="form-group md:col-span-2">
                  <span className="form-label">Canonical URL</span>
                  <input className="form-input bg-white" value={form.seo_canonical_url} onChange={(event) => onChange("seo_canonical_url", event.target.value)} />
                </label>
              </div>
            </section>
          </div>

          <div className="grid gap-5">
            <GooglePreview title={previewTitle} description={previewDescription} slug={previewSlug} />
          </div>
        </div>

        <div className="mt-8 flex justify-end border-t border-[#edf3f8] pt-6">
          <button type="button" className="btn btn-primary" onClick={onSave} disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? "جارٍ الحفظ..." : "حفظ المنتج"}
          </button>
        </div>
      </div>
    </div>
  );
}

function RelatedProductsPanel({
  title,
  products,
  candidateProducts,
  addLabel,
  onAdd,
  onRemove,
}: {
  title: string;
  products: Product[];
  candidateProducts: Product[];
  addLabel: string;
  onAdd: (productId: number) => Promise<void>;
  onRemove: (productId: number) => Promise<void>;
}) {
  const [selectedCandidate, setSelectedCandidate] = useState("");

  return (
    <section className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="text-lg font-black text-[#102231]">{title}</h3>
          <p className="mt-1 text-sm text-[#6c7f92]">يمكنك ربط المنتجات أو إزالتها مباشرة من هنا بدون مغادرة نفس الصفحة.</p>
        </div>
        <div className="flex gap-2">
          <select className="form-select min-w-[220px]" value={selectedCandidate} onChange={(event) => setSelectedCandidate(event.target.value)}>
            <option value="">{addLabel}</option>
            {candidateProducts.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={!selectedCandidate}
            onClick={async () => {
              if (!selectedCandidate) return;
              await onAdd(Number(selectedCandidate));
              setSelectedCandidate("");
            }}
          >
            <Plus className="h-4 w-4" />
            ربط
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {products.length ? products.map((product) => (
          <div key={product.id} className="flex flex-col gap-3 rounded-[20px] border border-[#dfeaf4] bg-white p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden rounded-[16px] border border-[#dfeaf4] bg-[#f7fbff]">
                {product.image ? (
                  <Image src={absoluteMediaUrl(product.image)} alt={product.name} fill unoptimized className="object-contain p-2" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[#8ea0b1]">
                    <Package className="h-4 w-4" />
                  </div>
                )}
              </div>
              <div>
                <div className="font-black text-[#102231]">{product.name}</div>
                <div className="text-sm text-[#6c7f92]">{money(product.new_price ?? product.price ?? 0)}</div>
              </div>
            </div>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => onRemove(product.id)}>
              <Trash2 className="h-4 w-4" />
              إزالة
            </button>
          </div>
        )) : (
          <div className="rounded-[20px] border border-dashed border-[#d6e3ef] p-5 text-center text-sm font-bold text-[#8ca0b3]">
            لا توجد منتجات مرتبطة بهذا العنصر بعد.
          </div>
        )}
      </div>
    </section>
  );
}

function ReadonlyPanel({
  title,
  description,
  fields,
}: {
  title: string;
  description: string;
  fields: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
      <div className="mb-6 border-b border-[#edf3f8] pb-5">
        <span className="eyebrow mb-3">لوحة الإدارة</span>
        <h2 className="text-[1.8rem] font-black text-[#102231]">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-[#6c7f92]">{description}</p>
      </div>
      <div className="grid gap-3">
        {fields.map((field) => (
          <div key={field.label} className="flex items-center justify-between rounded-[18px] border border-[#e4edf5] bg-[#fbfdff] px-4 py-3">
            <span className="text-sm font-bold text-[#708395]">{field.label}</span>
            <strong className="text-sm font-black text-[#102231]">{field.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function CustomerDashboard({
  profile,
  orders,
  onLogout,
}: {
  profile: UserAccount | null;
  orders: Order[];
  onLogout: () => Promise<void>;
}) {
  const paid = orders.filter((order) => order.is_paid).length;
  const pending = orders.filter((order) => !order.is_paid).length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

  return (
    <section className="dashboard-font dashboard-shell" dir="rtl">
      <div className="dash-header-card">
        <div className="dash-user-info">
          <div className="dash-avatar">
            {(profile?.first_name?.[0] || profile?.username?.[0] || "و").toUpperCase()}
          </div>
          <div>
            <h1 className="dash-title">مرحبًا، {primaryLabel(profile)}</h1>
            <p className="dash-subtitle">{profile?.email} · حساب عميل</p>
          </div>
        </div>
        <div className="dash-actions">
          <button className="dash-btn-logout" onClick={onLogout}>تسجيل الخروج</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-icon">طلب</div><div><div className="stat-value">{orders.length}</div><div className="stat-label">إجمالي الطلبات</div></div></div>
        <div className="stat-card"><div className="stat-icon">دفع</div><div><div className="stat-value">{paid}</div><div className="stat-label">طلبات مدفوعة</div></div></div>
        <div className="stat-card"><div className="stat-icon">قيد</div><div><div className="stat-value">{pending}</div><div className="stat-label">قيد المعالجة</div></div></div>
        <div className="stat-card accent"><div className="stat-icon">ر.س</div><div><div className="stat-value">{money(totalSpent)}</div><div className="stat-label">إجمالي المشتريات</div></div></div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2>سجل الطلبات</h2>
          <Link href="/products">طلب جديد</Link>
        </div>
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">∅</div>
            <h3>لا توجد طلبات سابقة</h3>
            <p>ابدأ التسوق الآن وستظهر طلباتك هنا بشكل منظم وواضح.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>التاريخ</th>
                  <th>عدد العناصر</th>
                  <th>المبلغ</th>
                  <th>الحالة</th>
                  <th>الدفع</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id-tag">#{order.id}</span></td>
                    <td>{new Date(order.created_at).toLocaleDateString("ar-SA")}</td>
                    <td>{order.items?.length ?? 0}</td>
                    <td>{money(order.total_price)}</td>
                    <td>{order.status?.name || "قيد المراجعة"}</td>
                    <td>{order.is_paid ? "مدفوع" : "عند الاستلام"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserAccount | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [flags, setFlags] = useState<ProductFlag[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKey>("products");
  const [mode, setMode] = useState<"create" | "edit">("edit");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm());
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(categoryToForm(null));
  const [brandForm, setBrandForm] = useState<BrandFormState>(brandToForm(null));
  const [offerForm, setOfferForm] = useState<OfferFormState>(offerToForm(null));
  const [bannerForm, setBannerForm] = useState<BannerFormState>(bannerToForm(null));
  const [flagForm, setFlagForm] = useState<FlagFormState>(flagToForm(null));
  const [branchForm, setBranchForm] = useState<BranchFormState>(branchToForm(null));
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null);
  const [brandImageFile, setBrandImageFile] = useState<File | null>(null);
  const [offerImageFile, setOfferImageFile] = useState<File | null>(null);
  const [bannerImageFile, setBannerImageFile] = useState<File | null>(null);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    const init = async () => {
      try {
        const profileResponse = await getProfile();
        if (!profileResponse) {
          router.replace("/login");
          return;
        }

        setProfile(profileResponse);

        if (profileResponse.is_staff) {
          const [
            productItems,
            categoryItems,
            brandItems,
            offerItems,
            bannerItems,
            orderItems,
            branchItems,
            userItems,
            customerItems,
            flagItems,
            featuredItems,
          ] = await Promise.all([
            getProducts({ ordering: "-create_at" }),
            getCategories(),
            getBrands(),
            getOffers(),
            getBanners(),
            authFetchList<Order>("/orders/"),
            authFetchList<Branch>("/branches/"),
            authFetchList<UserAccount>("/users/"),
            authFetchList<Customer>("/customers/"),
            authFetchList<ProductFlag>("/flags/"),
            authFetchList<FeaturedProduct>("/featured-products/"),
          ]);

          setProducts(productItems);
          setCategories(categoryItems);
          setBrands(brandItems);
          setOffers(offerItems);
          setBanners(bannerItems);
          setOrders(orderItems);
          setBranches(branchItems);
          setUsers(userItems);
          setCustomers(customerItems);
          setFlags(flagItems);
          setFeaturedProducts(featuredItems);
        } else {
          setOrders(await getMyOrders());
        }
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  const primaryStats = useMemo(() => {
    if (!profile?.is_staff) return [];
    return [
      { label: "المنتجات", value: String(products.length) },
      { label: "العروض", value: String(offers.length) },
      { label: "الطلبات", value: String(orders.length) },
      { label: "المستخدمون", value: String(users.length || customers.length) },
    ];
  }, [profile?.is_staff, products.length, offers.length, orders.length, users.length, customers.length]);

  const sidebarItems = useMemo<SidebarItem[]>(() => {
    switch (activeModule) {
      case "products":
        return products.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: item.brand_data?.name || item.subtitle || "منتج",
          image: item.image || null,
          badge: item.active ? "ظاهر" : "مخفي",
        }));
      case "categories":
        return categories.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: item.slug,
          image: item.image || null,
        }));
      case "offers":
        return offers.map((item) => ({
          id: item.id,
          title: item.title || item.name || `عرض #${item.id}`,
          subtitle: item.description || "عرض ترويجي",
          image: item.image || null,
        }));
      case "banners":
        return banners.map((item) => ({
          id: item.id,
          title: item.title || `بانر #${item.id}`,
          subtitle: item.type || "بانر",
          image: item.image || null,
        }));
      case "brands":
        return brands.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: item.products_count ? `${item.products_count} منتج` : "علامة تجارية",
          image: item.logo || item.image || null,
        }));
      case "flags":
        return flags.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: "وسم ترويجي",
        }));
      case "orders":
        return orders.map((item) => ({
          id: item.id,
          title: `طلب #${item.id}`,
          subtitle: item.shipping_full_name,
          badge: item.status?.name || (item.is_paid ? "مدفوع" : "عند الاستلام"),
        }));
      case "branches":
        return branches.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: item.active ? "نشط" : "مخفي",
        }));
      case "users":
        return users.map((item) => ({
          id: item.id,
          title: item.first_name || item.username,
          subtitle: item.email || item.username,
          badge: item.is_staff ? "إداري" : "عميل",
        }));
      default:
        return [];
    }
  }, [activeModule, banners, brands, branches, categories, flags, offers, orders, products, users]);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return sidebarItems;
    const query = search.trim().toLowerCase();
    return sidebarItems.filter((item) => `${item.title} ${item.subtitle || ""}`.toLowerCase().includes(query));
  }, [search, sidebarItems]);

  useEffect(() => {
    if (mode === "create") {
      setSelectedId(null);
      return;
    }

    if (!filteredItems.length) {
      setSelectedId(null);
      return;
    }

    if (!filteredItems.some((item) => item.id === selectedId)) {
      setSelectedId(filteredItems[0].id);
    }
  }, [filteredItems, mode, selectedId]);

  const currentProduct = products.find((item) => item.id === selectedId) || null;
  const currentCategory = categories.find((item) => item.id === selectedId) || null;
  const currentBrand = brands.find((item) => item.id === selectedId) || null;
  const currentOffer = offers.find((item) => item.id === selectedId) || null;
  const currentBanner = banners.find((item) => item.id === selectedId) || null;
  const currentFlag = flags.find((item) => item.id === selectedId) || null;
  const currentBranch = branches.find((item) => item.id === selectedId) || null;
  const currentOrder = orders.find((item) => item.id === selectedId) || null;
  const currentUser = users.find((item) => item.id === selectedId) || null;
  const currentBranchUsers = currentBranch
    ? customers.filter((item) => Number(item.branch) === currentBranch.id)
    : [];
  const currentBranchOrders = currentBranch
    ? orders.filter((item) => (item.branch || "").trim() === currentBranch.name.trim())
    : [];

  useEffect(() => {
    if (activeModule === "products") {
      setProductForm(productToForm(mode === "edit" ? currentProduct : null));
      setProductImageFile(null);
    }
  }, [activeModule, mode, currentProduct]);

  useEffect(() => {
    if (activeModule === "categories") {
      setCategoryForm(categoryToForm(mode === "edit" ? currentCategory : null));
      setCategoryImageFile(null);
    }
  }, [activeModule, mode, currentCategory]);

  useEffect(() => {
    if (activeModule === "brands") {
      setBrandForm(brandToForm(mode === "edit" ? currentBrand : null));
      setBrandImageFile(null);
    }
  }, [activeModule, mode, currentBrand]);

  useEffect(() => {
    if (activeModule === "offers") {
      setOfferForm(offerToForm(mode === "edit" ? currentOffer : null));
      setOfferImageFile(null);
    }
  }, [activeModule, mode, currentOffer]);

  useEffect(() => {
    if (activeModule === "banners") {
      setBannerForm(bannerToForm(mode === "edit" ? currentBanner : null));
      setBannerImageFile(null);
    }
  }, [activeModule, mode, currentBanner]);

  useEffect(() => {
    if (activeModule === "flags") setFlagForm(flagToForm(mode === "edit" ? currentFlag : null));
  }, [activeModule, mode, currentFlag]);

  useEffect(() => {
    if (activeModule === "branches") setBranchForm(branchToForm(mode === "edit" ? currentBranch : null));
  }, [activeModule, mode, currentBranch]);

  function resetMessages() {
    setNotice(null);
    setError(null);
  }

  function setActiveModuleState(module: ModuleKey) {
    resetMessages();
    setActiveModule(module);
    setMode("edit");
    setSearch("");
  }

  function startCreate() {
    resetMessages();
    setMode("create");
    setSelectedId(null);
  }

  function selectEntity(id: number) {
    resetMessages();
    setMode("edit");
    setSelectedId(id);
  }

  const categoryProducts = useMemo(() => {
    if (!currentCategory) return [];
    return products.filter((product) => normalizeCategoryIds(product).includes(currentCategory.id));
  }, [currentCategory, products]);

  const brandProducts = useMemo(() => {
    if (!currentBrand) return [];
    return products.filter((product) => Number(product.brand) === currentBrand.id);
  }, [currentBrand, products]);

  const flagProducts = useMemo(() => {
    if (!currentFlag) return [];
    return products.filter((product) => Number(product.flag) === currentFlag.id);
  }, [currentFlag, products]);

  const offerProducts = useMemo(() => {
    if (!currentOffer?.products) return [];
    return products.filter((product) => product.id === currentOffer.products);
  }, [currentOffer, products]);

  async function updateProductRelation(productId: number, changes: Partial<Product>) {
    const target = products.find((item) => item.id === productId);
    if (!target?.slug) return;
    const updated = await authRequest<Product>(`/products/${target.slug}/`, {
      method: "PATCH",
      body: changes,
    });
    setProducts((current) => upsertById(current, updated));
  }

  async function handleAssignCategory(productId: number, categoryId: number, add: boolean) {
    const target = products.find((item) => item.id === productId);
    if (!target) return;
    const currentIds = normalizeCategoryIds(target);
    const nextIds = add ? Array.from(new Set([...currentIds, categoryId])) : currentIds.filter((item) => item !== categoryId);
    await updateProductRelation(productId, { category: nextIds });
    setNotice(add ? "تم ربط المنتج بالصنف." : "تمت إزالة المنتج من الصنف.");
  }

  async function handleAssignBrand(productId: number, brandId: number | null) {
    await updateProductRelation(productId, { brand: brandId });
    setNotice(brandId ? "تم تحديث البراند للمنتج." : "تمت إزالة البراند من المنتج.");
  }

  async function handleAssignFlag(productId: number, flagId: number | null) {
    await updateProductRelation(productId, { flag: flagId });
    setNotice(flagId ? "تم ربط المنتج بالوسم." : "تمت إزالة الوسم من المنتج.");
  }

  async function saveProduct() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = new FormData();
      payload.append("name", productForm.name);
      payload.append("slug", productForm.slug || slugifyText(productForm.name));
      payload.append("subtitle", productForm.subtitle);
      payload.append("descriptions", productForm.descriptions);
      payload.append("old_price", String(Number(productForm.old_price || 0)));
      payload.append("new_price", String(Number(productForm.new_price || 0)));
      payload.append("quantity", String(Number(productForm.quantity || 0)));
      if (productForm.brand) payload.append("brand", productForm.brand);
      if (productForm.flag) payload.append("flag", productForm.flag);
      payload.append("product_type", productForm.product_type);
      payload.append("sku", productForm.sku);
      payload.append("linkVideo", productForm.linkVideo);
      payload.append("active", String(productForm.active));
      
      productForm.category.forEach((catId) => payload.append("category", String(catId)));
      
      payload.append("seo_title", productForm.seo_title);
      payload.append("seo_description", productForm.seo_description);
      payload.append("seo_keywords", productForm.seo_keywords);
      payload.append("seo_canonical_url", productForm.seo_canonical_url);

      if (productImageFile) payload.append("image", productImageFile);

      const saved = mode === "create"
        ? await authRequest<Product>("/products/", { method: "POST", body: payload })
        : await authRequest<Product>(`/products/${currentProduct?.slug}/`, { method: "PATCH", body: payload });

      setProducts((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة المنتج بنجاح." : "تم حفظ تعديلات المنتج.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ المنتج.");
    } finally {
      setSaving(false);
    }
  }

  async function saveCategory() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "create" && !categoryImageFile) {
        throw new Error("صورة الصنف مطلوبة عند الإضافة.");
      }
      const payload = new FormData();
      payload.append("name", categoryForm.name);
      payload.append("slug", categoryForm.slug || slugifyText(categoryForm.name));
      payload.append("seo_title", categoryForm.seo_title);
      payload.append("seo_description", categoryForm.seo_description);
      payload.append("seo_keywords", categoryForm.seo_keywords);
      payload.append("seo_canonical_url", categoryForm.seo_canonical_url);
      if (categoryImageFile) payload.append("image", categoryImageFile);
      const saved = mode === "create"
        ? await authRequest<Category>("/categories/", { method: "POST", body: payload })
        : await authRequest<Category>(`/categories/${currentCategory?.slug}/`, { method: "PATCH", body: payload });
      setCategories((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة الصنف." : "تم تحديث الصنف.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الصنف.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBrand() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "create" && !brandImageFile) {
        throw new Error("صورة البراند مطلوبة عند الإضافة.");
      }
      const payload = new FormData();
      payload.append("name", brandForm.name);
      payload.append("slug", brandForm.slug || slugifyText(brandForm.name));
      payload.append("description", brandForm.description);
      payload.append("seo_title", brandForm.seo_title);
      payload.append("seo_description", brandForm.seo_description);
      payload.append("seo_keywords", brandForm.seo_keywords);
      payload.append("seo_canonical_url", brandForm.seo_canonical_url);
      if (brandImageFile) payload.append("image", brandImageFile);
      const saved = mode === "create"
        ? await authRequest<Brand>("/brands/", { method: "POST", body: payload })
        : await authRequest<Brand>(`/brands/${currentBrand?.slug}/`, { method: "PATCH", body: payload });
      setBrands((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة البراند." : "تم تحديث البراند.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ البراند.");
    } finally {
      setSaving(false);
    }
  }

  async function saveOffer() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "create" && !offerImageFile) {
        throw new Error("صورة العرض مطلوبة عند الإضافة.");
      }
      const payload = new FormData();
      payload.append("title", offerForm.title);
      payload.append("description", offerForm.description);
      payload.append("products", offerForm.products ? String(Number(offerForm.products)) : "");
      payload.append("seo_title", offerForm.seo_title);
      payload.append("seo_description", offerForm.seo_description);
      payload.append("seo_keywords", offerForm.seo_keywords);
      payload.append("seo_canonical_url", offerForm.seo_canonical_url);
      if (offerImageFile) payload.append("image", offerImageFile);
      const saved = mode === "create"
        ? await authRequest<Offer>("/offers/", { method: "POST", body: payload })
        : await authRequest<Offer>(`/offers/${currentOffer?.id}/`, { method: "PATCH", body: payload });
      setOffers((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة العرض." : "تم تحديث العرض.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ العرض.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBanner() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      if (mode === "create" && !bannerImageFile) {
        throw new Error("صورة البنر مطلوبة عند الإضافة.");
      }
      const payload = new FormData();
      payload.append("title", bannerForm.title);
      payload.append("description", bannerForm.description);
      payload.append("link", bannerForm.link);
      payload.append("type", bannerForm.type);
      if (bannerImageFile) payload.append("image", bannerImageFile);
      const saved = mode === "create"
        ? await authRequest<Banner>("/banners/", { method: "POST", body: payload })
        : await authRequest<Banner>(`/banners/${currentBanner?.id}/`, { method: "PATCH", body: payload });
      setBanners((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة البنر." : "تم تحديث البنر.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ البنر.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFlag() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = { name: flagForm.name };
      const saved = mode === "create"
        ? await authRequest<ProductFlag>("/flags/", { method: "POST", body: payload })
        : await authRequest<ProductFlag>(`/flags/${currentFlag?.id}/`, { method: "PATCH", body: payload });
      setFlags((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة الوسم." : "تم تحديث الوسم.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الوسم.");
    } finally {
      setSaving(false);
    }
  }

  async function saveBranch() {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const payload = { name: branchForm.name, active: branchForm.active };
      const saved = mode === "create"
        ? await authRequest<Branch>("/branches/", { method: "POST", body: payload })
        : await authRequest<Branch>(`/branches/${currentBranch?.id}/`, { method: "PATCH", body: payload });
      setBranches((current) => upsertById(current, saved));
      setMode("edit");
      setSelectedId(saved.id);
      setNotice(mode === "create" ? "تمت إضافة الفرع." : "تم تحديث الفرع.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "تعذر حفظ الفرع.");
    } finally {
      setSaving(false);
    }
  }

  function openProductPreview() {
    const slug = currentProduct?.slug || productForm.slug || slugifyText(productForm.name);
    if (!slug) return;
    window.open(`/products/${slug}`, "_blank", "noopener,noreferrer");
  }

  const availableCategoryProducts = useMemo(() => {
    if (!currentCategory) return [];
    return products.filter((product) => !normalizeCategoryIds(product).includes(currentCategory.id));
  }, [currentCategory, products]);

  const availableBrandProducts = useMemo(() => {
    if (!currentBrand) return [];
    return products.filter((product) => Number(product.brand) !== currentBrand.id);
  }, [currentBrand, products]);

  const availableFlagProducts = useMemo(() => {
    if (!currentFlag) return [];
    return products.filter((product) => Number(product.flag) !== currentFlag.id);
  }, [currentFlag, products]);

  const availableOfferProducts = useMemo(() => {
    if (!currentOffer?.products) return products;
    return products.filter((product) => product.id !== currentOffer.products);
  }, [currentOffer, products]);

  function renderMainPanel() {
    if (activeModule === "products") {
      return (
        <ProductEditor
          mode={mode}
          form={productForm}
          product={currentProduct}
          imageFile={productImageFile}
          categories={categories}
          brands={brands}
          flags={flags}
          featured={featuredProducts}
          saving={saving}
          onChange={(key, value) => setProductForm((current) => ({ ...current, [key]: value }))}
          onImageChange={(file) => {
            if (file) {
              setCropSourceUrl(URL.createObjectURL(file));
            } else {
              setProductImageFile(null);
            }
          }}
          onEditImage={() => {
            if (productImageFile) {
              setCropSourceUrl(URL.createObjectURL(productImageFile));
            } else if (currentProduct?.image) {
              setCropSourceUrl(absoluteMediaUrl(currentProduct.image));
            }
          }}
          onSave={saveProduct}
          onPreview={openProductPreview}
        />
      );
    }

    if (activeModule === "categories") {
      return (
        <div className="grid gap-5">
          <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
            <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <span className="eyebrow mb-3">إدارة الأصناف</span>
                <h2 className="text-[1.8rem] font-black text-[#102231]">{mode === "create" ? "إضافة صنف" : categoryForm.name || "تحرير الصنف"}</h2>
                <p className="mt-2 text-sm leading-7 text-[#6c7f92]">عند اختيار صنف ستظهر هنا منتجاته مباشرة ويمكنك إضافة أو إزالة المنتجات منه بدون تحديث كامل للشاشة.</p>
              </div>
              <button type="button" className="btn btn-primary" onClick={saveCategory} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "جارٍ الحفظ..." : "حفظ الصنف"}
              </button>
            </div>
            <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr),360px]">
              <section className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
                <div className="grid gap-4">
                  <label className="form-group">
                    <span className="form-label">اسم الصنف</span>
                    <input className="form-input" value={categoryForm.name} onChange={(event) => setCategoryForm((current) => ({ ...current, name: event.target.value }))} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">صورة الصنف</span>
                    <input className="form-input" type="file" accept="image/*" onChange={(event) => setCategoryImageFile(event.target.files?.[0] ?? null)} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">الرابط</span>
                    <input className="form-input" value={categoryForm.slug} onChange={(event) => setCategoryForm((current) => ({ ...current, slug: event.target.value }))} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">SEO Title</span>
                    <input className="form-input" value={categoryForm.seo_title} onChange={(event) => setCategoryForm((current) => ({ ...current, seo_title: event.target.value }))} />
                  </label>
                  <label className="form-group">
                    <span className="form-label">SEO Description</span>
                    <textarea className="form-textarea" rows={4} value={categoryForm.seo_description} onChange={(event) => setCategoryForm((current) => ({ ...current, seo_description: event.target.value }))} />
                  </label>
                </div>
              </section>
              <GooglePreview title={categoryForm.seo_title || categoryForm.name} description={categoryForm.seo_description} slug={categoryForm.slug || slugifyText(categoryForm.name)} />
            </div>
          </div>

          {mode === "edit" && currentCategory ? (
            <RelatedProductsPanel
              title={`منتجات الصنف: ${currentCategory.name}`}
              products={categoryProducts}
              candidateProducts={availableCategoryProducts}
              addLabel="اختر منتجًا لربطه بهذا الصنف"
              onAdd={(productId) => handleAssignCategory(productId, currentCategory.id, true)}
              onRemove={(productId) => handleAssignCategory(productId, currentCategory.id, false)}
            />
          ) : null}
        </div>
      );
    }

    if (activeModule === "brands") {
      return (
        <div className="grid gap-5">
          <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
            <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <span className="eyebrow mb-3">إدارة البراندات</span>
                <h2 className="text-[1.8rem] font-black text-[#102231]">{mode === "create" ? "إضافة براند" : brandForm.name || "تحرير البراند"}</h2>
              </div>
              <button type="button" className="btn btn-primary" onClick={saveBrand} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "جارٍ الحفظ..." : "حفظ البراند"}
              </button>
            </div>
            <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr),360px]">
              <section className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
                <div className="grid gap-4">
                  <label className="form-group"><span className="form-label">اسم البراند</span><input className="form-input" value={brandForm.name} onChange={(event) => setBrandForm((current) => ({ ...current, name: event.target.value }))} /></label>
                  <label className="form-group"><span className="form-label">صورة البراند</span><input className="form-input" type="file" accept="image/*" onChange={(event) => setBrandImageFile(event.target.files?.[0] ?? null)} /></label>
                  <label className="form-group"><span className="form-label">الرابط</span><input className="form-input" value={brandForm.slug} onChange={(event) => setBrandForm((current) => ({ ...current, slug: event.target.value }))} /></label>
                  <label className="form-group"><span className="form-label">الوصف</span><textarea className="form-textarea" rows={4} value={brandForm.description} onChange={(event) => setBrandForm((current) => ({ ...current, description: event.target.value }))} /></label>
                  <label className="form-group"><span className="form-label">SEO Title</span><input className="form-input" value={brandForm.seo_title} onChange={(event) => setBrandForm((current) => ({ ...current, seo_title: event.target.value }))} /></label>
                </div>
              </section>
              <GooglePreview title={brandForm.seo_title || brandForm.name} description={brandForm.seo_description || brandForm.description} slug={brandForm.slug || slugifyText(brandForm.name)} />
            </div>
          </div>

          {mode === "edit" && currentBrand ? (
            <RelatedProductsPanel
              title={`منتجات البراند: ${currentBrand.name}`}
              products={brandProducts}
              candidateProducts={availableBrandProducts}
              addLabel="اختر منتجًا لربطه بهذا البراند"
              onAdd={(productId) => handleAssignBrand(productId, currentBrand.id)}
              onRemove={(productId) => handleAssignBrand(productId, null)}
            />
          ) : null}
        </div>
      );
    }

    if (activeModule === "flags") {
      return (
        <div className="grid gap-5">
          <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
            <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <span className="eyebrow mb-3">إدارة الأوسمة</span>
                <h2 className="text-[1.8rem] font-black text-[#102231]">{mode === "create" ? "إضافة وسم" : flagForm.name || "تحرير الوسم"}</h2>
              </div>
              <button type="button" className="btn btn-primary" onClick={saveFlag} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "جارٍ الحفظ..." : "حفظ الوسم"}
              </button>
            </div>
            <section className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
              <label className="form-group">
                <span className="form-label">اسم الوسم</span>
                <input className="form-input" value={flagForm.name} onChange={(event) => setFlagForm({ name: event.target.value })} />
              </label>
            </section>
          </div>

          {mode === "edit" && currentFlag ? (
            <RelatedProductsPanel
              title={`منتجات الوسم: ${currentFlag.name}`}
              products={flagProducts}
              candidateProducts={availableFlagProducts}
              addLabel="اختر منتجًا لربطه بهذا الوسم"
              onAdd={(productId) => handleAssignFlag(productId, currentFlag.id)}
              onRemove={(productId) => handleAssignFlag(productId, null)}
            />
          ) : null}
        </div>
      );
    }

    if (activeModule === "offers") {
      return (
        <div className="grid gap-5">
          <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
            <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <span className="eyebrow mb-3">إدارة العروض</span>
                <h2 className="text-[1.8rem] font-black text-[#102231]">{mode === "create" ? "إضافة عرض" : offerForm.title || "تحرير العرض"}</h2>
              </div>
              <button type="button" className="btn btn-primary" onClick={saveOffer} disabled={saving}>
                <Save className="h-4 w-4" />
                {saving ? "جارٍ الحفظ..." : "حفظ العرض"}
              </button>
            </div>
            <div className="grid gap-4">
              <label className="form-group"><span className="form-label">عنوان العرض</span><input className="form-input" value={offerForm.title} onChange={(event) => setOfferForm((current) => ({ ...current, title: event.target.value }))} /></label>
              <label className="form-group"><span className="form-label">صورة العرض</span><input className="form-input" type="file" accept="image/*" onChange={(event) => setOfferImageFile(event.target.files?.[0] ?? null)} /></label>
              <label className="form-group"><span className="form-label">الوصف</span><textarea className="form-textarea" rows={4} value={offerForm.description} onChange={(event) => setOfferForm((current) => ({ ...current, description: event.target.value }))} /></label>
              <label className="form-group"><span className="form-label">SEO Title</span><input className="form-input" value={offerForm.seo_title} onChange={(event) => setOfferForm((current) => ({ ...current, seo_title: event.target.value }))} /></label>
            </div>
          </div>

          {mode === "edit" && currentOffer ? (
            <RelatedProductsPanel
              title={`المنتج المرتبط بالعرض: ${currentOffer.title || currentOffer.name || `#${currentOffer.id}`}`}
              products={offerProducts}
              candidateProducts={availableOfferProducts}
              addLabel="اختر منتجًا لهذا العرض"
              onAdd={async (productId) => {
                const saved = await authRequest<Offer>(`/offers/${currentOffer.id}/`, { method: "PATCH", body: { products: productId } });
                setOffers((current) => upsertById(current, saved));
                setNotice("تم ربط العرض بالمنتج.");
              }}
              onRemove={async () => {
                const saved = await authRequest<Offer>(`/offers/${currentOffer.id}/`, { method: "PATCH", body: { products: null } });
                setOffers((current) => upsertById(current, saved));
                setNotice("تمت إزالة المنتج من العرض.");
              }}
            />
          ) : null}
        </div>
      );
    }

    if (activeModule === "banners") {
      return (
        <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <span className="eyebrow mb-3">إدارة البنرات</span>
              <h2 className="text-[1.8rem] font-black text-[#102231]">{mode === "create" ? "إضافة بنر" : bannerForm.title || "تحرير البنر"}</h2>
              <p className="mt-2 text-sm leading-7 text-[#6c7f92]">هذا القسم يتحرك داخل نفس مساحة العمل بدون تبديل صفحة كاملة، ويمكنك تحديث الرابط والنوع مباشرة.</p>
            </div>
            <button type="button" className="btn btn-primary" onClick={saveBanner} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ البنر"}
            </button>
          </div>
          <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr),360px]">
            <section className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
              <div className="grid gap-4">
                <label className="form-group"><span className="form-label">العنوان</span><input className="form-input" value={bannerForm.title} onChange={(event) => setBannerForm((current) => ({ ...current, title: event.target.value }))} /></label>
                <label className="form-group"><span className="form-label">صورة البنر</span><input className="form-input" type="file" accept="image/*" onChange={(event) => setBannerImageFile(event.target.files?.[0] ?? null)} /></label>
                <label className="form-group"><span className="form-label">الوصف</span><textarea className="form-textarea" rows={4} value={bannerForm.description} onChange={(event) => setBannerForm((current) => ({ ...current, description: event.target.value }))} /></label>
                <label className="form-group"><span className="form-label">الرابط</span><input className="form-input" value={bannerForm.link} onChange={(event) => setBannerForm((current) => ({ ...current, link: event.target.value }))} /></label>
                <label className="form-group"><span className="form-label">النوع</span><select className="form-select" value={bannerForm.type} onChange={(event) => setBannerForm((current) => ({ ...current, type: event.target.value }))}><option value="offer">عرض</option><option value="bundle">باقة</option></select></label>
              </div>
            </section>
            <div className="rounded-[24px] border border-[#e4edf5] bg-[#fbfdff] p-5">
              <h3 className="mb-4 text-lg font-black text-[#102231]">معاينة الرابط</h3>
              <div className="rounded-[20px] border border-[#dfeaf4] bg-white p-4 text-sm leading-7 text-[#617386]">
                <div className="font-black text-[#102231]">{bannerForm.title || "عنوان البنر"}</div>
                <p className="mt-2">{bannerForm.description || "وصف البنر سيظهر هنا."}</p>
                <div className="mt-3 rounded-[16px] bg-[#eef6ff] px-3 py-2 font-bold text-[#2d78c8]">
                  {bannerForm.link || "لم يتم تحديد رابط بعد"}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeModule === "branches") {
      return (
        <div className="rounded-[30px] border border-[#dfeaf4] bg-white p-6 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
          <div className="mb-6 flex flex-col gap-4 border-b border-[#edf3f8] pb-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <span className="eyebrow mb-3">إدارة الفروع</span>
              <h2 className="text-[1.8rem] font-black text-[#102231]">{mode === "create" ? "إضافة فرع" : branchForm.name || "تحرير الفرع"}</h2>
            </div>
            <button type="button" className="btn btn-primary" onClick={saveBranch} disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? "جارٍ الحفظ..." : "حفظ الفرع"}
            </button>
          </div>
          <div className="grid gap-4">
            <label className="form-group"><span className="form-label">اسم الفرع</span><input className="form-input" value={branchForm.name} onChange={(event) => setBranchForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="form-group"><span className="form-label">الحالة</span><select className="form-select" value={branchForm.active ? "visible" : "hidden"} onChange={(event) => setBranchForm((current) => ({ ...current, active: event.target.value === "visible" }))}><option value="visible">نشط</option><option value="hidden">مخفي</option></select></label>
          </div>
          {currentBranch ? (
            <div className="mt-6 grid gap-4 2xl:grid-cols-2">
              <div className="rounded-[24px] border border-[#dfeaf4] bg-[#f7fbff] p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#e6eef6] pb-3">
                  <div>
                    <h3 className="text-lg font-black text-[#102231]">موظفو الفرع</h3>
                    <p className="mt-1 text-xs font-bold text-[#8396a8]">{currentBranchUsers.length} مستخدم مرتبط</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1f69b1]">{currentBranch.name}</span>
                </div>
                <div className="grid gap-2">
                  {currentBranchUsers.length ? currentBranchUsers.map((customer) => (
                    <div key={customer.id} className="rounded-[18px] border border-[#dce7f2] bg-white px-4 py-3">
                      <div className="text-sm font-black text-[#102231]">{customer.user?.first_name || customer.user?.username || "مستخدم"}</div>
                      <div className="mt-1 text-xs font-bold text-[#7d91a4]">{customer.phone_number || customer.user?.email || "بدون بيانات إضافية"}</div>
                    </div>
                  )) : (
                    <div className="rounded-[18px] border border-dashed border-[#d5e2ee] bg-white px-4 py-5 text-sm font-bold text-[#8aa0b4]">
                      لا يوجد موظفون أو مستخدمون مربوطون بهذا الفرع حتى الآن.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-[#dfeaf4] bg-[#f7fbff] p-5">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#e6eef6] pb-3">
                  <div>
                    <h3 className="text-lg font-black text-[#102231]">طلبات الفرع</h3>
                    <p className="mt-1 text-xs font-bold text-[#8396a8]">{currentBranchOrders.length} طلب مرتبط</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#1f69b1]">تحديث حي</span>
                </div>
                <div className="grid gap-2">
                  {currentBranchOrders.length ? currentBranchOrders.slice(0, 8).map((order) => (
                    <div key={order.id} className="rounded-[18px] border border-[#dce7f2] bg-white px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <strong className="text-sm font-black text-[#102231]">الطلب #{order.id}</strong>
                        <span className="text-xs font-black text-[#2d78c8]">{money(order.total_price)}</span>
                      </div>
                      <div className="mt-1 text-xs font-bold text-[#7d91a4]">{order.shipping_full_name} - {order.shipping_city}</div>
                    </div>
                  )) : (
                    <div className="rounded-[18px] border border-dashed border-[#d5e2ee] bg-white px-4 py-5 text-sm font-bold text-[#8aa0b4]">
                      لا توجد طلبات مربوطة بهذا الفرع حاليًا.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    }

    if (activeModule === "orders" && currentOrder) {
      return (
        <ReadonlyPanel
          title={`الطلب #${currentOrder.id}`}
          description="عرض سريع للطلب الحالي داخل نفس لوحة التحكم."
          fields={[
            { label: "العميل", value: currentOrder.shipping_full_name },
            { label: "الهاتف", value: currentOrder.shipping_phone },
            { label: "المدينة", value: currentOrder.shipping_city },
            { label: "الحالة", value: currentOrder.status?.name || "قيد المراجعة" },
            { label: "الإجمالي", value: money(currentOrder.total_price) },
          ]}
        />
      );
    }

    if (activeModule === "users" && currentUser) {
      return (
        <ReadonlyPanel
          title={currentUser.first_name || currentUser.username}
          description="قسم المستخدمين معروض الآن للمتابعة السريعة، ويمكن تطويره لاحقًا إلى نموذج كامل للتحرير والصلاحيات."
          fields={[
            { label: "اسم المستخدم", value: currentUser.username },
            { label: "البريد", value: currentUser.email || "-" },
            { label: "الدور", value: currentUser.is_staff ? "إداري" : "عميل" },
          ]}
        />
      );
    }

    return (
      <ReadonlyPanel
        title={adminModules.find((item) => item.key === activeModule)?.label || "لوحة الإدارة"}
        description="اختر عنصرًا من القائمة الجانبية لعرض تفاصيله أو بدء الإضافة."
        fields={[
          { label: "العناصر المعروضة", value: String(filteredItems.length) },
          { label: "الوضع الحالي", value: mode === "create" ? "إضافة" : "استعراض" },
          { label: "المستخدم الحالي", value: primaryLabel(profile) },
        ]}
      />
    );
  }

  if (loading) {
    return (
      <section className="dash-loading" dir="rtl">
        <div className="spinner" />
        <p>جارٍ تجهيز بيانات لوحة التحكم...</p>
      </section>
    );
  }

  if (!profile?.is_staff) {
    return <CustomerDashboard profile={profile} orders={orders} onLogout={handleLogout} />;
  }

  return (
    <section className="dashboard-font dashboard-shell" dir="rtl">
      {cropSourceUrl && (
        <ImageCropper
          imageSrc={cropSourceUrl}
          onCropComplete={(croppedFile) => {
            setProductImageFile(croppedFile);
            setCropSourceUrl(null);
          }}
          onCancel={() => setCropSourceUrl(null)}
        />
      )}
      <div className="sticky top-2 z-20 mb-4 rounded-[22px] border border-[#dfeaf4] bg-white/95 px-4 py-3 shadow-[0_1px_8px_rgba(10,34,56,0.02)] backdrop-blur">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-4">
            <div className="dash-avatar">
              {(profile.first_name?.[0] || profile.username?.[0] || "و").toUpperCase()}
            </div>
            <div>
              <span className="eyebrow mb-2">لوحة التحكم</span>
              <h1 className="text-[1.7rem] font-black text-[#102231]">إدارة المتجر</h1>
              <p className="hidden mt-2 text-sm leading-7 text-[#6b7f92]">
                شريط ثابت شبيه بهوية المتجر الرئيسية، مع تنقل داخلي سريع بين المنتجات والأصناف والعروض والبنرات والطلبات.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/" target="_blank" className="btn btn-secondary">
              <ShoppingBag className="h-4 w-4" />
              زيارة المتجر
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <button type="button" className="btn btn-secondary" onClick={() => { setActiveModuleState("products"); startCreate(); }}>
              <PackagePlus className="h-4 w-4" />
              منتج جديد
            </button>
            <button type="button" className="btn btn-primary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      {!!error && (
        <div className="alert alert-error mb-4">
          <span>تنبيه</span>
          {error}
        </div>
      )}

      {!!notice && (
        <div className="mb-4 rounded-[18px] border border-[#cde7d7] bg-[#edf9f1] px-4 py-3 text-sm font-bold text-[#12805c]">
          {notice}
        </div>
      )}

      <div className="mb-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {primaryStats.map((stat) => (
          <div key={stat.label} className="rounded-[18px] border border-[#dfeaf4] bg-white p-4 shadow-[0_1px_6px_rgba(10,34,56,0.015)]">
            <div className="text-sm font-bold text-[#6d8092]">{stat.label}</div>
            <div className="mt-2 text-[1.7rem] font-black text-[#102231]">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
        <aside className="xl:sticky xl:top-[8.8rem] xl:w-[250px] xl:shrink-0">
          <div className="rounded-[24px] border border-[#dfeaf4] bg-white p-4 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
            <div className="border-b border-[#edf3f8] px-2 pb-4">
              <p className="text-xs font-black tracking-[0.24em] text-[#8da0b2]">WASEL ADMIN</p>
              <h2 className="mt-2 text-xl font-black text-[#102231]">موديلات الإدارة</h2>
            </div>
            <nav className="mt-4 grid gap-1">
              {adminModules.map((module) => {
                const Icon = module.icon;
                const active = activeModule === module.key;
                return (
                  <button
                    key={module.key}
                    type="button"
                    onClick={() => setActiveModuleState(module.key)}
                    className={`flex items-center gap-3 rounded-[20px] px-4 py-3 text-right text-sm font-black transition ${
                      active
                        ? "bg-[#102231] text-white shadow-[0_1px_6px_rgba(16,34,49,0.04)]"
                        : "text-[#516577] hover:bg-[#f3f8fc] hover:text-[#102231]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? "text-white" : "text-[#2d78c8]"}`} />
                    <span>{module.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <aside className="xl:sticky xl:top-[8.8rem] xl:w-[330px] xl:shrink-0">
          <div className="rounded-[24px] border border-[#dfeaf4] bg-white p-4 shadow-[0_2px_10px_rgba(10,34,56,0.015)]">
            <div className="flex items-center justify-between gap-3 border-b border-[#edf3f8] px-2 pb-4">
              <div>
                <h2 className="text-lg font-black text-[#102231]">{adminModules.find((item) => item.key === activeModule)?.label}</h2>
                <p className="mt-1 text-xs font-bold text-[#8ca0b3]">{filteredItems.length} عنصر</p>
              </div>
              <button type="button" onClick={startCreate} className="btn btn-secondary btn-sm">
                <Plus className="h-4 w-4" />
                إضافة
              </button>
            </div>

            <div className="mt-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="form-input"
                placeholder={`ابحث في ${adminModules.find((item) => item.key === activeModule)?.label || ""}`}
              />
            </div>

            <div className="mt-4 grid max-h-[72vh] gap-2 overflow-y-auto pr-1">
              {filteredItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectEntity(item.id)}
                  className={`flex items-center gap-3 rounded-[20px] border px-3 py-3 text-right transition ${
                    mode === "edit" && selectedId === item.id
                      ? "border-[#bfd7ee] bg-[#eef6ff]"
                      : "border-transparent bg-[#fbfdff] hover:border-[#e1ebf4] hover:bg-white"
                  }`}
                >
                  {item.image ? (
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-[16px] border border-[#dfeaf4] bg-white">
                      <Image src={absoluteMediaUrl(item.image)} alt={item.title} fill unoptimized className="object-contain p-2" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] border border-[#dfeaf4] bg-white text-[#7f93a7]">
                      <LayoutDashboard className="h-4 w-4" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black text-[#102231]">{item.title}</div>
                    {item.subtitle ? <div className="truncate text-xs font-semibold text-[#7e92a4]">{item.subtitle}</div> : null}
                  </div>

                  {item.badge ? (
                    <span className="rounded-full bg-[#f0f6ff] px-2 py-1 text-[10px] font-black text-[#2d78c8]">{item.badge}</span>
                  ) : null}
                </button>
              ))}

              {!filteredItems.length ? (
                <div className="rounded-[20px] border border-dashed border-[#d6e3ef] p-5 text-center text-sm font-bold text-[#8ca0b3]">
                  لا توجد نتائج مطابقة
                </div>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {renderMainPanel()}
        </div>
      </div>
    </section>
  );
}
