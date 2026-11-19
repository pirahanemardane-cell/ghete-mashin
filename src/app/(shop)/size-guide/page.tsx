import type { Metadata } from "next";
import { StaticPage } from "@/components/content/static-page";
import { STORE_DISPLAY_NAME } from "@/lib/site-brand";

export const revalidate = 60;

export const metadata: Metadata = {
  title: `راهنمای انتخاب قطعه | ${STORE_DISPLAY_NAME}`,
  description:
    "نحوه انتخاب قطعه یدکی متناسب با برند، مدل و سال ساخت خودرو",
};

/** نمونه جدول سازگاری — مقادیر نمایشی */
const FITMENT_ROWS = [
  { brand: "پژو", model: "۲۰۶", years: "۱۳۸۵–۱۴۰۰", notes: "شاسی کلاسیک" },
  { brand: "پژو", model: "۴۰۵", years: "۱۳۷۹–۱۳۹۵", notes: "موتور TU5 / XU7" },
  { brand: "ایران‌خودرو", model: "پژو ۴۰۷", years: "۱۳۸۵–۱۴۰۳", notes: "پلتفرم مشترک با سیتروئن" },
  { brand: "سایپا", model: "پراید", years: "۱۳۷۲–۱۴۰۲", notes: "مدل‌های ۱۱۱ تا ۱۵۱" },
  { brand: "سایپا", model: "تیبا", years: "۱۳۸۷–۱۴۰۳", notes: "سری ۱ و ۲" },
] as const;

export default function SizeGuidePage() {
  return (
    <StaticPage title="راهنمای انتخاب قطعه">
      <p className="text-muted-foreground mb-8 leading-relaxed">
        قبل از خرید، برند خودرو، مدل دقیق و سال ساخت را از کارت خودرو یا سند
        بیمه‌نامه بررسی کنید. در صورت شک، شماره شاسی (VIN) روی قطعه قبلی یا
        دفترچه راهنمای خودرو مرجع مطمئن‌تری است.
      </p>

      <h2 className="mb-3 text-lg font-bold">سه مرحله انتخاب</h2>
      <ol className="text-muted-foreground mb-8 list-decimal space-y-2 ps-5 text-sm leading-relaxed">
        <li>در فهرست محصولات از فیلتر «برند خودرو»، «مدل» و «سال ساخت» استفاده کنید.</li>
        <li>نوع قطعه (اصل، OEM، aftermarket) را با بودجه و نیاز خود مقایسه کنید.</li>
        <li>قبل از نصب، قطعه را با نمونه قبلی از نظر ابعاد و اتصالات کنترل کنید.</li>
      </ol>

      <h2 className="mb-3 text-lg font-bold">نمونه جدول سازگاری</h2>
      <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
        جدول زیر نمونه‌ای از ترکیب‌های رایج در بازار ایران است؛ سازگاری نهایی هر
        محصول روی صفحه همان کالا درج می‌شود.
      </p>
      <div className="mb-10 overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[32rem] text-sm">
          <thead className="bg-muted/50 text-start">
            <tr>
              <th className="px-4 py-3 font-semibold">برند خودرو</th>
              <th className="px-4 py-3 font-semibold">مدل</th>
              <th className="px-4 py-3 font-semibold">سال ساخت (شمسی)</th>
              <th className="px-4 py-3 font-semibold">یادداشت</th>
            </tr>
          </thead>
          <tbody>
            {FITMENT_ROWS.map((row) => (
              <tr key={`${row.brand}-${row.model}`} className="border-t">
                <td className="px-4 py-3">{row.brand}</td>
                <td className="px-4 py-3">{row.model}</td>
                <td className="px-4 py-3">{row.years}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        برای قطعات موتور و گیربکس، کد موتور (مثلاً TU5 یا EF7) را با پشتیبانی
        هماهنگ کنید. روغن و فیلترها را با شاخص گرانروی پیشنهاد کارخانه
        انتخاب کنید.
      </p>
    </StaticPage>
  );
}