# کیوا — فروشگاه آنلاین (Kiva Storefront)

فرانت‌اند فروشگاه آنلاین **کیوا**؛ فروشگاه کیف‌های مینیمال با شعار «هرچی ببینی، همون می‌رسه».

بر پایه‌ی **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS 3** + **TanStack Query v5** + **Zustand**، راست‌به‌چپ و فارسی — با همان ساختار و قراردادهای پروژه‌ی `avand-fe`.

- طرح‌ها: `D:\pariya\kiva` (HTML/CSS استاتیک؛ `assets/kiva.css` منبع دیزاین‌سیستم)
- قرارداد API: `D:\pariya\kiva-openapi.yml` (نسخه‌ی 1.0.1)
- استانداردها: اسکیل‌های `data-fetching` و `error-ui`

## اجرا (محیط توسعه)

| سرویس | دستور | پورت |
|---|---|---|
| Next.js | `npx next dev -p 3100` | 3100 |
| Mock API | `MOCK_FE_ORIGIN=http://localhost:3100 node --watch mock/server.mjs` (یا `npm run mock`) | 8080 |
| دیزاین (فقط برای مقایسه) | `python -m http.server 5500 --directory D:\pariya\kiva` | 5500 |

هر سه در `.claude/launch.json` هم تعریف شده‌اند (`kiva-dev`، `kiva-mock`، `kiva-design`).

```env
# .env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1/"
```

با عوض کردن `NEXT_PUBLIC_API_URL` به بک‌اند واقعی وصل می‌شود.

> `npm install` روی این سیستم با تنظیمات پیش‌فرض timeout می‌شد؛ با `--maxsockets=6 --fetch-timeout=120000 --fetch-retries=5` درست شد.

### بک‌اند Mock (`mock/`)

پیاده‌سازی بخش فروشگاهی OpenAPI در حافظه، بدون وابستگی، با داده‌های خود دیزاین (`data.mjs`) و تصاویر SVG کیف/کاور (`art.mjs`).

- **ورود:** هر کد ۵ رقمی پذیرفته می‌شود، جز `00000` (← `OTP_INVALID`). کاربر جدید داده‌ی نمونه دارد (۴ سفارش، یک آدرس، ۳ علاقه‌مندی، ۲ نظر).
- **کد تخفیف:** `KIVA10`، `WELCOME`، `PAEEZ15`.
- **پرداخت:** `payment.redirect` به یک بانک آزمایشی (`/mock-gateway/:id`) می‌رود با دو دکمه‌ی «پرداخت موفق» و «انصراف»؛ بعد به `/checkout/result?paymentId=…` برمی‌گردد. `POST /payments/{id}/retry` هم هست.
- **پیگیری:** شماره‌سفارش‌هایی که با `0000` تمام می‌شوند «پیدا نشد» می‌دهند؛ بقیه یک سفارش نمونه.
- حالت حافظه‌ای است: با هر ری‌استارت (مثلاً `--watch` بعد از ویرایش) کاربرها و توکن‌ها پاک می‌شوند.

## صفحات

| مسیر | دیزاین |
|---|---|
| `/` | `index.html` |
| `/products` | `products.html` (فیلترها در URL) |
| `/product/[slug]` | `product.html` (slug، id یا کد `KV-…`؛ `?color=`) |
| `/cart` | `cart.html` |
| `/checkout`، `/checkout/result?paymentId=` | `checkout.html` (+ نتیجه‌ی پرداخت) |
| `/login?next=` | `login.html` (OTP) |
| `/account/{orders,tracking,addresses,wishlist,reviews,profile}` | `account.html#…` (هر پنل یک مسیر؛ `/account` ← orders) |
| `/wishlist`، `/wishlist/shared/[token]` | `wishlist.html` (+ لیست اشتراکیِ دیگران، با همان ظاهر) |
| `/track?order=` | `track.html` (+ `#daily`) |
| `/blog`، `/blog/[slug]` | `blog.html`، `blog-post.html` |
| `/faq` (`#reserve`، `#shipping`، …) | `faq.html` |
| `/contact?topic=` | `contact.html` |
| `/about` | `about.html` |
| ۴۰۴ / خطا | `404.html` |

## ساختار

