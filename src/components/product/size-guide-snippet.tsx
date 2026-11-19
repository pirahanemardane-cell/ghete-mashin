import Link from "next/link";

export function SizeGuideSnippet(_props: { guide?: unknown }) {
  return (
    <p className="text-muted-foreground text-xs">
      <Link
        href="/راهنمای-سایز"
        className="text-primary font-medium underline-offset-4 hover:underline"
      >
        راهنمای انتخاب قطعه متناسب با خودرو
      </Link>
    </p>
  );
}
