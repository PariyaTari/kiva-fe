# کیوا — فروشگاه آنلاین (Kiva Storefront)

فرانت‌اند فروشگاه آنلاین **کیوا**؛ فروشگاه کیف‌های مینیمال با شعار «هرچی ببینی، همون می‌رسه».

بر پایه‌ی **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS 3** + **TanStack Query v5** + **Zustand**، راست‌به‌چپ و فارسی — با همان ساختار و قراردادهای پروژه‌ی `avand-fe`.

- طرح‌ها: `D:\pariya\kiva` (HTML/CSS استاتیک؛ `assets/kiva.css` منبع دیزاین‌سیستم) + کارهای سفارش در `D:\pariya\kiva-order-actions`
- قرارداد API: `D:\pariya\kiva-openapi.yml` (نسخه‌ی 1.2.0)
- استانداردها: اسکیل‌های `data-fetching` و `error-ui`

## اجرا (محیط توسعه)

| سرویس | دستور | پورت |
|---|---|---|
| Next.js | `npx next dev -p 3100` | 3100 |
| Mock API | `MOCK_FE_ORIGIN=http://localhost:3100 node --watch mock/server.mjs` (یا `npm run mock`) | 8080 |
| دیزاین (فقط برای مقایسه) | `python -m http.server 5500 --directory D:\pariya\kiva` | 5500 |

هر سه در `.claude/launch.json` هم تعریف شده‌اند (`kiva-dev`، `kiva-mock`، `kiva-design`). اگر پورت 8080 یا سرور dev دست جای دیگری است: `kiva-mock-8081` + `kiva-dev-8081`، یا بیلد پروداکشن روی همان mock با `kiva-prod-8081` (`next start`؛ قبلش `next build` با همان `NEXT_PUBLIC_*`).

```env
# .env
NEXT_PUBLIC_SITE_URL="http://localhost:3100"   # آدرس عمومی سایت: canonical، Open Graph، sitemap، robots
NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1/"
# API_INTERNAL_URL="http://api:8080/api/v1/"   # اختیاری: آدرس API برای سرور Next (prefetch صفحات)، اگر از داخل شبکه فرق دارد
```

با عوض کردن `NEXT_PUBLIC_API_URL` به بک‌اند واقعی وصل می‌شود. در پروداکشن `NEXT_PUBLIC_SITE_URL` باید دامنه‌ی واقعی باشد (مثلاً `https://kiva.ir`).

> `npm install` روی این سیستم با تنظیمات پیش‌فرض timeout می‌شد؛ با `--maxsockets=6 --fetch-timeout=120000 --fetch-retries=5` درست شد.

### بک‌اند Mock (`mock/`)

پیاده‌سازی بخش فروشگاهی OpenAPI در حافظه، بدون وابستگی، با داده‌های خود دیزاین (`data.mjs`) و تصاویر SVG کیف/کاور (`art.mjs`).

