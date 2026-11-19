# Go-live — قطعه ماشین | ghetemashin.ir

Stack: **Vercel** (Next.js, fra1) + **Supabase** + **Cloudflare** (DNS + R2).  
Images: uploaded to **Cloudflare R2**; resized/watermarked with **Sharp** inside the Next.js app (`src/lib/process-product-image.ts`) — no separate image worker.

## Env source of truth

Copy `.env.example` → Vercel Project → Settings → Environment Variables (Production).  
Do not invent secrets; paste values from each console.

### Required for a working shop + images

| Variable | Where to get it |
|----------|-----------------|
| `NEXT_PUBLIC_SITE_URL` | `https://ghetemashin.ir` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same |
| `SUPABASE_SERVICE_ROLE_KEY` | same (server only) |
| `R2_ACCOUNT_ID` | Cloudflare → R2 |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 → Manage API tokens |
| `R2_BUCKET_NAME` | e.g. `ghetemashin-media` |
| `R2_PUBLIC_BASE_URL` | custom domain e.g. `https://media.ghetemashin.ir` or `https://….r2.dev` |
| `CRON_SECRET` | generate a long random string |

### Strongly recommended

`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`

### Optional / later

SMS Melipayamak vars, `ZARINPAL_MERCHANT_ID`, Resend (`RESEND_API_KEY`, `EMAIL_FROM`), `NEXT_PUBLIC_ALLOW_INDEX=true` only when content is ready.

## Ordered human checklist (Grok bot / owner)

1. **Cloudflare DNS** — Add zone for `ghetemashin.ir` (or transfer NS). Keep DNS only / proxy as needed for apex later.
2. **Vercel project** — Import `pirahanemardane-cell/ghete-mashin`, region **fra1**, Production branch `main` (or merge this PR first).
3. **Domain on Vercel** — Add `ghetemashin.ir` (+ `www` if desired). Copy the DNS records Vercel shows.
4. **Cloudflare DNS records** — Create the A/CNAME (and `www`) records Vercel requires. For R2 public media, add `media.ghetemashin.ir` → R2 custom domain when bucket is ready.
5. **Supabase** — Create project; run all SQL in `supabase/migrations/` in order (SQL Editor or CLI). Copy URL + anon + service role keys.
6. **R2** — Create bucket `ghetemashin-media` (or chosen name); create S3 API token with Object Read/Write; attach public access / custom domain `media.ghetemashin.ir`.
7. **Vercel env vars** — Paste every required key from `.env.example` (empty placeholders only in git). Redeploy.
8. **Sharp / images** — No separate Cloudflare Worker. Confirm `sharp` builds on Vercel; upload one product image in admin and confirm variants land in R2 under `R2_PUBLIC_BASE_URL`.
9. **Verify** — `https://ghetemashin.ir` loads; `https://ghetemashin.ir/api/health` ok; admin login; one catalog page; TLS valid.

## Notes

- `vercel.json` already sets region `fra1` and cron paths; needs `CRON_SECRET` in Vercel.
- CSP / `images.remotePatterns` allow `media.ghetemashin.ir` and `**.r2.dev`.
- Keep `NEXT_PUBLIC_ALLOW_INDEX=false` until catalog is ready.
