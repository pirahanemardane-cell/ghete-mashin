import type { Metadata } from "next";
import { Suspense } from "react";
import { HomeBelowFold } from "@/components/home/home-below-fold";
import PolaroidLineCarousel from "@/components/ui/polaroid-line-carousel";

// ISR: HTML کش‌شده ۶۰ ثانیه
export const revalidate = 60;

export const metadata: Metadata = {
  title: "قطعه ماشین | فروشگاه قطعات یدکی خودرو",
  description:
    "خرید قطعات یدکی موتور، ترمز، تعلیق، برق، بدنه و روغن و فیلتر با فیلتر برند و مدل خودرو",
};

const HERO_SLIDES = [
  {
    image: "/hero/polaroid-earring.webp",
    alt: "قطعات برق و الکتریک خودرو",
  },
  {
    image: "/hero/polaroid-01.webp",
    alt: "قطعات یدکی خودرو",
  },
  {
    image: "/hero/polaroid-02.webp",
    alt: "لوازم موتور و گیربکس",
  },
  {
    image: "/hero/polaroid-03.webp",
    alt: "لوازم بدنه و شیشه",
  },
  {
    image: "/hero/polaroid-04.webp",
    alt: "قطعات ترمز و تعلیق",
  },
  {
    image: "/hero/polaroid-05.webp",
    alt: "فیلتر و روغن موتور",
  },
] as const;

/** Early LCP hints — middle polaroid (initial active print) for the carousel. */
function HomeHeroPreloads() {
  return (
    <link
      rel="preload"
      as="image"
      href="/hero/polaroid-02.webp"
      type="image/webp"
    />
  );
}

/**
 * Sync shell: polaroid carousel streams in the first paint.
 * Catalog/DB sections suspend separately so layout footer cannot win the race.
 */
export default function HomePage() {
  return (
    <>
      <HomeHeroPreloads />
      <PolaroidLineCarousel
        showChrome={false}
        slides={[...HERO_SLIDES]}
        height={null}
        className="h-[min(70svh,22rem)] md:h-[min(100svh,36rem)]"
        background="var(--background)"
        ariaLabel="گالری عکس محصولات"
      />
      <Suspense fallback={null}>
        <HomeBelowFold />
      </Suspense>
    </>
  );
}
