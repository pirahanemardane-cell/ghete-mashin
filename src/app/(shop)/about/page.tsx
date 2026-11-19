import type { Metadata } from "next";
import { About3 } from "@/components/ui/about-3";

export const metadata: Metadata = {
 title: "درباره ما | قطعه ماشین",
 description:
 "فروشگاه تخصصی قطعات یدکی خودرو — موتور، ترمز، تعلیق، برق، بدنه و لوازم مصرفی",
};

export default function AboutPage() {
 return (
 <About3
 title="درباره قطعه ماشین"
 description="قطعه ماشین فروشگاه آنلاین قطعات یدکی است. روی سازگاری دقیق با خودرو، شفافیت مشخصات و پشتیبانی پس از خرید تمرکز داریم."
 breakout={{
 src: "",
 alt: "قطعه ماشین",
 title: "قطعات یدکی باکیفیت",
 description:
 "موتور، ترمز، برق و بدنه — با فیلتر برند و مدل خودرو و راهنمای انتخاب قطعه.",
 buttonText: "مشاهده محصولات",
 buttonUrl: "/محصولات",
 }}
 companiesTitle="تمرکز ما"
 companies={[]}
 achievementsTitle="آنچه برای شما می‌سازیم"
 achievementsDescription="فروشگاه تخصصی، نه همه‌چیزفروشی."
 achievements={[
 { label: "تمرکز", value: "قطعات یدکی" },
 { label: "سازگاری", value: "برند و مدل" },
 { label: "مرجوعی", value: "شفاف" },
 { label: "پشتیبانی", value: "واقعی" },
 ]}
 />
 );
}