- **ورود:** هر کد ۵ رقمی پذیرفته می‌شود، جز `00000` (← `OTP_INVALID`). کاربر جدید داده‌ی نمونه دارد: ۱۳ سفارش (از هر وضعیت یکی: در انتظار پرداخت، ناموفق، منقضی، رزروشده، عکس منتظر پاسخ / تأییدشده / درخواست تغییر، ارسال‌شده، تحویل‌شده، مرجوعی، لغوشده)، یک آدرس، ۳ علاقه‌مندی، ۲ نظر.
- **رزرو ۴ روزه (قرارداد 1.2.0):** سوییچ اختیاری کنار روش ارسال؛ مهلت از پرداخت موفق سفارش اول شروع می‌شود. با رزرو فعال، سبد/تسویه به همان آدرس `consolidation` می‌گیرد (ارسال رایگان با روش ارسال گروه) و سوییچ `HAS_ACTIVE_RESERVATION` می‌شود. «کلاچ مهتاب» قابل رزرو نیست (`ITEM_NOT_RESERVABLE`).
- **کارهای سفارش:** پرداخت از حساب با «بانک سامان» همیشه `PAYMENT_GATEWAY_UNAVAILABLE` می‌دهد (مثل دیزاین)؛ سفارش پرداخت‌نشده ۱۵ دقیقه بعد منقضی می‌شود؛ آپلود فقط نوع و حجم را چک می‌کند و به‌جای فایل یک تصویر کیف برمی‌گرداند؛ فاکتور یک PDF ساده‌ی لاتین است.
- **کد تخفیف:** `KIVA10`، `WELCOME`، `PAEEZ15`.
- **پرداخت:** `payment.redirect` به یک بانک آزمایشی (`/mock-gateway/:id`) می‌رود با دو دکمه‌ی «پرداخت موفق» و «انصراف»؛ بعد به `/checkout/result?paymentId=…` برمی‌گردد. `POST /payments/{id}/retry` هم هست.
- **پیگیری:** شماره‌سفارش‌هایی که با `0000` تمام می‌شوند «پیدا نشد» می‌دهند؛ بقیه یک سفارش نمونه.
- **توکن‌ها:** access token بعد از ۱۵ دقیقه (`expiresIn`) `401 TOKEN_EXPIRED` می‌دهد و FE تمدیدش می‌کند؛ refresh token یک‌بارمصرف (چرخشی) است. برای تست: `POST /api/v1/__mock/expire-access-tokens` همه‌ی access tokenها را همین حالا منقضی می‌کند (مثلاً با دو تب باز).
- **صفحه‌های ثابت:** `GET /pages/terms` («قوانین و حریم خصوصی»)؛ بقیه‌ی slugها `404 PAGE_NOT_FOUND`.
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
| `/account/{orders,tracking,addresses,wishlist,reviews,profile}` | `account.html#…` (هر پنل یک مسیر؛ `/account` ← orders) + کارهای سفارش روی کارت: پرداخت، لغو، تأیید عکس / درخواست تغییر، خرید دوباره، فاکتور، وضعیت مرجوعی (`kiva-order-actions/*.html`) |
| `/account/orders/[code]/return` | `kiva-order-actions/order-return.html` (بدون منوی حساب) |
| `/wishlist`، `/wishlist/shared/[token]` | `wishlist.html` (+ لیست اشتراکیِ دیگران، با همان ظاهر) |
| `/track?order=` | `track.html` (+ `#daily`) |
| `/blog`، `/blog/[slug]` | `blog.html`، `blog-post.html` |
| `/faq` (`#reserve`، `#shipping`، …) | `faq.html` |
| `/contact?topic=` | `contact.html` |
| `/about` | `about.html` |
| `/pages/[slug]` | بدون دیزاین — صفحه‌ی ثابت CMS (`/pages/terms`: قوانین و حریم خصوصی) با اجزای دیزاین‌سیستم |
| ۴۰۴ / خطا | `404.html` |
| `/sitemap.xml`، `/robots.txt` | — |

## ساختار

