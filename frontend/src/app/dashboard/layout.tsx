import Link from "next/link";
import { CirclePlus, LayoutDashboard, PackageSearch } from "lucide-react";

const navigation = [
  { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/dashboard/inventory/add", label: "إضافة منتج", icon: CirclePlus },
  { href: "http://127.0.0.1:8000/admin/", label: "لوحة Django", icon: PackageSearch, external: true },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)]">
      <div className="site-container grid gap-6 py-6 lg:grid-cols-[280px,minmax(0,1fr)]">
        <aside className="rounded-[30px] border border-[#dfeaf4] bg-white p-5 shadow-[0_18px_42px_rgba(10,34,56,0.06)]">
          <div className="border-b border-[#edf3f8] pb-4">
            <p className="text-xs font-black tracking-[0.25em] text-[#89a0b6]">WASEL PANEL</p>
            <h1 className="mt-2 text-xl font-black text-[#102231]">لوحة التحكم</h1>
            <p className="mt-2 text-sm leading-7 text-[#6b7f92]">
              وصول سريع إلى الحساب والمنتجات وروابط الإدارة المتاحة.
            </p>
          </div>

          <nav className="mt-5 grid gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const className = "flex items-center gap-3 rounded-[20px] px-4 py-3 text-sm font-black text-[#4f6477] transition hover:bg-[#f3f8fc] hover:text-[#102231]";

              if (item.external) {
                return (
                  <a key={item.href} href={item.href} target="_blank" rel="noreferrer" className={className}>
                    <Icon className="h-4 w-4 text-[#2d78c8]" />
                    {item.label}
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href} className={className}>
                  <Icon className="h-4 w-4 text-[#2d78c8]" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main>{children}</main>
      </div>
    </div>
  );
}
