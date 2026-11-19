"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { AttributeWithOptions } from "@/repositories/attribute.repository";
import { Check } from "lucide-react";
import { PriceRangeSlider06 } from "@/components/ui/price-range-slider-06";
import { CAR_PARTS_CATEGORIES } from "@/lib/car-parts-categories";
import {
  MATERIAL_FACET_SLUGS,
  filterPartSizeChips,
} from "@/lib/facet-map";
import { productsHref } from "@/lib/seo/storefront-paths";

export type CategoryChip = { name: string; slug: string };

type Props = {
  facets: AttributeWithOptions[];
  current: Record<string, string>;
  categories?: CategoryChip[];
  categorySlug?: string;
  brandSlug?: string;
  q?: string;
  sort?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  colors?: { id: string; name: string; slug: string; hex?: string | null }[];
  sizes?: { id: string; name: string; slug: string }[];
  colorSlug?: string;
  sizeSlug?: string;
  inStock?: boolean;
  forceVisible?: boolean;
};

const DEFAULT_PART_CATEGORIES: CategoryChip[] = CAR_PARTS_CATEGORIES.map(
  ({ name, slug }) => ({ name, slug }),
);

const SORTS = [
  { value: "newest", label: "جدیدترین" },
  { value: "popular", label: "پرفروش‌ترین" },
  { value: "price_asc", label: "ارزان‌ترین" },
  { value: "price_desc", label: "گران‌ترین" },
  { value: "featured", label: "ویژه" },
] as const;

function buildHref(
  next: {
    category?: string | null;
    sort?: string | null;
    attrs?: Record<string, string>;
    minPrice?: number | null;
    maxPrice?: number | null;
    color?: string | null;
    size?: string | null;
    inStock?: boolean | null;
  },
  base: Props,
) {
  const params = new URLSearchParams();
  if (base.brandSlug) params.set("brand", base.brandSlug);
  if (base.q) params.set("q", base.q);

  const color =
    next.color === null
      ? undefined
      : next.color !== undefined
        ? next.color ?? undefined
        : base.colorSlug;
  if (color) params.set("color", color);

  const size =
    next.size === null
      ? undefined
      : next.size !== undefined
        ? next.size ?? undefined
        : base.sizeSlug;
  if (size) params.set("size", size);

  const wantInStock =
    next.inStock === null
      ? false
      : next.inStock !== undefined
        ? !!next.inStock
        : !!base.inStock;
  if (wantInStock) params.set("inStock", "1");

  const wantFeatured =
    next.sort === "featured"
      ? true
      : next.sort != null && next.sort !== "featured"
        ? false
        : !!base.featured;
  if (wantFeatured) params.set("featured", "1");

  const cat =
    next.category === null
      ? undefined
      : next.category !== undefined
        ? next.category
        : base.categorySlug;
  if (cat) params.set("category", cat);

  let sort =
    next.sort === null
      ? "newest"
      : next.sort !== undefined
        ? next.sort
        : base.sort ?? "newest";
  if (sort === "featured") sort = "newest";
  if (sort && sort !== "newest") params.set("sort", sort);

  const attrs = next.attrs !== undefined ? next.attrs : base.current;
  for (const [k, v] of Object.entries(attrs)) {
    if (v) params.set(k, v);
  }

  const minP =
    next.minPrice === null
      ? undefined
      : next.minPrice !== undefined
        ? next.minPrice
        : base.minPrice;
  const maxP =
    next.maxPrice === null
      ? undefined
      : next.maxPrice !== undefined
        ? next.maxPrice
        : base.maxPrice;
  if (minP != null && minP > 0) params.set("minPrice", String(minP));
  if (maxP != null && maxP > 0) params.set("maxPrice", String(maxP));

  const qs = params.toString();
  return productsHref(qs || undefined);
}

function FilterLink({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
  onNavigate: (href: string) => void;
}) {
  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onNavigate(href);
      }}
      className={cn(
        "flex items-center gap-2 rounded-md px-1.5 py-1.5 text-xs transition-colors",
        active
          ? "bg-primary/10 text-primary font-medium"
          : "text-foreground hover:bg-muted",
      )}
    >
      {children}
    </a>
  );
}

function CheckBox({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-muted-foreground/40",
      )}
    >
      {active ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
    </span>
  );
}

function RadioDot({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
        active ? "border-primary bg-primary" : "border-muted-foreground/40",
      )}
    >
      {active ? (
        <span className="bg-primary-foreground block h-1.5 w-1.5 rounded-full" />
      ) : null}
    </span>
  );
}

