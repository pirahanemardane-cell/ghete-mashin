"use client";

import type { ReactElement, SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

function svgProps(props: IconProps) {
  const { className, ...rest } = props;
  return {
    className: cn("size-10 shrink-0 text-black", className),
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true as const,
    ...rest,
  };
}

/** گردنبند */
export function IconNecklace(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M10 14 C14 28 20 34 24 34 C28 34 34 28 38 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 12 C18 8 22 7 24 7 C26 7 30 8 32 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M24 34 L24 38 L21 42 H27 L24 38"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="30.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

/** انگشتر */
export function IconRing(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <ellipse
        cx="24"
        cy="30"
        rx="11"
        ry="8"
        stroke="currentColor"
        strokeWidth="2"
      />
      <ellipse
        cx="24"
        cy="30"
        rx="7"
        ry="4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.7"
      />
      <path
        d="M24 14 L27.2 20.5 L34 21.2 L28.8 25.8 L30.4 32.5 L24 28.8 L17.6 32.5 L19.2 25.8 L14 21.2 L20.8 20.5 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** گوشواره */
export function IconEarring(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="24" cy="9" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M24 11.2 C24 11.2 18 16 18 22 C18 27 21 30 24 30 C27 30 30 27 30 22 C30 16 24 11.2 24 11.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M24 30 V36"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M24 36 L20.5 42 H27.5 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** دستبند */
export function IconBracelet(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="11"
        stroke="currentColor"
        strokeWidth="2"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="9.5"
        ry="7"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.75"
      />
      <path
        d="M33 16.5 C35.5 18.5 36.5 21.5 36.5 24 C36.5 26.5 35.5 29.5 33 31.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="24" cy="13.5" r="1.5" fill="currentColor" />
      <circle cx="18.5" cy="15.5" r="1.2" fill="currentColor" opacity="0.85" />
      <circle cx="29.5" cy="15.5" r="1.2" fill="currentColor" opacity="0.85" />
    </svg>
  );
}

/** ست */
export function IconJewelrySet(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <circle cx="17" cy="28" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="17" cy="28" r="3.5" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <path
        d="M31 12 L33.2 17 L38.5 17.5 L34.5 21 L35.7 26.2 L31 23.2 L26.3 26.2 L27.5 21 L23.5 17.5 L28.8 17 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M30 30 C30 30 26.5 33 26.5 36.5 C26.5 39 28.2 40.5 30 40.5 C31.8 40.5 33.5 39 33.5 36.5 C33.5 33 30 30 30 30"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** اکسسوری / پیش‌فرض */
export function IconCategoryDefault(props: IconProps) {
  return (
    <svg {...svgProps(props)}>
      <path
        d="M24 8 L28 18 L39 19.2 L31 26.5 L33.5 37 L24 31.5 L14.5 37 L17 26.5 L9 19.2 L20 18 Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="23" r="2" fill="currentColor" />
    </svg>
  );
}

export type CategoryIconId =
  | "necklace"
  | "ring"
  | "earring"
  | "bracelet"
  | "set"
  | "default";

const RULES: {
  id: CategoryIconId;
  test: (s: string) => boolean;
  Icon: (p: IconProps) => ReactElement;
}[] = [
  {
    id: "earring",
    test: (s) => /برق|الکتریک|electrical|ecu|باتری/.test(s),
    Icon: IconEarring,
  },
  {
    id: "bracelet",
    test: (s) => /روغن|فیلتر|oil|filter|روغن-فیلتر/.test(s),
    Icon: IconBracelet,
  },
  {
    id: "ring",
    test: (s) => /ترمز|تعلیق|brake|suspension|ترمز-تعلیق/.test(s),
    Icon: IconRing,
  },
  {
    id: "necklace",
    test: (s) => /بدنه|شیشه|body|bumpers?|mirror/.test(s),
    Icon: IconNecklace,
  },
  {
    id: "set",
    test: (s) =>
      /لوازم.?مصرفی|consumables?|تعویض.?دوره|سرویس/.test(s),
    Icon: IconJewelrySet,
  },
  {
    id: "default",
    test: (s) => /موتور|engine|موتوری|گردنبند|گوشواره|اکسسوری/.test(s),
    Icon: IconCategoryDefault,
  },
];

const ICONS: Record<CategoryIconId, (p: IconProps) => ReactElement> = {
  earring: IconEarring,
  bracelet: IconBracelet,
  ring: IconRing,
  necklace: IconNecklace,
  set: IconJewelrySet,
  default: IconCategoryDefault,
};

export function resolveCategoryIconId(
  name?: string | null,
  slug?: string | null,
): CategoryIconId {
  const key = `${name ?? ""} ${slug ?? ""}`.toLowerCase();
  for (const r of RULES) {
    if (r.test(key)) return r.id;
  }
  return "default";
}

export function CategorySvgIcon({
  name,
  slug,
  className,
}: {
  name?: string | null;
  slug?: string | null;
  className?: string;
}) {
  const Icon = ICONS[resolveCategoryIconId(name, slug)];
  return <Icon className={className} />;
}
