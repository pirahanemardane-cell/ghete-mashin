import { describe, expect, it } from "vitest";
import { resolveCategoryIconId } from "@/components/home/category-icons";

describe("resolveCategoryIconId", () => {
  it("maps Persian auto-parts category names", () => {
    expect(resolveCategoryIconId("موتور و قطعات موتوری", "موتور")).toBe(
      "default",
    );
    expect(resolveCategoryIconId("ترمز و تعلیق", "ترمز-تعلیق")).toBe("ring");
    expect(resolveCategoryIconId("برق و الکتریک", "برق")).toBe("earring");
    expect(resolveCategoryIconId("بدنه و شیشه", "بدنه")).toBe("necklace");
    expect(resolveCategoryIconId("روغن و فیلتر", "روغن-فیلتر")).toBe("bracelet");
    expect(resolveCategoryIconId("لوازم مصرفی", "لوازم-مصرفی")).toBe("set");
  });

  it("maps English slugs from href-style paths", () => {
    expect(resolveCategoryIconId(null, "/engine")).toBe("default");
    expect(resolveCategoryIconId(null, "/موتور")).toBe("default");
    expect(resolveCategoryIconId(null, "/brakes")).toBe("ring");
    expect(resolveCategoryIconId(null, "/electrical")).toBe("earring");
    expect(resolveCategoryIconId(null, "/body")).toBe("necklace");
    expect(resolveCategoryIconId(null, "/filters")).toBe("bracelet");
    expect(resolveCategoryIconId(null, "/consumables")).toBe("set");
  });

  it("falls back to default for misc", () => {
    expect(resolveCategoryIconId("متفرقه", "misc")).toBe("default");
  });

  it("maps all CAR_PARTS_CATEGORIES slugs to expected icons", async () => {
    const { CAR_PARTS_CATEGORIES } = await import("@/lib/car-parts-categories");
    for (const cat of CAR_PARTS_CATEGORIES) {
      expect(resolveCategoryIconId(cat.name, cat.slug)).toBe(cat.icon);
    }
  });
});