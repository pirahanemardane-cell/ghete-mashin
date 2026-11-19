"use client";

import Image from "next/image";
import { WordmarkRevealFooter } from "@/components/ui/wordmark-reveal-footer";
import { STOREFRONT_PATHS } from "@/lib/seo/storefront-paths";

const FOOTER_COLUMNS = [
  {
    title: "فروشگاه",
    links: [
      { label: "محصولات", href: STOREFRONT_PATHS.products },
      { label: "دسته‌ها", href: STOREFRONT_PATHS.categories },
      { label: "درباره ما", href: STOREFRONT_PATHS.about },
      { label: "تماس", href: STOREFRONT_PATHS.contact },
    ],
  },
  {
    title: "راهنما",
    links: [
      { label: "راهنمای سایز", href: STOREFRONT_PATHS.sizeGuide },
      { label: "ارسال", href: STOREFRONT_PATHS.shipping },
      { label: "مرجوعی", href: STOREFRONT_PATHS.returns },
      { label: "ضمانت و اصالت", href: STOREFRONT_PATHS.warranty },
      { label: "سوالات متداول", href: STOREFRONT_PATHS.faq },
    ],
  },
  {
    title: "قانونی",
    links: [
      { label: "شرایط استفاده", href: STOREFRONT_PATHS.terms },
      { label: "حریم خصوصی", href: STOREFRONT_PATHS.privacy },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "شرایط استفاده", href: STOREFRONT_PATHS.terms },
  { label: "حریم خصوصی", href: STOREFRONT_PATHS.privacy },
];

export function SiteFooter() {
  return (
    <WordmarkRevealFooter
      wordmark="SHADJEWEL"
      brand={{
        name: "شاد جول",
        mark: (
          <Image
            src="/brand/mark-flower-transparent.webp"
            alt=""
            width={28}
            height={28}
            className="size-7 object-contain"
          />
        ),
        blurb:
          "قطعه ماشین — فروشگاه آنلاین قطعات یدکی؛ موتور، ترمز، تعلیق، برق، بدنه و روغن و فیلتر.",
      }}
      columns={FOOTER_COLUMNS}
      legal={LEGAL_LINKS}
      offices={[{ city: "Tehran", timeZone: "Asia/Tehran" }]}
      status={{ label: "فروشگاه آنلاین", tone: "ok" }}
      reveal="inView"
      className="border-t border-border"
    />
  );
}