```
src/
├── app/
│   ├── layout.tsx               — QueryProvider، SessionProvider، SiteShell، توست‌ها
│   ├── queryProvider.tsx        — کانفیگ TanStack Query + توست سراسری خطا (meta)
│   ├── sessionProvider.tsx      — خواندن سشن ذخیره‌شده بعد از mount
│   ├── globals.css              — فونت یکان‌بخ + ایمپورت دیزاین‌سیستم (tailwind/kiva/*)
│   ├── _components/
│   │   ├── site/                — پوسته: shell، header، megaMenu، mobileMenu، cartDrawer، searchPanel، loginPrompt، footer، …
│   │   ├── shop/                — productCard، bagArt، mediaImage، stars، wishlistToggle، scrollNav
│   │   ├── address/             — فرم آدرس مشترک (checkout + حساب کاربری) + geo
│   │   ├── common/              — logo، notification، errorComponent2، loading، reveal، notFoundSearch
│   │   ├── ui/                  — Button، Badge، Card، Input، Select، Textarea، Checkbox، Switch، Modal، MultiSelect
│   │   └── icon/                — آیکن‌ست دیزاین + MessengerIcon
│   └── <feature>/               — (home)، products، product، cart، checkout، (auth)، account، wishlist، track، blog، faq، contact، about
├── config/                      — global.ts (env)، site.ts (FALLBACK_CONFIG)
├── httpClient/                  — HttpClient (Bearer / X-Cart-Token، رفرش تک‌پرواز روی ۴۰۱) + mapError
├── hooks/                       — useForm، useAddressForm، useReveal، useHydrated
├── store/                       — auth (persist)، cart (توکن سبد مهمان)، ui (پنل‌ها)، notification
├── types/                       — تایپ‌های مشترک هم‌نام با schemaهای OpenAPI
├── utils/                       — withMappedError، apiError (toErrorView)، format، digits، jalali، clipboard، flyToCart، …
└── tailwind/
    ├── kiva/*.css               — دیزاین‌سیستم پورت‌شده‌ی ۱:۱ از kiva.css (با همان ترتیب cascade)
    └── components.css           — چیزهایی که دیزاین استاتیک لازم نداشت (img داده‌ها، بلوک خطا، لودینگ)
```

### الگوی یک فیچر

```
src/app/checkout/
├── page.tsx                     — CSS صفحه + metadata + کامپوننت اصلی
├── result/page.tsx
├── _api/checkoutEndpoints.ts    — توابع خالص درخواست (بدون مفاهیم React Query)
├── _components/<name>/<name>.tsx
├── _styles/checkout.css         — <style> صفحه‌ی دیزاین، scope‌شده زیر .pg-checkout
├── _types/checkout.type.ts
└── _utils/apiError.ts           — ERROR_BEHAVIOUR ماژول (+ predicateها)
```

- `useQuery` / `useMutation` مستقیم در کامپوننت؛ هر `queryFn`/`mutationFn` داخل `withMappedError`؛ کلیدها سلسله‌مراتبی (`["me","orders","list",{filter}]`).
- بلوک خطای کوئری‌ها: `toErrorView(ERROR_BEHAVIOUR, error, "متن fallback")` + `ErrorComponent2`؛ خطاهایی که «جواب»اند (کد تخفیف، «پیدا نشد» پیگیری، `PRICE_CHANGED`) inline یا toast اطلاعاتی.
- پاسخ‌های موفق بدون envelope؛ لیست‌ها `{ items, meta }`؛ خطاها RFC 7807 با `code`.
- در JSX دقیقاً همان نام کلاس‌های دیزاین استفاده شده تا خروجی پیکسلی یکسان باشد.

## فونت

فونت برند **Yekan Bakh** است؛ خود فایل‌های HTML دیزاین چون فایل فونت را ندارند با Vazirmatn رندر می‌شوند، پس در مقایسه فقط عرض متن و شکستن خطوط فرق دارد.
⚠️ فایل‌های `.woff2` شماره‌ی ۰۱ تا ۰۷ خراب‌اند (در avand هم)؛ فقط فرمت‌های سالم ارجاع داده شده‌اند. بهتر است نسخه‌ی سالمشان تهیه شود.

## انحراف‌های آگاهانه از دیزاین

- سبد خرید و حساب کاربری در موبایل: خود دیزاین اسکرول افقی داشت؛ در CSS scope‌شده با کامنت اصلاح شد.
- صفحه‌بندی بلاگ فقط وقتی واقعاً بیش از یک صفحه هست نمایش داده می‌شود (در دیزاین یک pager ثابت نمایشی بود).
- صفحه‌ی `/wishlist/shared/[token]` (لیستی که کس دیگری به اشتراک گذاشته، فقط‌خواندنی) با ظاهر `wishlist.html` ساخته شد؛ در دیزاین دکمه‌ی اشتراک فقط لینک فروشگاه را کپی می‌کرد. حالت ناموفق صفحه‌ی نتیجه‌ی پرداخت هم در دیزاین نبود و با کلاس‌های خود دیزاین ساخته شد.
- «کدهای آزمایشی» زیر کد تخفیف و «نسخه نمایشی» زیر OTP فقط در development.