```
src/
├── app/
│   ├── layout.tsx               — QueryProvider، SessionProvider، SiteShell، توست‌ها
│   ├── queryProvider.tsx        — کانفیگ TanStack Query + توست سراسری خطا (meta)
│   ├── sessionProvider.tsx      — خواندن سشن ذخیره‌شده بعد از mount + هم‌گام‌سازی بین تب‌ها (رویداد storage)
│   ├── sitemap.ts، robots.ts    — نقشه‌ی سایت (دسته‌ها، محصولات با عکس، پست‌ها) و قواعد خزش
│   ├── globals.css              — فونت یکان‌بخ + ایمپورت دیزاین‌سیستم (tailwind/kiva/*)
│   ├── _components/
│   │   ├── site/                — پوسته: shell، header، megaMenu، mobileMenu، cartDrawer، searchPanel، loginPrompt، footer، …
│   │   ├── shop/                — productCard، bagArt، mediaImage، stars، wishlistToggle، scrollNav
│   │   ├── address/             — فرم آدرس مشترک (checkout + حساب کاربری) + geo
│   │   ├── common/              — logo، notification، errorComponent2، loading، reveal، notFoundSearch، prefetchBoundary، jsonLd
│   │   ├── ui/                  — Button، Badge، Card، Input، Select، Textarea، Checkbox، Switch، Modal، MultiSelect
│   │   └── icon/                — آیکن‌ست دیزاین + MessengerIcon
│   └── <feature>/               — (home)، products، product، cart، checkout، (auth)، account، wishlist، track، blog، faq، contact، about، pages
├── config/                      — global.ts (env)، site.ts (FALLBACK_CONFIG)
├── httpClient/                  — HttpClient (Bearer / X-Cart-Token، timeout، رفرش روی ۴۰۱ با قفل بین تب‌ها) + mapError
├── hooks/                       — useForm، useAddressForm، useReveal، useHydrated، useRequireLogin
├── store/                       — auth (persist)، cart (توکن سبد مهمان)، ui (پنل‌ها)، notification
├── types/                       — تایپ‌های مشترک هم‌نام با schemaهای OpenAPI
├── utils/                       — withMappedError، apiError (toErrorView)، serverQuery، seo، format، digits، jalali، clipboard، flyToCart، …
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

## SEO و رندر سمت سرور

- صفحه‌های عمومی (خانه، فروشگاه، محصول، بلاگ، پست، سوالات متداول، `/pages/*`) داده‌ی اصلی را **روی سرور prefetch** می‌کنند (`getServerQueryClient` + `PrefetchBoundary` = `HydrationBoundary`)؛ کامپوننت کلاینت با **همان queryKey** همان را در اولین رندر نشان می‌دهد، پس HTML محتوا دارد نه اسکلتون. کانفیگ مرورگر دست نخورده (`staleTime: 0`) و بعد از hydration داده دوباره خوانده می‌شود؛ prefetch ناموفق فقط یعنی همان رفتار قبلی (مرورگر خودش می‌گیرد و بلوک خطا را نشان می‌دهد). کلید سرور و کلاینت باید یکی بماند (کامنت «same key» کنار هر دو).
- روی سرور هیچ سشنی خوانده یا نوشته نمی‌شود (interceptorها فقط در مرورگر)؛ محصول برای مهمان prefetch می‌شود و بعد از خواندن سشن با توکن دوباره گرفته می‌شود. timeout درخواست‌های سرور ۸ ثانیه است.
- `generateMetadata` از بلوک `seo` خود API (عنوان، توضیح، canonical، تصویر OG، `noIndex`، `jsonLd`) با fallback منطقی (`utils/seo.ts` → `pageMetadata`)؛ JSON-LD برای محصول (`Product` با یک `Offer` برای هر رنگ؛ قیمت به ریال چون تومان کد ISO ندارد)، پست (`BlogPosting`)، breadcrumb و خانه (`Organization` + `WebSite` با جستجو).
- محصول/پست/صفحه‌ی ناموجود **وضعیت ۴۰۴ واقعی** می‌دهد. صفحه‌های شخصی (حساب، سبد، تسویه، ورود، علاقه‌مندی) `noindex` و در robots.txt بسته‌اند؛ نتایج جستجوی فروشگاه (`?q=`) `noindex`؛ canonical فروشگاه فقط یک دسته یا «تخفیف‌دارها».
- ISR: خانه ۱ دقیقه، بلاگ/سوالات/پست ۵ دقیقه، `/pages/*` ۱۰ دقیقه، sitemap ۱ ساعت؛ فروشگاه و محصول per-request.
- فیلترهای فروشگاه با `history.replaceState` در URL می‌نشینند (بدون رفت‌وبرگشت سرور).

## فونت

فونت برند **Yekan Bakh** است؛ خود فایل‌های HTML دیزاین (`D:\pariya\kiva`) چون فایل فونت را ندارند با Vazirmatn رندر می‌شوند، پس در مقایسه فقط عرض متن و شکستن خطوط فرق دارد.
فایل‌های `.woff2` شماره‌ی ۰۱ تا ۰۷ که خراب بودند از روی ttfهای سالم بازسازی شده‌اند.

## انحراف‌های آگاهانه از دیزاین

- سبد خرید و حساب کاربری در موبایل: خود دیزاین اسکرول افقی داشت؛ در CSS scope‌شده با کامنت اصلاح شد.
- سوییچ‌های فیلتر فروشگاه: در خود دیزاین قاعده‌ی `.f-sec > label` نوار سوییچ را به عرض ۰ می‌رساند (فقط دایره‌ی سفید دیده می‌شد)؛ با `:not(.switch)` اصلاح شد.
- صفحه‌بندی بلاگ فقط وقتی واقعاً بیش از یک صفحه هست نمایش داده می‌شود (در دیزاین یک pager ثابت نمایشی بود).
- صفحه‌ی `/wishlist/shared/[token]` (لیستی که کس دیگری به اشتراک گذاشته، فقط‌خواندنی) با ظاهر `wishlist.html` ساخته شد؛ در دیزاین دکمه‌ی اشتراک فقط لینک فروشگاه را کپی می‌کرد. حالت ناموفق صفحه‌ی نتیجه‌ی پرداخت هم در دیزاین نبود و با کلاس‌های خود دیزاین ساخته شد.
- «کدهای آزمایشی» زیر کد تخفیف و «نسخه نمایشی» زیر OTP فقط در development.
- لینک «قوانین و حریم خصوصی» (ورود) و «قوانین کیوا» (تسویه، `termsUrl`) در دیزاین به `faq.html` می‌رفت؛ حالا به `/pages/terms`. همین لینک به ستون «راهنمای خرید» فوتر هم اضافه شد (برای اینماد باید از همه‌ی صفحات در دسترس باشد).
- کارهای سفارش: جاهایی که API داده‌ی طراحی را نمی‌دهد (مهلت نگه‌داشت پرداخت، دلیل بانک، «رنگ قبل ← بعد» درخواست تغییر، مراحل برگشت وجه روی کارت لغوشده) طبق تصمیم‌های PROGRESS.md (بخش ۰.۳) حذف یا با متن عمومی جایگزین شده‌اند. سند PDF فاکتور را بک‌اند می‌سازد؛ `order-invoice.html` فقط قالب پیشنهادی است.
