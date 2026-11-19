/**
 * ایمیل تراکنشی با Resend — fail-soft اگر کلید نباشد
 * env: RESEND_API_KEY, EMAIL_FROM (مثلاً فروشگاه <noreply@ghatehmashin.ir>)
 */
export type EmailResult =
 | { ok: true; id?: string }
 | { ok: false; error: string; skipped?: boolean };

export async function sendTransactionalEmail(opts: {
 to: string;
 subject: string;
 html: string;
 text?: string;
}): Promise<EmailResult> {
 const apiKey = process.env.RESEND_API_KEY?.trim();
 const from =
 process.env.EMAIL_FROM?.trim() ||
 process.env.RESEND_FROM?.trim() ||
 "قطعه ماشین <onboarding@resend.dev>";

 if (!apiKey) {
 console.warn("[email] skip: missing RESEND_API_KEY");
 return { ok: false, error: "missing_api_key", skipped: true };
 }
 if (!opts.to?.trim()) {
 return { ok: false, error: "empty_to" };
 }

 try {
 const res = await fetch("https://api.resend.com/emails", {
 method: "POST",
 headers: {
 Authorization: `Bearer ${apiKey}`,
 "Content-Type": "application/json",
 },
 body: JSON.stringify({
 from,
 to: [opts.to.trim()],
 subject: opts.subject,
 html: opts.html,
 text: opts.text || undefined,
 }),
 cache: "no-store",
 });
 const data = (await res.json().catch(() => ({}))) as {
 id?: string;
 message?: string;
 error?: { message?: string };
 };
 if (!res.ok) {
 const msg = data.error?.message || data.message || `http_${res.status}`;
 console.error("[email] resend failed", msg);
 return { ok: false, error: msg };
 }
 return { ok: true, id: data.id };
 } catch (e) {
 console.error("[email]", e);
 return { ok: false, error: e instanceof Error ? e.message : "send_failed" };
 }
}

function escapeHtml(s: string) {
 return s
 .replace(/&/g, "&amp;")
 .replace(/</g, "&lt;")
 .replace(/>/g, "&gt;")
 .replace(/"/g, "&quot;");
}

export async function emailOrderPlaced(opts: {
 to?: string | null;
 customerName?: string | null;
 orderId: string | number;
 amount?: string | number;
}) {
 if (!opts.to?.trim()) return { ok: false as const, error: "no_email", skipped: true };
 const name = escapeHtml(opts.customerName || "مشتری");
 const oid = escapeHtml(String(opts.orderId));
 const amt = escapeHtml(String(opts.amount ?? ""));
 return sendTransactionalEmail({
 to: opts.to,
 subject: `سفارش ${oid} ثبت شد — قطعه ماشین`,
 html: `<p>${name} عزیز،</p><p>سفارش <strong>${oid}</strong> با موفقیت ثبت شد.${amt ? ` مبلغ: <strong>${amt}</strong> تومان.` : ""}</p><p><a href="https://ghatehmashin.ir/داشبورد?tab=orders">پیگیری سفارش</a></p>`,
 text: `${name} عزیز، سفارش ${oid} ثبت شد.${amt ? ` مبلغ: ${amt} تومان.` : ""}`,
 });
}

export async function emailPaymentSuccess(opts: {
 to?: string | null;
 customerName?: string | null;
 orderId: string | number;
 amount?: string | number;
}) {
 if (!opts.to?.trim()) return { ok: false as const, error: "no_email", skipped: true };
 const name = escapeHtml(opts.customerName || "مشتری");
 const oid = escapeHtml(String(opts.orderId));
 const amt = escapeHtml(String(opts.amount ?? ""));
 return sendTransactionalEmail({
 to: opts.to,
 subject: `پرداخت سفارش ${oid} موفق — قطعه ماشین`,
 html: `<p>${name} عزیز،</p><p>پرداخت سفارش <strong>${oid}</strong> با موفقیت انجام شد.${amt ? ` مبلغ: <strong>${amt}</strong> تومان.` : ""}</p>`,
 text: `${name} عزیز، پرداخت سفارش ${oid} موفق بود.${amt ? ` مبلغ: ${amt} تومان.` : ""}`,
 });
}

export async function emailShipped(opts: {
 to?: string | null;
 customerName?: string | null;
 orderId: string | number;
 tracking?: string | null;
}) {
 if (!opts.to?.trim()) return { ok: false as const, error: "no_email", skipped: true };
 const name = escapeHtml(opts.customerName || "مشتری");
 const oid = escapeHtml(String(opts.orderId));
 const track = opts.tracking ? escapeHtml(String(opts.tracking)) : "";
 return sendTransactionalEmail({
 to: opts.to,
 subject: `سفارش ${oid} ارسال شد — قطعه ماشین`,
 html: `<p>${name} عزیز،</p><p>سفارش <strong>${oid}</strong> ارسال شد.${track ? ` کد رهگیری: <strong>${track}</strong>` : ""}</p>`,
 text: `${name} عزیز، سفارش ${oid} ارسال شد.${track ? ` کد رهگیری: ${track}` : ""}`,
 });
}

export async function emailStockBackInStock(opts: {
 to?: string | null;
 productLabel: string;
 link?: string | null;
}) {
 if (!opts.to?.trim()) return { ok: false as const, error: "no_email", skipped: true };
 const label = escapeHtml(opts.productLabel);
 const href = opts.link
  ? escapeHtml(
      opts.link.startsWith("http")
        ? opts.link
        : `https://ghatehmashin.ir${opts.link.startsWith("/") ? "" : "/"}${opts.link}`,
    )
  : "https://ghatehmashin.ir/محصولات";
 return sendTransactionalEmail({
 to: opts.to,
 subject: `موجود شد: ${opts.productLabel} — قطعه ماشین`,
 html: `<p>خبر خوب!</p><p><strong>${label}</strong> دوباره موجود شد.</p><p><a href="${href}">مشاهده محصول</a></p>`,
 text: `${opts.productLabel} دوباره موجود شد. ${opts.link || ""}`,
 });
}

export async function emailPriceAlert(opts: {
 to?: string | null;
 productLabel: string;
 link?: string | null;
 kind?: "price_drop" | "discount";
}) {
 if (!opts.to?.trim()) return { ok: false as const, error: "no_email", skipped: true };
 const label = escapeHtml(opts.productLabel);
 const kindLabel =
  opts.kind === "discount" ? "تخفیف روی" : "کاهش قیمت";
 const href = opts.link
  ? escapeHtml(
      opts.link.startsWith("http")
        ? opts.link
        : `https://ghatehmashin.ir${opts.link.startsWith("/") ? "" : "/"}${opts.link}`,
    )
  : "https://ghatehmashin.ir/محصولات";
 return sendTransactionalEmail({
 to: opts.to,
 subject: `${kindLabel} ${opts.productLabel} — قطعه ماشین`,
 html: `<p>${kindLabel} <strong>${label}</strong> فعال شد.</p><p><a href="${href}">مشاهده محصول</a></p>`,
 text: `${kindLabel} ${opts.productLabel}. ${opts.link || ""}`,
 });
}
