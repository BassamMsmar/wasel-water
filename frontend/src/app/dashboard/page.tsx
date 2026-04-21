"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMyOrders, getProfile, isLoggedIn, logout } from "@/lib/auth";
import { money } from "@/lib/media";

type Profile = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
};

type OrderStatus = {
  id: number;
  name: string;
  slug: string;
  color: string;
};

type Order = {
  id: number;
  created_at: string;
  total_price: string;
  is_paid: boolean;
  shipping_full_name: string;
  shipping_phone: string;
  shipping_city: string;
  shipping_address: string;
  status: OrderStatus | null;
  items: { id: number; price: string; quantity: number }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace("/login");
      return;
    }

    const init = async () => {
      const [profileResponse, ordersResponse] = await Promise.all([getProfile(), getMyOrders()]);

      if (!profileResponse) {
        router.replace("/login");
        return;
      }

      setProfile(profileResponse);
      setOrders(ordersResponse);
      setLoading(false);
    };

    init();
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/");
    router.refresh();
  }

  if (loading) {
    return (
      <section className="dash-loading">
        <div className="spinner" />
        <p>جارٍ تجهيز بيانات الحساب...</p>
      </section>
    );
  }

  const paid = orders.filter((order) => order.is_paid).length;
  const pending = orders.filter((order) => !order.is_paid).length;
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.total_price), 0);

  return (
    <section>
      <div className="dash-header-card">
        <div className="dash-user-info">
          <div className="dash-avatar">
            {(profile?.first_name?.[0] || profile?.username?.[0] || "و").toUpperCase()}
          </div>
          <div>
            <h1 className="dash-title">مرحبًا، {profile?.first_name || profile?.username}</h1>
            <p className="dash-subtitle">
              {profile?.email} · {profile?.is_staff ? "وصول إداري متاح" : "حساب عميل"}
            </p>
          </div>
        </div>

        <div className="dash-actions">
          {profile?.is_staff ? (
            <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noreferrer" className="dash-btn-admin">
              فتح لوحة Django
            </a>
          ) : null}
          <button className="dash-btn-logout" onClick={handleLogout}>
            تسجيل الخروج
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">طلب</div>
          <div>
            <div className="stat-value">{orders.length}</div>
            <div className="stat-label">إجمالي الطلبات</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">دفع</div>
          <div>
            <div className="stat-value">{paid}</div>
            <div className="stat-label">طلبات مدفوعة</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">قيد</div>
          <div>
            <div className="stat-value">{pending}</div>
            <div className="stat-label">قيد المعالجة</div>
          </div>
        </div>
        <div className="stat-card accent">
          <div className="stat-icon">ر.س</div>
          <div>
            <div className="stat-value">{money(totalSpent)}</div>
            <div className="stat-label">إجمالي المشتريات</div>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <h2>سجل الطلبات</h2>
          <Link href="/products">طلب جديد</Link>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">٠</div>
            <h3>لا توجد طلبات سابقة</h3>
            <p>ابدأ التسوق الآن وستظهر طلباتك هنا بشكل منظم وواضح.</p>
            <Link href="/products" className="btn btn-primary" style={{ marginTop: "1rem" }}>
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>رقم الطلب</th>
                  <th>التاريخ</th>
                  <th>عدد العناصر</th>
                  <th>المبلغ الإجمالي</th>
                  <th>الحالة</th>
                  <th>الدفع</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td><span className="order-id-tag">#{order.id}</span></td>
                    <td>
                      {new Date(order.created_at).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </td>
                    <td>{order.items?.length ?? 0} عناصر</td>
                    <td><strong style={{ color: "var(--navy-900)" }}>{money(order.total_price)}</strong></td>
                    <td>
                      {order.status ? (
                        <span
                          className="status-chip"
                          style={{
                            background: `${order.status.color}22`,
                            color: order.status.color,
                            border: `1px solid ${order.status.color}44`
                          }}
                        >
                          {order.status.name}
                        </span>
                      ) : (
                        <span className="status-chip status-chip-default">قيد المراجعة</span>
                      )}
                    </td>
                    <td>
                      {order.is_paid ? (
                        <span className="status-chip status-chip-paid">مدفوع</span>
                      ) : (
                        <span className="status-chip status-chip-unpaid">الدفع عند الاستلام</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {orders.length > 0 ? (
        <div className="dash-section" style={{ maxWidth: 680 }}>
          <div className="dash-section-header">
            <h2>تفاصيل توصيل آخر طلب</h2>
          </div>
          <div className="lod-grid">
            <div className="lod-row"><span>المستلم</span><strong>{orders[0].shipping_full_name}</strong></div>
            <div className="lod-row"><span>الجوال</span><strong style={{ direction: "ltr" }}>{orders[0].shipping_phone}</strong></div>
            <div className="lod-row"><span>المدينة</span><strong>{orders[0].shipping_city}</strong></div>
            <div className="lod-row"><span>العنوان</span><strong>{orders[0].shipping_address}</strong></div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
