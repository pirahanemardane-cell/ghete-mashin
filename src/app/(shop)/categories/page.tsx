import type { Metadata } from "next";
import Link from "next/link";
import { CategoryRepository } from "@/repositories/category.repository";
import { CAR_PARTS_CATEGORIES } from "@/lib/car-parts-categories";
import { CategorySvgIcon } from "@/components/home/category-icons";
import { EmptyBlock } from "@/components/ui/ui-state-blocks";
import { STOREFRONT_PATHS } from "@/lib/seo/storefront-paths";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "دسته‌ها",
  description: "دسته‌بندی قطعات یدکی — موتور، ترمز، برق، بدنه و لوازم مصرفی",
  alternates: { canonical: STOREFRONT_PATHS.categories },
};

export default async function CategoriesIndexPage() {
  const repo = new CategoryRepository();
  let cats: { id: string; name: string; slug: string }[] = [];
  try {
    const all = await repo.findAllActive();
    cats = (all ?? [])
      .filter((c) => !c.parent_id)
      .sort(
        (a, b) =>
          (a.sort_order ?? 0) - (b.sort_order ?? 0) ||
          String(a.name).localeCompare(String(b.name), "fa"),
      )
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
  } catch {
    cats = [];
  }

  const list =
    cats.length > 0
      ? cats
      : CAR_PARTS_CATEGORIES.map((c) => ({
          id: c.slug,
          name: c.name,
          slug: c.slug,
        }));

  return (
    <main className="mx-auto w-full max-w-none px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-primary font-iranyekan-heavy text-2xl md:text-3xl">
          دسته‌ها
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          موتور، ترمز، برق، بدنه، روغن و فیلتر و بیشتر
        </p>
      </div>

      {list.length === 0 ? (
        <EmptyBlock
          title="دسته‌ای ثبت نشده"
          description="به‌زودی دسته‌بندی‌ها اینجا نمایش داده می‌شوند."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4">
          {list.map((c) => (
            <Link
              key={c.id}
              href={`/${encodeURIComponent(c.slug)}`}
              className="bg-card hover:border-foreground/20 hover:bg-muted/40 flex items-center gap-3 rounded-2xl border px-4 py-4 transition-colors"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-black ring-1 ring-black/10">
                <CategorySvgIcon
                  name={c.name}
                  slug={c.slug}
                  className="h-5 w-5 text-black"
                />
              </span>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
