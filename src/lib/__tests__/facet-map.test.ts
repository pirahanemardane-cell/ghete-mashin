import { describe, expect, it } from "vitest";
import {
  LEGACY_ATTR_BLOCKLIST,
  filterCarPartsFacets,
  filterPartSizeChips,
  isAllowedCarPartsAttrSlug,
  isApparelAttrSlug,
  parseAttrFacetsFromParams,
  parseInStockParam,
} from "@/lib/facet-map";

describe("facet-map car-parts standards", () => {
  it("blocks legacy jewelry/apparel attribute slugs", () => {
    for (const slug of LEGACY_ATTR_BLOCKLIST) {
      expect(isApparelAttrSlug(slug)).toBe(true);
      expect(isAllowedCarPartsAttrSlug(slug)).toBe(false);
    }
  });

  it("allows vehicle fitment and part metadata facets", () => {
    expect(isAllowedCarPartsAttrSlug("vehicle-brand")).toBe(true);
    expect(isAllowedCarPartsAttrSlug("vehicle-model")).toBe(true);
    expect(isAllowedCarPartsAttrSlug("vehicle-year")).toBe(true);
    expect(isAllowedCarPartsAttrSlug("part-origin")).toBe(true);
    expect(isAllowedCarPartsAttrSlug("part-condition")).toBe(true);
  });

  it("filters facets by parts category", () => {
    const facets = [
      { slug: "fabric" },
      { slug: "vehicle-brand" },
      { slug: "vehicle-model" },
      { slug: "viscosity" },
      { slug: "metal" },
      { slug: "position" },
    ];
    const brakes = filterCarPartsFacets(facets, "ترمز-تعلیق").map((f) => f.slug);
    expect(brakes).toContain("vehicle-brand");
    expect(brakes).toContain("position");
    expect(brakes).not.toContain("fabric");
    expect(brakes).not.toContain("metal");
    expect(brakes).not.toContain("viscosity");

    const oil = filterCarPartsFacets(facets, "روغن-فیلتر").map((f) => f.slug);
    expect(oil).toContain("viscosity");
    expect(oil).not.toContain("position");

    const all = filterCarPartsFacets(facets).map((f) => f.slug);
    expect(all).toContain("vehicle-brand");
    expect(all).toContain("vehicle-model");
    expect(all).not.toContain("fabric");
  });

  it("drops apparel letter sizes from chips", () => {
    const sizes = filterPartSizeChips([
      { slug: "m", name: "M" },
      { slug: "54", name: "۵۴" },
      { slug: "xl", name: "XL" },
      { slug: "58", name: "۵۸" },
    ]);
    expect(sizes.map((s) => s.slug)).toEqual(["54", "58"]);
  });

  it("parses parts attr + inStock URL params", () => {
    expect(
      parseAttrFacetsFromParams({
        "vehicle-brand": "peugeot",
        fabric: "cotton",
        "vehicle-year": "1400",
      }),
    ).toEqual({ "vehicle-brand": "peugeot", "vehicle-year": "1400" });
    expect(parseInStockParam("1")).toBe(true);
    expect(parseInStockParam("0")).toBeUndefined();
  });
});