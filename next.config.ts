import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
 enabled: process.env.ANALYZE === "true"
});

const LONG_CACHE = "public, max-age=31536000, immutable";
const DAY_CACHE = "public, max-age=86400, stale-while-revalidate=604800";

const nextConfig: NextConfig = {
 compress: true,
 poweredByHeader: false,
 // صفحات پنل dynamic می‌مانند؛ فقط overhead کمتر

 experimental: {
 optimizePackageImports: [
 "lucide-react",
 "@radix-ui/react-icons",
 "@radix-ui/react-dropdown-menu",
 "@radix-ui/react-checkbox",
 "@radix-ui/react-label",
 "@radix-ui/react-slider",
 "@radix-ui/react-slot",
 "@radix-ui/react-tooltip",
 "@radix-ui/react-separator",
 "@radix-ui/react-navigation-menu",
 "date-fns",
 "date-fns-jalali",
 "framer-motion",
 "embla-carousel-react",
 "lucide-react",
 ],
},
 // Typed against refreshed src/types/database.ts — keep tsc clean; do not re-enable.
 typescript: { ignoreBuildErrors: false },

 async headers() {
 return [
 {
 source: "/hero/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/fonts/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/brand/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/brands/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/products/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/geo/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/_next/static/:path*",
 headers: [{ key: "Cache-Control", value: LONG_CACHE }],
 },
 {
 source: "/og-image.webp",
 headers: [{ key: "Cache-Control", value: DAY_CACHE }],
 },
 {
 source: "/favicon.ico",
 headers: [{ key: "Cache-Control", value: DAY_CACHE }],
 },
 {
 source: "/icon.png",
 headers: [{ key: "Cache-Control", value: DAY_CACHE }],
 },
 {
 source: "/icon.svg",
 headers: [{ key: "Cache-Control", value: DAY_CACHE }],
 },
 {
 source: "/apple-touch-icon.png",
 headers: [{ key: "Cache-Control", value: DAY_CACHE }],
 },
 {
 source: "/site.webmanifest",
 headers: [{ key: "Cache-Control", value: DAY_CACHE }],
 },
 {
 source: "/:path*",
 headers: [
 { key: "X-Frame-Options", value: "DENY" },
 { key: "X-Content-Type-Options", value: "nosniff" },
 {
 key: "Referrer-Policy",
 value: "strict-origin-when-cross-origin"
},
 {
 key: "Permissions-Policy",
 value: "camera=(), microphone=(), geolocation=()"
},
 {
 key: "Strict-Transport-Security",
 value: "max-age=63072000; includeSubDomains; preload"
},
 {
 key: "Content-Security-Policy",
 value: [
 "default-src 'self'",
 "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
 "style-src 'self' 'unsafe-inline'",
 "img-src 'self' data: blob: https://media.ghetemashin.ir https://*.supabase.co https://*.r2.dev https://placehold.co",
 "font-src 'self' data:",
 "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://rest.payamak-panel.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
 "media-src 'self' https://media.ghetemashin.ir",
 "object-src 'none'",
 "base-uri 'self'",
 "form-action 'self'",
 "frame-ancestors 'none'",
 "upgrade-insecure-requests",
 ].join("; ")
},
 ]
},
 ];
 },

 // Public storefront URLs are Persian; App Router folders stay English.
 async redirects() {
  return [
   { source: "/login", destination: "/ورود", permanent: true },
   { source: "/register", destination: "/ثبت-نام", permanent: true },
   { source: "/wishlist", destination: "/علاقه-مندی-ها", permanent: true },
   { source: "/compare", destination: "/مقایسه", permanent: true },
   { source: "/cart", destination: "/سبد-خرید", permanent: true },
   { source: "/checkout", destination: "/تسویه-حساب", permanent: true },
   { source: "/checkout/:path*", destination: "/تسویه-حساب/:path*", permanent: true },
   { source: "/recently-viewed", destination: "/آخرین-مشاهده-ها", permanent: true },
   { source: "/products", destination: "/محصولات", permanent: true },
   { source: "/products/:path*", destination: "/محصولات/:path*", permanent: true },
   { source: "/categories", destination: "/دسته-ها", permanent: true },
   { source: "/categories/:path*", destination: "/:path*", permanent: true },
   { source: "/brands", destination: "/برندها", permanent: true },
   { source: "/brands/:path*", destination: "/:path*", permanent: true },
   { source: "/blog", destination: "/بلاگ", permanent: true },
   { source: "/blog/:path*", destination: "/بلاگ/:path*", permanent: true },
   { source: "/search", destination: "/جستجو", permanent: true },
   { source: "/search/:path*", destination: "/جستجو/:path*", permanent: true },
   { source: "/contact", destination: "/تماس", permanent: true },
   { source: "/about", destination: "/درباره-ما", permanent: true },
   { source: "/faq", destination: "/سوالات-متداول", permanent: true },
   { source: "/terms", destination: "/شرایط-استفاده", permanent: true },
   { source: "/privacy", destination: "/حریم-خصوصی", permanent: true },
   { source: "/shipping", destination: "/ارسال", permanent: true },
   { source: "/returns", destination: "/مرجوعی", permanent: true },
   { source: "/warranty", destination: "/ضمانت", permanent: true },
   { source: "/size-guide", destination: "/راهنمای-سایز", permanent: true },
   { source: "/track", destination: "/پیگیری-سفارش", permanent: true },
   { source: "/track/:path*", destination: "/پیگیری-سفارش/:path*", permanent: true },
   { source: "/dashboard", destination: "/داشبورد", permanent: true },
   { source: "/dashboard/:path*", destination: "/داشبورد/:path*", permanent: true },
   { source: "/tag", destination: "/برچسب", permanent: true },
   { source: "/tag/:path*", destination: "/برچسب/:path*", permanent: true },
   // legacy English jewelry category slugs → Persian root
   { source: "/necklace", destination: "/گردنبند", permanent: true },
   { source: "/earring", destination: "/گوشواره", permanent: true },
   { source: "/ring", destination: "/انگشتر", permanent: true },
   { source: "/bracelet", destination: "/دستبند", permanent: true },
   { source: "/set", destination: "/ست", permanent: true },
   { source: "/accessory", destination: "/اکسسوری", permanent: true },
  ];
 },

 async rewrites() {
  return [
   { source: "/علاقه-مندی-ها", destination: "/wishlist" },
   { source: "/مقایسه", destination: "/compare" },
   { source: "/سبد-خرید", destination: "/cart" },
   { source: "/تسویه-حساب", destination: "/checkout" },
   { source: "/تسویه-حساب/:path*", destination: "/checkout/:path*" },
   { source: "/آخرین-مشاهده-ها", destination: "/recently-viewed" },
   { source: "/محصولات", destination: "/products" },
   { source: "/محصولات/:path*", destination: "/products/:path*" },
   { source: "/دسته-ها", destination: "/categories" },
   { source: "/دسته-ها/:path*", destination: "/categories/:path*" },
   { source: "/برندها", destination: "/brands" },
   { source: "/برندها/:path*", destination: "/brands/:path*" },
   { source: "/بلاگ", destination: "/blog" },
   { source: "/بلاگ/:path*", destination: "/blog/:path*" },
   { source: "/جستجو", destination: "/search" },
   { source: "/جستجو/:path*", destination: "/search/:path*" },
   { source: "/تماس", destination: "/contact" },
   { source: "/تماس-با-ما", destination: "/contact" },
   { source: "/درباره-ما", destination: "/about" },
   { source: "/سوالات-متداول", destination: "/faq" },
   { source: "/شرایط-استفاده", destination: "/terms" },
   { source: "/حریم-خصوصی", destination: "/privacy" },
   { source: "/ارسال", destination: "/shipping" },
   { source: "/مرجوعی", destination: "/returns" },
   { source: "/ضمانت", destination: "/warranty" },
   { source: "/راهنمای-سایز", destination: "/size-guide" },
   { source: "/پیگیری-سفارش", destination: "/track" },
   { source: "/پیگیری-سفارش/:path*", destination: "/track/:path*" },
   { source: "/پیگیری", destination: "/track" },
   { source: "/داشبورد", destination: "/dashboard" },
   { source: "/داشبورد/:path*", destination: "/dashboard/:path*" },
   { source: "/برچسب", destination: "/tag" },
   { source: "/برچسب/:path*", destination: "/tag/:path*" },
   { source: "/ورود", destination: "/login" },
   { source: "/%D9%88%D8%B1%D9%88%D8%AF", destination: "/login" },
   { source: "/ثبت-نام", destination: "/register" },
   { source: "/%D8%AB%D8%A8%D8%AA-%D9%86%D8%A7%D9%85", destination: "/register" },
  ];
 },

 images: {
  formats: ["image/avif", "image/webp"],
  deviceSizes: [640, 750, 828, 1080, 1200],
  imageSizes: [16, 32, 48, 64, 96, 128, 256],
  qualities: [65, 75, 80],
  minimumCacheTTL: 60 * 60 * 24 * 365,
  remotePatterns: [
   {
    protocol: "https",
    hostname: "placehold.co",
   },
   {
    protocol: "https",
    hostname: "*.supabase.co",
   },
   {
    protocol: "https",
    hostname: "media.ghetemashin.ir",
   },
   {
    protocol: "https",
    hostname: "**.r2.dev",
   },
  ],
 },
};

export default withBundleAnalyzer(nextConfig);
