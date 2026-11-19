# Deployment Strategy — قطعه ماشین

نسخه: ۱.۱ | دامنه: https://ghetemashin.ir

## محیط‌ها
| محیط | شاخه | میزبان | دامنه |
|------|------|--------|--------|
| Production | main | Vercel fra1 | https://ghetemashin.ir |
| Preview | هر PR / شاخه | Vercel Preview | *.vercel.app |
| Staging جدا | فعلاً نیست | — | عمداً بعد از محتوای واقعی |

## جریان استاندارد
1. تغییر روی `feat/*` / `cursor/*` سپس PR → merge به `main`
2. `git push` → Vercel خودکار build
3. Smoke: `/api/health` + یک صفحه فروشگاه + یک صفحه ادمین
4. شکست build: fix و push مجدد؛ rollback از داشبورد Vercel

## Migration دیتابیس
1. فایل جدید در `supabase/migrations/`
2. در Supabase SQL Editor اجرا (یا CLI)
3. هرگز migration را فقط در کد نگذار بدون اجرا روی production

## Env
- منبع حقیقت: Vercel Project Settings
- الگوی محلی / لیست کامل: `.env.example`
- چک‌لیست لانچ: [GO-LIVE.md](./GO-LIVE.md)
- Service Role / R2 / Upstash / CRON_SECRET فقط server

## تصاویر
- آپلود → Sharp در اپ Vercel → آبجکت‌ها در Cloudflare R2
- `R2_PUBLIC_BASE_URL` باید با دامنه عمومی باکت یکی باشد (مثلاً `https://media.ghetemashin.ir`)

## Cron
- مسیرها در `vercel.json`؛ هدر `Authorization: Bearer $CRON_SECRET`

## ایندکس گوگل
- پیش‌فرض: noindex تا `NEXT_PUBLIC_ALLOW_INDEX=true` + محتوای واقعی + QA

## Rollback سریع
1. Vercel → Deployments → Promote previous Ready
2. اگر migration مخرب بود: SQL اصلاحی فوری + redeploy

## ممنوع
- force-push روی main بدون هماهنگی
- commit کردن `.env` واقعی
- تغییر RLS بدون تست با anon key
