export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-wrapper min-h-screen bg-[linear-gradient(180deg,#f7fbff_0%,#eef5fb_100%)] dark:bg-[#08111b] dark:bg-none">
      {children}
    </div>
  );
}
