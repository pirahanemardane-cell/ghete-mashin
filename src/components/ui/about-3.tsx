import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

interface About3Props {
 title?: string;
 description?: string;
 mainImage?: { src: string; alt: string };
 secondaryImage?: { src: string; alt: string };
 breakout?: {
 src: string;
 alt: string;
 title?: string;
 description?: string;
 buttonText?: string;
 buttonUrl?: string;
 };
 companiesTitle?: string;
 companies?: Array<{ src: string; alt: string }>;
 achievementsTitle?: string;
 achievementsDescription?: string;
 achievements?: Array<{ label: string; value: string }>;
}

const defaultAchievements = [
 { label: "تمرکز تخصصی", value: "قطعات یدکی" },
 { label: "سازگاری", value: "برند و مدل" },
 { label: "مرجوعی", value: "شفاف" },
 { label: "پشتیبانی", value: "واقعی" },
];

export function About3({
 title = "درباره ما",
 description = "قطعه ماشین؛ فروشگاه آنلاین قطعات یدکی — موتور، ترمز، تعلیق، برق، بدنه و لوازم مصرفی.",
 // Unused in layout today; kept optional for callers. No stock/demo URLs.
 mainImage,
 secondaryImage,
 breakout = {
 src: "",
 alt: "قطعه ماشین",
 title: "قطعات یدکی باکیفیت",
 description:
 "سازگاری دقیق با خودرو، مشخصات شفاف و پشتیبانی واقعی پس از خرید.",
 buttonText: "مشاهده محصولات",
 buttonUrl: "/محصولات",
 },
 companiesTitle = "تمرکز ما",
 companies = [],
 achievementsTitle = "آنچه برای خریدار مهم است",
 achievementsDescription = "قطعات یدکی، راهنمای سازگاری شفاف، ارسال مطمئن و پشتیبانی واقعی.",
 achievements = defaultAchievements,
}: About3Props = {}) {
 void mainImage;
 void secondaryImage;
 return (
 <section className="py-8 md:py-12" dir="rtl">
 <div className="mx-auto w-full max-w-none px-4">
 <div className="mb-8 text-right">
 <h1 className="text-2xl md:text-3xl font-iranyekan-heavy text-primary">
 {title}
 </h1>
 {description ? (
 <p className="text-muted-foreground mt-1 text-sm">
 {description}
 </p>
 ) : null}
 </div>

 <div className="mx-auto max-w-xl">
 <div className="bg-secondary/10 border-secondary/20 flex flex-col justify-between gap-6 rounded-xl border p-7">
 <div>
 <p className="text-foreground mb-3 text-lg font-semibold">
 {breakout.title}
 </p>
 <div className="mb-3" aria-label={breakout.alt || "قطعه ماشین"}>
 <Logo size="lg" className="pointer-events-none" />
 </div>
 {breakout.description ? (
 <p className="text-muted-foreground">{breakout.description}</p>
 ) : null}
 </div>
 <Button
 variant="outline"
 className="border-secondary text-secondary hover:bg-secondary/10 ml-auto"
 render={<a href={breakout.buttonUrl} />}
 >
 {breakout.buttonText}
 </Button>
 </div>
 </div>

 {companies.length > 0 ? (
 <div className="py-20">
 <p className="text-center">{companiesTitle}</p>
 <div className="mt-8 flex flex-wrap justify-center gap-8">
 {companies.map((company, idx) => (
 <div className="flex items-center gap-3" key={company.src + idx}>
 {/* eslint-disable-next-line @next/next/no-img-element */}
 <img
 src={company.src}
 alt={company.alt}
 className="h-6 w-auto md:h-8"
 />
 </div>
 ))}
 </div>
 </div>
 ) : (
 <div className="py-16 text-center">
 <p className="text-muted-foreground text-sm">{companiesTitle}</p>
 <p className="text-secondary mt-2 text-lg font-medium">
 قطعات یدکی · موتور · ترمز · برق · بدنه · روغن و فیلتر
 </p>
 </div>
 )}

 <div className="bg-secondary/10 relative overflow-hidden rounded-xl p-10 md:p-16">
 <div className="flex flex-col gap-4 text-center md:text-right">
 <h2 className="text-secondary text-3xl font-thin md:text-4xl">
 {achievementsTitle}
 </h2>
 <p className="text-muted-foreground max-w-screen-sm">
 {achievementsDescription}
 </p>
 </div>
 <div className="mt-10 flex flex-wrap justify-between gap-10 text-center">
 {achievements.map((item, idx) => (
 <div className="flex flex-col gap-2" key={item.label + idx}>
 <p className="text-muted-foreground text-sm">{item.label}</p>
 <span className="text-secondary text-3xl font-semibold md:text-4xl">
 {item.value}
 </span>
 </div>
 ))}
 </div>
 </div>
 </div>
 </section>
 );
}

export default About3;
