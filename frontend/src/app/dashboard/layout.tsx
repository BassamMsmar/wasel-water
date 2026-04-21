import Link from "next/link";
import { LayoutDashboard, Droplet, ShoppingCart, Truck, BarChart2, Settings, HelpCircle, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#f8fafc] border-r border-[#e2e8f0] flex flex-col pt-8 pb-6 sticky top-0 h-screen">
        <div className="px-8 mb-10">
          <h1 className="text-sm font-black text-brand-dark tracking-tight leading-tight">Wasel Admin</h1>
          <p className="text-[0.6rem] text-gray-400 font-bold uppercase tracking-widest mt-1">Premium Fleet Management</p>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/dashboard/inventory" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-brand-dark bg-white shadow-sm border border-gray-100 transition-colors">
            <Droplet className="w-4 h-4 text-brand-ocean" /> Inventory
          </Link>
          <Link href="/dashboard/orders" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">
            <ShoppingCart className="w-4 h-4" /> Orders
          </Link>
          <Link href="/dashboard/fleet" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">
            <Truck className="w-4 h-4" /> Fleet Logistics
          </Link>
          <Link href="/dashboard/analytics" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">
            <BarChart2 className="w-4 h-4" /> Analytics
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-gray-500 hover:text-brand-dark transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
        </nav>

        <div className="px-4 mt-auto pt-8 flex flex-col gap-1">
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-brand-dark transition-colors text-left">
            <HelpCircle className="w-4 h-4" /> Support
          </button>
          <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-bold text-gray-500 hover:text-brand-dark transition-colors text-left">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
