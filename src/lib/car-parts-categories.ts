/** دسته‌بندی‌های استاندارد قطعه ماشین (slugs map to CategorySvgIcon) */
export const CAR_PARTS_CATEGORIES = [
  { name: "موتور و قطعات موتوری", slug: "موتور", icon: "default" as const },
  { name: "ترمز و تعلیق", slug: "ترمز-تعلیق", icon: "ring" as const },
  { name: "برق و الکتریک", slug: "برق", icon: "earring" as const },
  { name: "بدنه و شیشه", slug: "بدنه", icon: "necklace" as const },
  { name: "روغن و فیلتر", slug: "روغن-فیلتر", icon: "bracelet" as const },
  { name: "لوازم مصرفی", slug: "لوازم-مصرفی", icon: "set" as const },
] as const;

/** @deprecated Use CAR_PARTS_CATEGORIES */
export const JEWELRY_CATEGORIES = CAR_PARTS_CATEGORIES;

/** برند خودروهای رایج — slug فارسی برای URL facet */
export const VEHICLE_BRANDS = [
  { name: "ایران‌خودرو", slug: "ایران-خودرو" },
  { name: "سایپا", slug: "سایپا" },
  { name: "پژو", slug: "پژو" },
  { name: "تویوتا", slug: "تویوتا" },
  { name: "هیوندای", slug: "هیوندای" },
  { name: "کی‌ام‌جی", slug: "کی-ام-جی" },
] as const;

/** رنگ‌های رایج قطعات / بدنه — slug فارسی برای URL facet */
export const PART_COLORS = [
  { name: "مشکی", slug: "مشکی", hex: "#1a1a1a" },
  { name: "سفید", slug: "سفید", hex: "#F5F5F5" },
  { name: "خاکستری", slug: "خاکستری", hex: "#9CA3AF" },
  { name: "کروم", slug: "کروم", hex: "#C0C0C0" },
  { name: "قرمز", slug: "قرمز", hex: "#DC2626" },
] as const;

/** @deprecated */
export const JEWELRY_MATERIALS = VEHICLE_BRANDS;
/** @deprecated */
export const JEWELRY_COLORS = PART_COLORS;