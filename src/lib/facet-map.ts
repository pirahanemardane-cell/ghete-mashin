/**
 * Auto-parts PLP facets — vehicle fitment + part metadata (Digikala / CarPart style).
 * Legacy jewelry/apparel attribute slugs are blocked.
 */

/** Attribute slugs allowed as URL facet params (color/size are first-class, not here). */
export const CAR_PARTS_ATTR_FACET_SLUGS = [
  "vehicle-brand",
  "vehicle-model",
  "vehicle-year",
  "part-origin",
  "part-condition",
  "part-manufacturer",
  "part-type",
  "position",
  "viscosity",
  "warranty-months",
] as const;

export type CarPartsAttrFacetSlug = (typeof CAR_PARTS_ATTR_FACET_SLUGS)[number];

/** @deprecated */
export const JEWELRY_ATTR_FACET_SLUGS = CAR_PARTS_ATTR_FACET_SLUGS;
/** @deprecated */
export type JewelryAttrFacetSlug = CarPartsAttrFacetSlug;

/** Legacy jewelry + apparel slugs — never surface in shop filters. */
export const LEGACY_ATTR_BLOCKLIST = [
  "material",
  "material-type",
  "metal",
  "plating",
  "karat",
  "purity",
  "stone",
  "gemstone",
  "finish",
  "style",
  "hypoallergenic",
  "clasp",
  "chain-type",
  "chain-length",
  "necklace-length",
  "bracelet-size",
  "bracelet-length",
  "ring-size",
  "ring-size-type",
  "earring-type",
  "occasion",
  "origin",
  "thickness",
  "closure",
  "fabric",
  "pattern",
  "season",
  "fit",
  "collar",
  "collar-type",
  "sleeve",
  "sleeve-type",
  "button-type",
  "pocket",
  "tie-width",
  "tie-length",
  "bow-tie-type",
  "cufflink-material",
  "gender",
  "gender-tee",
  "tee-size",
  "waist",
  "inseam",
  "neck",
  "chest",
] as const;

/** @deprecated */
export const APPAREL_ATTR_BLOCKLIST = LEGACY_ATTR_BLOCKLIST;

const BLOCKED = new Set<string>(LEGACY_ATTR_BLOCKLIST.map((s) => s.toLowerCase()));

const ALLOWED_ATTR = new Set<string>(
  CAR_PARTS_ATTR_FACET_SLUGS.map((s) => s.toLowerCase()),
);

/** Core facets shown for every parts category (when present in catalog). */
const CORE_PARTS_FACETS = [
  "vehicle-brand",
  "vehicle-model",
  "vehicle-year",
  "part-origin",
  "part-condition",
  "part-manufacturer",
] as const;

const ENGINE_FACETS = [...CORE_PARTS_FACETS, "part-type"] as const;

const BRAKES_FACETS = [...CORE_PARTS_FACETS, "part-type", "position"] as const;

const ELECTRICAL_FACETS = [...CORE_PARTS_FACETS, "part-type"] as const;

const BODY_FACETS = [...CORE_PARTS_FACETS, "position"] as const;

const FILTER_OIL_FACETS = [
  ...CORE_PARTS_FACETS,
  "part-type",
  "viscosity",
] as const;

const CONSUMABLE_FACETS = [...CORE_PARTS_FACETS, "part-type"] as const;

export const FACET_BY_CATEGORY: Record<string, string[]> = {
  // English (legacy) + Persian storefront slugs
  engine: [...ENGINE_FACETS],
  motors: [...ENGINE_FACETS],
  موتور: [...ENGINE_FACETS],
  brakes: [...BRAKES_FACETS],
  suspension: [...BRAKES_FACETS],
  "ترمز-تعلیق": [...BRAKES_FACETS],
  electrical: [...ELECTRICAL_FACETS],
  برق: [...ELECTRICAL_FACETS],
  body: [...BODY_FACETS],
  بدنه: [...BODY_FACETS],
  filters: [...FILTER_OIL_FACETS],
  "oil-filters": [...FILTER_OIL_FACETS],
  "روغن-فیلتر": [...FILTER_OIL_FACETS],
  consumables: [...CONSUMABLE_FACETS],
  "لوازم-مصرفی": [...CONSUMABLE_FACETS],
};