function AttrFacetBlock({
  attr,
  current,
  props,
  optActive,
  navigate,
}: {
  attr: AttributeWithOptions;
  current: Record<string, string>;
  props: Props;
  optActive: (key: string, serverActive: boolean) => boolean;
  navigate: (href: string, key: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium">{attr.name}</p>
      <ul className="space-y-0.5">
        {attr.options.map((opt) => {
          const server = current[attr.slug] === opt.slug;
          const key = `attr:${attr.slug}:${opt.slug}`;
          const nextAttrs = { ...current };
          if (server) delete nextAttrs[attr.slug];
          else nextAttrs[attr.slug] = opt.slug;
          const href = buildHref({ attrs: nextAttrs }, props);
          return (
            <li key={opt.id}>
              <FilterLink
                href={href}
                active={optActive(key, server)}
                onNavigate={(h) => navigate(h, key)}
              >
                <CheckBox active={optActive(key, server)} />
                <span className="leading-snug">{opt.value}</span>
              </FilterLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ProductFiltersSidebar(props: Props) {
  const {
    facets,
    current,
    categories: categoriesProp = [],
    categorySlug,
    sort = "newest",
    featured,
    minPrice,
    maxPrice,
    inStock,
    forceVisible,
  } = props;
  const categories =
    categoriesProp.length > 0 ? categoriesProp : DEFAULT_PART_CATEGORIES;

  const sizes = useMemo(
    () => filterPartSizeChips(props.sizes ?? []),
    [props.sizes],
  );

  const { materialFacets, moreFacets } = useMemo(() => {
    const material: AttributeWithOptions[] = [];
    const more: AttributeWithOptions[] = [];
    for (const f of facets) {
      if (MATERIAL_FACET_SLUGS.has(String(f.slug || "").toLowerCase())) {
        material.push(f);
      } else {
        more.push(f);
      }
    }
    return { materialFacets: material, moreFacets: more };
  }, [facets]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(
    () => Object.keys(props.current ?? {}).some((k) => !MATERIAL_FACET_SLUGS.has(k)),
  );

  useEffect(() => {
    setPendingKey(null);
  }, [pathname, searchParams]);

  function navigate(href: string, key: string) {
    setPendingKey(key);
    startTransition(() => {
      router.push(href);
    });
  }

  function optActive(key: string, serverActive: boolean) {
    if (pendingKey === key) return true;
    if (pendingKey?.startsWith("attr:") && key.startsWith("attr:")) {
      const pendingAttr = pendingKey.split(":")[1];
      const thisAttr = key.split(":")[1];
      if (pendingAttr === thisAttr) return pendingKey === key;
    }
    if (pendingKey?.startsWith("sort:") && key.startsWith("sort:")) {
      return pendingKey === key;
    }
    if (pendingKey?.startsWith("cat:") && key.startsWith("cat:")) {
      return pendingKey === key;
    }
    if (pendingKey?.startsWith("stock:") && key.startsWith("stock:")) {
      return pendingKey === key;
    }
    return serverActive;
  }

  const clearAll = buildHref(
    {
      category: null,
      sort: null,
      attrs: {},
      minPrice: null,
      maxPrice: null,
      color: null,
      size: null,
      inStock: null,
    },
    { ...props, featured: false, inStock: false },
  );

  const activeCount =
    (categorySlug ? 1 : 0) +
    (featured ? 1 : 0) +
    (sort && sort !== "newest" ? 1 : 0) +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (props.colorSlug ? 1 : 0) +
    (props.sizeSlug ? 1 : 0) +
    (inStock ? 1 : 0) +
    Object.keys(current).length;

  return (
    <aside
      className={cn(
        forceVisible
          ? "w-full space-y-1"
          : "border-border bg-card hidden w-64 shrink-0 self-start rounded-xl border p-4 lg:sticky lg:top-24 lg:block",
        isPending && "opacity-90",
      )}
    >
      <div className="mb-4 flex items-center justify-between border-b pb-3">
        <h2 className="text-sm font-semibold text-primary">
          فیلترها
          {isPending ? (
            <span className="text-muted-foreground ms-2 text-[10px] font-normal">
              …
            </span>
          ) : null}
        </h2>
        {activeCount > 0 ? (
          <button
            type="button"
            className="text-primary text-xs hover:underline"
            onClick={() => navigate(clearAll, "clear")}
          >
            حذف فیلترها
          </button>
        ) : null}
      </div>

      <div
        className={
          forceVisible
            ? "space-y-5"
            : "max-h-[calc(100vh-10rem)] space-y-5 overflow-y-auto pe-1"
        }
      >
        {categories.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium">دسته‌بندی</p>
            <ul className="space-y-0.5">
              <li>
                <FilterLink
                  href={buildHref({ category: null }, props)}
                  active={optActive("cat:all", !categorySlug)}
                  onNavigate={(h) => navigate(h, "cat:all")}
                >
                  <CheckBox active={optActive("cat:all", !categorySlug)} />
                  همه
                </FilterLink>
              </li>
              {categories.map((c) => {
                const server = categorySlug === c.slug;
                const key = `cat:${c.slug}`;
                const href = buildHref(
                  { category: server ? null : c.slug },
                  props,
                );
                return (
                  <li key={c.slug}>
                    <FilterLink
                      href={href}
                      active={optActive(key, server)}
                      onNavigate={(h) => navigate(h, key)}
                    >
                      <CheckBox active={optActive(key, server)} />
                      {c.name}
                    </FilterLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-xs font-medium">مرتب‌سازی</p>
          <ul className="space-y-0.5">
            {SORTS.map((s) => {
              const server =
                s.value === "featured"
                  ? !!featured
                  : !featured && (sort ?? "newest") === s.value;
              const key = `sort:${s.value}`;
              const href = buildHref({ sort: s.value }, props);
              return (
                <li key={s.value}>
                  <FilterLink
                    href={href}
                    active={optActive(key, server)}
                    onNavigate={(h) => navigate(h, key)}
                  >
                    <RadioDot active={optActive(key, server)} />
                    {s.label}
                  </FilterLink>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium">محدوده قیمت (تومان)</p>
          <PriceRangeSlider06
            min={0}
            max={50_000_000}
            step={50_000}
            defaultValue={[
              minPrice && minPrice > 0 ? minPrice : 0,
              maxPrice && maxPrice > 0 ? maxPrice : 50_000_000,
            ]}
            onValueChange={(range) => {
              const href = buildHref(
                {
                  minPrice: range[0] > 0 ? range[0] : null,
                  maxPrice: range[1] < 50_000_000 ? range[1] : null,
                },
                props,
              );
              navigate(href, "price");
            }}
          />
        </div>

        <div>
          <p className="mb-2 text-xs font-medium">موجودی</p>
          <ul className="space-y-0.5">
            <li>
              <FilterLink
                href={buildHref(
                  { inStock: inStock ? null : true },
                  props,
                )}
                active={optActive("stock:1", !!inStock)}
                onNavigate={(h) =>
                  navigate(h, inStock ? "stock:0" : "stock:1")
                }
              >
                <CheckBox active={optActive("stock:1", !!inStock)} />
                فقط کالاهای موجود
              </FilterLink>
            </li>
          </ul>
        </div>

        {materialFacets.map((attr) => (
          <AttrFacetBlock
            key={attr.id}
            attr={attr}
            current={current}
            props={props}
            optActive={optActive}
            navigate={navigate}
          />
        ))}

        {(props.colors?.length ?? 0) > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium">رنگ / فلز</p>
            <ul className="space-y-0.5">
              {props.colors!.map((c) => {
                const server = props.colorSlug === c.slug;
                const key = `color:${c.slug}`;
                const href = buildHref(
                  { color: server ? null : c.slug },
                  props,
                );
                return (
                  <li key={c.id}>
                    <FilterLink
                      href={href}
                      active={optActive(key, server)}
                      onNavigate={(h) => navigate(h, key)}
                    >
                      <CheckBox active={optActive(key, server)} />
                      {c.hex ? (
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/10"
                          style={{ backgroundColor: c.hex }}
                        />
                      ) : null}
                      <span className="leading-snug">{c.name}</span>
                    </FilterLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {sizes.length > 0 ? (
          <div>
            <p className="mb-2 text-xs font-medium">سایز / ابعاد قطعه</p>
            <ul className="space-y-0.5">
              {sizes.map((s) => {
                const server = props.sizeSlug === s.slug;
                const key = `size:${s.slug}`;
                const href = buildHref(
                  { size: server ? null : s.slug },
                  props,
                );
                return (
                  <li key={s.id}>
                    <FilterLink
                      href={href}
                      active={optActive(key, server)}
                      onNavigate={(h) => navigate(h, key)}
                    >
                      <CheckBox active={optActive(key, server)} />
                      <span className="leading-snug">{s.name}</span>
                    </FilterLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        {moreFacets.length > 0 ? (
          <div className="border-border border-t pt-3">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className="hover:bg-muted flex w-full items-center justify-between rounded-md px-1 py-2 text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                فیلترهای بیشتر
                {moreFacets.some((f) => current[f.slug]) ? (
                  <span className="bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                    {moreFacets.filter((f) => current[f.slug]).length}
                  </span>
                ) : null}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {moreOpen ? "بستن" : "باز کردن"}
              </span>
            </button>
            {moreOpen ? (
              <div className="mt-3 space-y-5">
                {moreFacets.map((attr) => (
                  <AttrFacetBlock
                    key={attr.id}
                    attr={attr}
                    current={current}
                    props={props}
                    optActive={optActive}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
