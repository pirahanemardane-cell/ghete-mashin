/**
 * Storefront public URLs are Persian; App Router folders stay English.
 * proxy.ts rewrites FA→EN and redirects EN→FA (except /admin).
 */

export const STOREFRONT_PATHS = {
  home: "/",
  products: "/محصولات",
  categories: "/دسته-ها",
  brands: "/برندها",
  blog: "/بلاگ",
  search: "/جستجو",
  cart: "/سبد-خرید",
  checkout: "/تسویه-حساب",
  wishlist: "/علاقه-مندی-ها",
  compare: "/مقایسه",
  recentlyViewed: "/آخرین-مشاهده-ها",
  login: "/ورود",
  register: "/ثبت-نام",
  dashboard: "/داشبورد",
  about: "/درباره-ما",
  contact: "/تماس",
  faq: "/سوالات-متداول",
  terms: "/شرایط-استفاده",
  privacy: "/حریم-خصوصی",
  shipping: "/ارسال",
  returns: "/مرجوعی",
  warranty: "/ضمانت",
  sizeGuide: "/راهنمای-سایز",
  track: "/پیگیری-سفارش",
  tag: "/برچسب",
} as const;

/** English App Router path → Persian public path (exact). */
export const EN_TO_FA_PATH: Record<string, string> = {
  "/login": STOREFRONT_PATHS.login,
  "/register": STOREFRONT_PATHS.register,
  "/wishlist": STOREFRONT_PATHS.wishlist,
  "/compare": STOREFRONT_PATHS.compare,
  "/cart": STOREFRONT_PATHS.cart,
  "/checkout": STOREFRONT_PATHS.checkout,
  "/recently-viewed": STOREFRONT_PATHS.recentlyViewed,
  "/products": STOREFRONT_PATHS.products,
  "/categories": STOREFRONT_PATHS.categories,
  "/brands": STOREFRONT_PATHS.brands,
  "/blog": STOREFRONT_PATHS.blog,
  "/search": STOREFRONT_PATHS.search,
  "/contact": STOREFRONT_PATHS.contact,
  "/about": STOREFRONT_PATHS.about,
  "/faq": STOREFRONT_PATHS.faq,
  "/terms": STOREFRONT_PATHS.terms,
  "/privacy": STOREFRONT_PATHS.privacy,
  "/shipping": STOREFRONT_PATHS.shipping,
  "/returns": STOREFRONT_PATHS.returns,
  "/warranty": STOREFRONT_PATHS.warranty,
  "/size-guide": STOREFRONT_PATHS.sizeGuide,
  "/track": STOREFRONT_PATHS.track,
  "/dashboard": STOREFRONT_PATHS.dashboard,
  "/tag": STOREFRONT_PATHS.tag,
};

/** Persian public path → English App Router path (exact). */
export const FA_TO_EN_PATH: Record<string, string> = Object.fromEntries(
  Object.entries(EN_TO_FA_PATH).map(([en, fa]) => [fa, en]),
);

/** Also accept legacy / alternate Persian spellings. */
export const FA_ALIASES_TO_CANONICAL: Record<string, string> = {
  "/تماس-با-ما": STOREFRONT_PATHS.contact,
  "/پیگیری": STOREFRONT_PATHS.track,
  "/دسته-بندی-ها": STOREFRONT_PATHS.categories,
  "/دسته-بندی‌ها": STOREFRONT_PATHS.categories,
};

const EN_PREFIXES = [
  "/products",
  "/categories",
  "/brands",
  "/blog",
  "/dashboard",
  "/tag",
  "/search",
] as const;

function decodePath(pathname: string): string {
  let p = pathname;
  try {
    p = decodeURIComponent(pathname);
  } catch {
    /* ignore */
  }
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p;
}