/** URL keys accepted for attribute facets (shared by PLP / category / brand / search). */
export const FACET_KEYS = [...CAR_PARTS_ATTR_FACET_SLUGS] as const;

export const DEFAULT_FACET_SLUGS = [...CORE_PARTS_FACETS] as const;

/** First-class fitment facet slugs (promoted above “more filters”). */
export const MATERIAL_FACET_SLUGS = new Set([
  "vehicle-brand",
  "vehicle-model",
  "vehicle-year",
]);

export function isApparelAttrSlug(slug: string): boolean {
  return BLOCKED.has(slug.trim().toLowerCase());
}

export function isAllowedCarPartsAttrSlug(slug: string): boolean {
  const s = slug.trim().toLowerCase();
  if (!s || BLOCKED.has(s)) return false;
  if (s === "color" || s === "size") return false;
  return ALLOWED_ATTR.has(s);
}

/** @deprecated */
export const isAllowedJewelryAttrSlug = isAllowedCarPartsAttrSlug;

export function facetSlugsForCategory(categorySlug?: string): string[] {
  if (!categorySlug) return [...DEFAULT_FACET_SLUGS];
  const key = categorySlug.trim();
  return (
    FACET_BY_CATEGORY[key] ??
    FACET_BY_CATEGORY[key.toLowerCase()] ??
    [...DEFAULT_FACET_SLUGS]
  );
}

/** Keep only car-parts-relevant filterable attributes for a category. */
export function filterCarPartsFacets<T extends { slug: string }>(
  facets: T[],
  categorySlug?: string,
): T[] {
  const allowed = new Set(
    facetSlugsForCategory(categorySlug).map((s) => s.toLowerCase()),
  );
  const loose = !categorySlug;
  return facets.filter((f) => {
    const s = String(f.slug || "").toLowerCase();
    if (!s || isApparelAttrSlug(s)) return false;
    if (s === "color" || s === "size") return false;
    if (allowed.has(s)) return true;
    return loose && isAllowedCarPartsAttrSlug(s);
  });
}

/** @deprecated */
export const filterJewelryFacets = filterCarPartsFacets;

/** Legacy apparel letter sizes — hide from parts PLP size chips. */
const APPAREL_SIZE_SLUGS = new Set([
  "xxs",
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "2xl",
  "3xl",
  "4xl",
  "one-size",
  "onesize",
  "os",
  "free-size",
  "freesize",
]);

const APPAREL_SIZE_NAMES = new Set([
  "ایکس اس",
  "اس",
  "ام",
  "ال",
  "ایکس ال",
  "دو ایکس ال",
  "فری سایز",
  "وان سایز",
]);

export function isApparelSizeChip(input: {
  slug?: string | null;
  name?: string | null;
}): boolean {
  const slug = String(input.slug || "")
    .trim()
    .toLowerCase();
  const name = String(input.name || "")
    .trim()
    .toLowerCase();
  if (slug && APPAREL_SIZE_SLUGS.has(slug)) return true;
  if (name && APPAREL_SIZE_SLUGS.has(name)) return true;
  if (name && APPAREL_SIZE_NAMES.has(name)) return true;
  return false;
}

export function filterPartSizeChips<
  T extends { slug?: string | null; name?: string | null },
>(sizes: T[]): T[] {
  return sizes.filter((s) => !isApparelSizeChip(s));
}

/** @deprecated */
export const filterJewelrySizeChips = filterPartSizeChips;

/** Parse car-parts attr facets from URL search params. */
export function parseAttrFacetsFromParams(
  params: Record<string, string | string[] | undefined>,
): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const key of FACET_KEYS) {
    const v = params[key];
    if (typeof v === "string" && v && isAllowedCarPartsAttrSlug(key)) {
      attrs[key] = v;
    }
  }
  return attrs;
}

export function parseInStockParam(
  value: string | string[] | undefined,
): boolean | undefined {
  if (value === "1" || value === "true") return true;
  return undefined;
}