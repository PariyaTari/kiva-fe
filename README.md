# کیوا — فروشگاه آنلاین (Kiva Storefront)

فرانت‌اند فروشگاه آنلاین **کیوا**؛ فروشگاه کیف‌های مینیمال با شعار «هرچی ببینی، همون می‌رسه».

بر پایه‌ی **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS** + **TanStack Query**، به‌صورت راست‌به‌چپ (RTL) و فارسی — با همان ساختار و قراردادهای پروژه‌ی `avand-fe`.

- طرح‌ها: `D:\pariya\kiva` (HTML/CSS استاتیک — `assets/kiva.css` منبع دیزاین‌سیستم)
- قرارداد API: `D:\pariya\kiva-openapi.yml`

## اجرا

```bash
npm install
npm run dev
```

سپس [http://localhost:3000](http://localhost:3000) را باز کنید. آدرس API در `.env` (`NEXT_PUBLIC_API_URL`) است.

## ساختار

```
src/
├── app/
│   ├── layout.tsx              — html/body، QueryProvider، توست‌ها، اسکریپت تم بدون فلش
│   ├── queryProvider.tsx       — کانفیگ TanStack Query + توست سراسری خطا (meta)
│   ├── globals.css             — سیستم رنگ و تم (لایت/دارک) + فونت یکان‌بخ + متریک هدر
│   ├── page.tsx                — صفحه‌ی اصلی (پایه)
│   ├── error.tsx / not-found.tsx
│   ├── icon.svg                — فاوآیکن
│   ├── _components/
│   │   ├── site/               — پوسته‌ی فروشگاه: shell، header، announcementBar، mobileMenu، footer، nav.ts
│   │   ├── common/             — logo، notification (توست)، theme-toggle
│   │   ├── ui/                 — اجزای پایه: Button، Badge، Card، Input، Select، DatePicker، Modal، Spinner
│   │   └── icon/               — آیکن‌ست خطی کیوا (BaseIcon + icons.tsx)
│   └── <feature>/              — هر بخش (مثلاً products، cart، blog) یک پوشه — الگوی پایین
├── config/                     — global.ts (env)، site.ts (برند، پشتیبانی، شبکه‌های اجتماعی، نوار اطلاعیه)
├── httpClient/                 — HttpClient (axios) + mapError / isRetryAble / Response
├── hooks/                      — useForm
├── store/                      — zustand (notification.store)
├── types/                      — تایپ‌های مشترک (apiResponse، pageinate، result، react-query.d.ts، ...)
├── utils/                      — withMappedError، validators، digits، normalizePhone، generateId
├── regex/                      — mobileRegex
└── tailwind/components.css     — لایه‌ی کامپوننت‌های CSS (اسکرول‌بار و ...)
```

### الگوی یک فیچر

```
src/app/products/
├── layout.tsx                  — <SiteShell>{children}</SiteShell>
├── page.tsx                    — هدر صفحه + کامپوننت اصلی
├── [slug]/page.tsx
├── _api/productEndpoints.ts    — توابع خالص درخواست (بدون مفاهیم React Query)
├── _components/<name>/<name>.tsx (+ <name>.type.ts)
├── _types/product.type.ts      — تایپ‌ها، هم‌نام با schemaهای OpenAPI
└── _utils/format.ts
```

- `useQuery` / `useMutation` مستقیم در کامپوننت؛ هر `queryFn`/`mutationFn` داخل `withMappedError`.
- پاسخ‌های موفق API بدون envelope هستند → در endpoint مستقیم `res.data` برگردانده می‌شود.
- لیست‌ها `{ items, meta }` هستند (`Paginate<T>` در `types/pageinate.ts`)؛ صفحه‌بندی `page` (از ۱) و `size`.
- خطاها RFC 7807 با `code` ماشینی‌اند؛ `mapError` آن‌ها را به `ResultError` تبدیل می‌کند (`code`، `description`، `errorDetails` برای خطای فیلدها و `meta`).

## پوسته و هدر

هدر شناور (`fixed`) روی صفحه قرار می‌گیرد. صفحه‌ای که از بالای صفحه شروع می‌شود، فاصله‌ی بخش اولش را با
`pt-[calc(var(--site-top)+…)]` می‌دهد تا پس‌زمینه‌اش زیر هدر ادامه پیدا کند (نمونه: `page.tsx` و `not-found.tsx`).

## رنگ و تم

- `tailwind.config.ts` — پالت برند: `primary` (بنفش/یاسی)، `secondary` (کرم/طلایی)، `slate` (خنثی با تهِ رنگ جوهری) و رنگ‌های وضعیت
- توکن‌های تم (`bg-surface`، `text-theme-text`، `bg-brand`، ...) با ویژگی `data-theme` روی `<html>` سوییچ می‌شوند و در `localStorage` (کلید `kiva-theme`) ذخیره می‌گردند.
- ⚠️ در Tailwind 3 مدیفایر شفافیت روی توکن‌های `var(...)` (مثل `bg-brand/10`) **هیچ CSSای تولید نمی‌کند**؛ برای شفافیت از رنگ‌های پالت استفاده کنید (`bg-primary-600/10`).

## هنوز در پایه نیست

- احراز هویت (OTP + JWT) و هر چیز وابسته به آن (گارد مسیر، هدر `Authorization`، رفرش توکن، هندل ۴۰۱)
- سبد مهمان (`X-Cart-Token`) و `Idempotency-Key` ثبت سفارش
- اتصال پوسته به `GET /config` (فعلاً مقادیر ثابت در `config/site.ts` و `_components/site/nav.ts`)
