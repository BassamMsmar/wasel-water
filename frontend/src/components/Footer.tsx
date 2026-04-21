import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-16 px-6 border-t-[8px] border-brand-ocean">
      <div className="mx-auto max-w-[1400px] grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
        
        {/* Right (RTL) - Brand Info */}
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-black text-white">واصل لتوزيع المياه</h2>
          <p className="text-gray-400 font-medium">متجر متخصص في توزيع المياه.</p>
          <div className="mt-4">
             <span className="font-bold mb-2 block">تواصل معنا</span>
             <Link href="https://wa.me/something" className="inline-flex items-center gap-2 text-gray-400 hover:text-brand-ocean transition-colors">
               <MessageCircle className="w-5 h-5" />
             </Link>
          </div>
        </div>

        {/* Center - Support Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2 inline-block w-fit mb-2">الدعم</h3>
          <nav className="flex flex-col gap-3 font-medium text-gray-400">
            <Link href="/faq" className="hover:text-brand-ocean transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-ocean rounded-full"></span> الشروط والأحكام</Link>
            <Link href="/privacy" className="hover:text-brand-ocean transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-ocean rounded-full"></span> سياسة الخصوصية</Link>
            <Link href="/shipping" className="hover:text-brand-ocean transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-ocean rounded-full"></span> معلومات الشحن</Link>
            <Link href="/returns" className="hover:text-brand-ocean transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 bg-brand-ocean rounded-full"></span> سياسة الإسترجاع</Link>
          </nav>
        </div>

        {/* Left (RTL) - Contact Info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-white border-b border-gray-800 pb-2 inline-block w-fit mb-2">معلومات الاتصال</h3>
          <ul className="flex flex-col gap-4 font-medium text-gray-400">
            <li className="flex items-center gap-3">
              <MessageCircle className="w-4 h-4 text-brand-ocean" />
              <span dir="ltr">+966 50 000 0000</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-ocean" />
              <span dir="ltr">+966 11 000 0000</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-ocean" />
              <span>info@waselwater.com</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-ocean mt-1" />
              <span>الرياض، المملكة العربية السعودية<br/>أوقات العمل: 8 ص - 10 م</span>
            </li>
          </ul>
        </div>

      </div>

      <div className="mx-auto max-w-[1400px] mt-16 pt-8 border-t border-gray-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
        <p>© {new Date().getFullYear()} واصل لتوزيع المياه. جميع الحقوق محفوظة.</p>
        <div className="flex items-center gap-2">
          <span>تصميم وتطوير</span>
        </div>
      </div>
    </footer>
  );
}