/** Map English storefront pathname to Persian (for redirects). Admin/API untouched. */
export function englishPathToPersian(pathname: string): string | null {
  const p = decodePath(pathname);
  if (!p || p === "/" || p.startsWith("/admin") || p.startsWith("/api")) {
    return null;
  }
  if (EN_TO_FA_PATH[p]) return EN_TO_FA_PATH[p];
  for (const prefix of EN_PREFIXES) {
    if (p === prefix || p.startsWith(`${prefix}/`)) {
      const fa = EN_TO_FA_PATH[prefix];
      if (!fa) return null;
      return fa + p.slice(prefix.length);
    }
  }
  return null;
}

/** Map Persian storefront pathname to English App Router path (for rewrites). */
export function persianPathToEnglish(pathname: string): string | null {
  const p = decodePath(pathname);
  if (!p || p === "/") return null;

  const aliased = FA_ALIASES_TO_CANONICAL[p];
  if (aliased && FA_TO_EN_PATH[aliased]) return FA_TO_EN_PATH[aliased];

  if (FA_TO_EN_PATH[p]) return FA_TO_EN_PATH[p];

  for (const [fa, en] of Object.entries(FA_TO_EN_PATH)) {
    if (p === fa || p.startsWith(`${fa}/`)) {
      return en + p.slice(fa.length);
    }
  }

  // Alias prefixes (e.g. /پیگیری/CODE → /track/CODE)
  for (const [alias, canonical] of Object.entries(FA_ALIASES_TO_CANONICAL)) {
    if (p === alias || p.startsWith(`${alias}/`)) {
      const en = FA_TO_EN_PATH[canonical];
      if (!en) return null;
      return en + p.slice(alias.length);
    }
  }

  return null;
}

export function productPath(slug: string): string {
  const s = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s ? `${STOREFRONT_PATHS.products}/${s}` : STOREFRONT_PATHS.products;
}

export function categoryPath(slug: string): string {
  const s = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  // Root-level category URLs (proxy rewrites to /categories/[slug])
  return s ? `/${s}` : STOREFRONT_PATHS.categories;
}

export function brandPath(slug: string): string {
  const s = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s ? `/${s}` : STOREFRONT_PATHS.brands;
}

export function blogPath(slug?: string): string {
  const s = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s ? `${STOREFRONT_PATHS.blog}/${s}` : STOREFRONT_PATHS.blog;
}

export function tagPath(slug: string): string {
  const s = String(slug || "")
    .trim()
    .replace(/^\/+|\/+$/g, "");
  return s ? `${STOREFRONT_PATHS.tag}/${s}` : STOREFRONT_PATHS.tag;
}

export function productsHref(query?: string): string {
  if (!query) return STOREFRONT_PATHS.products;
  const q = query.startsWith("?") ? query : `?${query}`;
  return `${STOREFRONT_PATHS.products}${q}`;
}

/**
 * Percent-encode a public href for Next.js `redirect()` / Location headers.
 * HTTP headers must be ByteString (code points ≤ 255); raw Persian paths throw
 * during prerender ("Cannot convert argument to a ByteString…").
 * `encodeURI` keeps `/ ? & =` intact while encoding non-ASCII segments.
 */
export function locationHref(pathWithOptionalQuery: string): string {
  return encodeURI(pathWithOptionalQuery);
}

/** Default auto-parts category slugs (Persian). Icon map still matches by name/slug text. */
export const CATEGORY_SLUG_EN_TO_FA: Record<string, string> = {
  engine: "موتور",
  brakes: "ترمز-تعلیق",
  suspension: "ترمز-تعلیق",
  electrical: "برق",
  body: "بدنه",
  filters: "روغن-فیلتر",
  "oil-filters": "روغن-فیلتر",
  consumables: "لوازم-مصرفی",
};

export const CATEGORY_SLUG_FA_TO_EN: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_EN_TO_FA).map(([en, fa]) => [fa, en]),
);

/** Normalize category slug for facet maps (accept EN or FA). */
export function canonicalCategoryFacetKey(
  slug?: string | null,
): string | undefined {
  if (!slug) return undefined;
  const s = slug.trim();
  if (!s) return undefined;
  if (CATEGORY_SLUG_FA_TO_EN[s]) return CATEGORY_SLUG_FA_TO_EN[s];
  if (CATEGORY_SLUG_EN_TO_FA[s]) return s;
  return s;
}
