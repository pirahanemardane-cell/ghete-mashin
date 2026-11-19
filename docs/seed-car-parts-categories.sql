-- =====================================================
-- Owner-run: seed default auto-parts categories (Persian slugs)
-- Idempotent. Restores home/mega category tiles + icons.
-- Run in Supabase Dashboard → SQL Editor → Paste → Run.
-- Source of truth in repo:
--   supabase/migrations/068_seed_car_parts_categories.sql
--   docs/seed-car-parts-categories.sql
-- Slugs: موتور, ترمز-تعلیق, برق, بدنه, روغن-فیلتر, لوازم-مصرفی
-- =====================================================

BEGIN;

UPDATE public.categories AS c
SET
  slug = m.fa,
  updated_at = now()
FROM (
  VALUES
    ('engine', 'موتور'),
    ('brakes', 'ترمز-تعلیق'),
    ('electrical', 'برق'),
    ('body', 'بدنه'),
    ('filters', 'روغن-فیلتر'),
    ('consumables', 'لوازم-مصرفی')
) AS m(en, fa)
WHERE c.slug = m.en
  AND NOT EXISTS (
    SELECT 1 FROM public.categories x WHERE x.slug = m.fa AND x.id <> c.id
  );

INSERT INTO public.categories (
  name,
  slug,
  description,
  sort_order,
  is_active,
  parent_id,
  meta_title,
  meta_description
)
VALUES
  (
    'موتور و قطعات موتوری',
    'موتور',
    'پیستون، واشر، تسمه و قطعات موتور',
    10,
    true,
    NULL,
    'موتور | قطعه ماشین',
    'خرید قطعات موتور و گیربکس'
  ),
  (
    'ترمز و تعلیق',
    'ترمز-تعلیق',
    'لنت، دیسک، کمک‌فنر و سیستم ترمز',
    20,
    true,
    NULL,
    'ترمز و تعلیق | قطعه ماشین',
    'خرید قطعات ترمز و تعلیق'
  ),
  (
    'برق و الکتریک',
    'برق',
    'باتری، دینام، شمع و سیم‌کشی',
    30,
    true,
    NULL,
    'برق | قطعه ماشین',
    'خرید قطعات برق و الکتریک خودرو'
  ),
  (
    'بدنه و شیشه',
    'بدنه',
    'سپر، چراغ، آینه و شیشه',
    40,
    true,
    NULL,
    'بدنه | قطعه ماشین',
    'خرید قطعات بدنه و شیشه'
  ),
  (
    'روغن و فیلتر',
    'روغن-فیلتر',
    'روغن موتور، فیلتر هوا و روغن',
    50,
    true,
    NULL,
    'روغن و فیلتر | قطعه ماشین',
    'خرید روغن و فیلتر خودرو'
  ),
  (
    'لوازم مصرفی',
    'لوازم-مصرفی',
    'تیغه برف‌پاک‌کن، شمع و لوازم سرویس',
    60,
    true,
    NULL,
    'لوازم مصرفی | قطعه ماشین',
    'خرید لوازم مصرفی خودرو'
  )
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = COALESCE(EXCLUDED.description, public.categories.description),
  sort_order = EXCLUDED.sort_order,
  is_active = true,
  parent_id = NULL,
  meta_title = COALESCE(EXCLUDED.meta_title, public.categories.meta_title),
  meta_description = COALESCE(EXCLUDED.meta_description, public.categories.meta_description),
  updated_at = now();

INSERT INTO public.url_redirects (from_path, to_path, status_code, source, note, is_active)
VALUES
  ('/engine', '/موتور', 301, 'system', 'persian category slug', true),
  ('/brakes', '/ترمز-تعلیق', 301, 'system', 'persian category slug', true),
  ('/electrical', '/برق', 301, 'system', 'persian category slug', true),
  ('/body', '/بدنه', 301, 'system', 'persian category slug', true),
  ('/filters', '/روغن-فیلتر', 301, 'system', 'persian category slug', true),
  ('/consumables', '/لوازم-مصرفی', 301, 'system', 'persian category slug', true),
  ('/categories/engine', '/موتور', 301, 'system', 'persian category slug', true),
  ('/categories/brakes', '/ترمز-تعلیق', 301, 'system', 'persian category slug', true),
  ('/categories/electrical', '/برق', 301, 'system', 'persian category slug', true),
  ('/categories/body', '/بدنه', 301, 'system', 'persian category slug', true),
  ('/categories/filters', '/روغن-فیلتر', 301, 'system', 'persian category slug', true),
  ('/categories/consumables', '/لوازم-مصرفی', 301, 'system', 'persian category slug', true)
ON CONFLICT (from_path) DO UPDATE
SET
  to_path = EXCLUDED.to_path,
  status_code = 301,
  is_active = true,
  updated_at = now();

COMMIT;