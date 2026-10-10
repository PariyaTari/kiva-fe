# کیوا — فروشگاه آنلاین (Kiva Storefront)

فرانت‌اند فروشگاه آنلاین **کیوا**؛ فروشگاه کیف‌های مینیمال با شعار «هرچی ببینی، همون می‌رسه».

بر پایه‌ی **Next.js 16 (App Router)** + **TypeScript** + **Tailwind CSS 3** + **TanStack Query v5** + **Zustand**، راست‌به‌چپ و فارسی — با همان ساختار و قراردادهای پروژه‌ی `avand-fe`.

- طرح‌ها: `D:\pariya\kiva` (HTML/CSS استاتیک؛ `assets/kiva.css` منبع دیزاین‌سیستم) + کارهای سفارش در `D:\pariya\kiva-order-actions`
- قرارداد API: `kiva-openapi.yml` در ریشه‌ی همین پروژه (نسخه‌ی **1.4.0**) + راهنمای ورود بک‌اند (`FRONTEND_AUTH.md`)
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

- **ورود:** هر کد ۵ رقمی پذیرفته می‌شود، جز `00000` (← `OTP_INVALID` با `attemptsLeft`؛ پنجمین اشتباه ← `OTP_TOO_MANY_ATTEMPTS`) و `11111` (← `OTP_EXPIRED`). کد فقط بعد از ارسال معتبر است و هر شماره هر ۱۲۰ ثانیه یک کد (← `429 OTP_RESEND_TOO_SOON` با `Retry-After`). شماره‌ی `09999999999` همیشه `429 RATE_LIMITED` می‌دهد. همین قواعد برای تغییر شماره. کاربر جدید داده‌ی نمونه دارد: ۱۳ سفارش (از هر وضعیت یکی: در انتظار پرداخت، ناموفق، منقضی، رزروشده، عکس منتظر پاسخ / تأییدشده / درخواست تغییر، ارسال‌شده، تحویل‌شده، مرجوعی، لغوشده)، یک آدرس، ۳ علاقه‌مندی، ۲ نظر.
- **رزرو ۴ روزه (قرارداد 1.2.0):** سوییچ اختیاری کنار روش ارسال؛ مهلت از پرداخت موفق سفارش اول شروع می‌شود. با رزرو فعال، سبد/تسویه به همان آدرس `consolidation` می‌گیرد (ارسال رایگان با روش ارسال گروه) و سوییچ `HAS_ACTIVE_RESERVATION` می‌شود. «کلاچ مهتاب» قابل رزرو نیست (`ITEM_NOT_RESERVABLE`).
- **کارهای سفارش:** پرداخت از حساب با «بانک سامان» همیشه `PAYMENT_GATEWAY_UNAVAILABLE` می‌دهد (مثل دیزاین)؛ سفارش پرداخت‌نشده ۱۵ دقیقه بعد منقضی می‌شود؛ آپلود فقط نوع و حجم را چک می‌کند و به‌جای فایل یک تصویر کیف برمی‌گرداند؛ فاکتور یک PDF ساده‌ی لاتین است.
- **کد تخفیف:** `KIVA10`، `WELCOME`، `PAEEZ15`.
- **پرداخت:** `payment.redirect` به یک بانک آزمایشی (`/mock-gateway/:id`) می‌رود با دو دکمه‌ی «پرداخت موفق» و «انصراف»؛ بعد به `/checkout/result?paymentId=…` برمی‌گردد. `POST /payments/{id}/retry` هم هست.
- **پیگیری:** شماره‌سفارش‌هایی که با `0000` تمام می‌شوند «پیدا نشد» می‌دهند؛ بقیه یک سفارش نمونه.
- **نشست (قرارداد 1.4.0):** access token در بدنه، refresh token در کوکی `kiva_rt` (`HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`). هر `POST /auth/refresh` کوکی را عوض می‌کند؛ کوکیِ عوض‌شده تا ۳۰ ثانیه پذیرفته می‌شود (بدون کوکی تازه) و بعد از آن کل زنجیره را باطل می‌کند (دزدی). `refresh`/`logout` فقط از originهای localhost (`403 FORBIDDEN` برای بقیه). access token بعد از ۱۵ دقیقه `401 TOKEN_EXPIRED` و توکن ناشناخته `401 UNAUTHORIZED` می‌دهد؛ بعد از خروج هم تا انقضا معتبر می‌ماند (مثل بک‌اند). برای تست: `POST /api/v1/__mock/expire-access-tokens` همه‌ی access tokenها را همین حالا منقضی می‌کند (مثلاً با دو تب باز).
- **تغییر شماره:** `POST /me/phone-change/request` (یک کد به شماره‌ی فعلی، یک کد به جدید) و `/verify` (`meta.field` برای کد اشتباه؛ `409 PHONE_ALREADY_REGISTERED` بعد از درست بودن هر دو)؛ موفق ← همه‌ی نشست‌ها باطل، نشست تازه برای همین دستگاه، شماره‌ی قبلی آزاد (پیامک هشدار در لاگ mock).
- **`PATCH /me`** با نام «تداخل» ← `409 CHANGED_BY_SOMEONE_ELSE`.
- **صفحه‌های ثابت:** `GET /pages/terms` («قوانین و حریم خصوصی»)؛ بقیه‌ی slugها `404 PAGE_NOT_FOUND`.
- **«موجود شد خبرم کن»:** کاربر جدید سه اشتراک دارد (دو تا منتظر — «کیف مجلسی شب‌تاب» یاسی و «توت آسمان» هر رنگی — و «کیف دوشی هستی» کاراملی که «موجود شد»)؛ `GET/DELETE /me/stock-alerts`.
- **«به دردت خورد؟» نظرات:** `PUT /reviews/:id/helpful` رأی هر کاربر را نگه می‌دارد؛ شمارنده‌ی نمونه‌ی هر نظر یعنی رأی بقیه.
- حالت حافظه‌ای است: با هر ری‌استارت (مثلاً `--watch` بعد از ویرایش) کاربرها و نشست‌ها پاک می‌شوند؛ FE با اولین `401` و رد شدن refresh خودش مهمان می‌شود.

## صفحات

| مسیر | دیزاین |
|---|---|
| `/` | `index.html` |
| `/products` | `products.html` (فیلترها در URL) |
| `/product/[slug]` | `product.html` (slug، id یا کد `KV-…`؛ `?color=`) |
| `/cart` | `cart.html` |
| `/checkout`، `/checkout/result?paymentId=` | `checkout.html` (+ نتیجه‌ی پرداخت) |
| `/login?next=` | `login.html` (OTP) |
| `/account/{orders,tracking,addresses,wishlist,stock-alerts,reviews,profile}` | `account.html#…` (هر پنل یک مسیر؛ `/account` ← orders) + کارهای سفارش روی کارت: پرداخت، لغو، تأیید عکس / درخواست تغییر، خرید دوباره، فاکتور، وضعیت مرجوعی (`kiva-order-actions/*.html`) |
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
│   ├── kiva-configs/            — routeهای محتوای خود پروژه: `config`، `home`، `hero.svg` (به‌جای `GET /config` و `GET /home` بک‌اند)
│   ├── globals.css              — فونت یکان‌بخ + ایمپورت دیزاین‌سیستم (tailwind/kiva/*)
│   ├── _components/
│   │   ├── site/                — پوسته: shell، header، megaMenu، mobileMenu، cartDrawer، searchPanel، loginPrompt، footer، …
│   │   ├── shop/                — productCard، bagArt، mediaImage، stars، wishlistToggle، scrollNav
│   │   ├── address/             — فرم آدرس مشترک (checkout + حساب کاربری) + geo
│   │   ├── common/              — logo، notification، errorComponent2، loading، reveal، notFoundSearch، prefetchBoundary، jsonLd
│   │   ├── ui/                  — Button، Badge، Card، Input، Select، Textarea، Checkbox، Switch، Modal، MultiSelect، OtpInput
│   │   └── icon/                — آیکن‌ست دیزاین + MessengerIcon
│   └── <feature>/               — (home)، products، product، cart، checkout، (auth)، account، wishlist، track، blog، faq، contact، about، pages
├── config/                      — global.ts (env)، site.ts (SITE_CONFIG — تنظیمات سایت)
├── httpClient/                  — HttpClient (Bearer / X-Cart-Token، timeout، یک بار تمدید و تکرار روی ۴۰۱) + session (refresh با کوکی زیر قفل بین تب‌ها) + mapError
├── hooks/                       — useForm، useAddressForm، useReveal، useHydrated، useRequireLogin
├── store/                       — auth (فقط حافظه + نشانه‌ی نشست)، cart (توکن سبد مهمان)، ui (پنل‌ها)، notification
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

## ورود و نشست (قرارداد 1.4.0)

- ورود و ثبت‌نام یکی است: `POST /auth/otp/send` ← `POST /auth/otp/verify`. **access token فقط در حافظه** است (`auth.store`، نه localStorage)؛ refresh token کوکی HttpOnly ِ `kiva_rt` است که JS نمی‌بیند. درخواست‌هایی که کوکی را می‌گذارند/می‌خوانند `withCredentials` دارند: verify، refresh، logout و `/me/phone-change/verify`.
- **باز شدن صفحه:** `SessionProvider` اگر نشانه‌ی `kiva-session` در localStorage باشد (فقط یک مقدار تصادفی؛ نه توکن) `POST /auth/refresh` و بعد `GET /me` را صدا می‌زند و بعد `hydrated` را می‌زند؛ مهمان‌ها درخواستی نمی‌دهند. کوئری‌های وابسته به ورود منتظر `hydrated` می‌مانند.
- **۴۰۱ با توکن** (`TOKEN_EXPIRED` یا `UNAUTHORIZED`): یک بار تمدید و تکرار درخواست. تمدید در هر تب تک‌پرواز و بین تب‌ها زیر قفل `navigator.locks` (`kiva-refresh`) است، چون کوکی چرخشی است و استفاده‌ی دوباره بعد از ۳۰ ثانیه یعنی دزدی. رد شدن refresh (`401`/`403`) ← مهمان در همه‌ی تب‌ها.
- **چند تب:** ورود/خروج/تغییر شماره مقدار نشانه را عوض می‌کند؛ تب‌های دیگر با رویداد `storage` نشست را می‌گیرند یا access token خود را دور می‌ریزند (با اینکه تا ۱۵ دقیقه معتبر است). هر بار که «چه کسی» عوض شود همه‌ی کوئری‌ها دوباره خوانده می‌شوند — بعد از رندر همان تغییر، تا کوئری‌های فقط‌کاربر (`enabled: signedIn`) یک بار دیگر به‌عنوان مهمان (۴۰۱) نروند.
- خطاهای OTP جواب فرم‌اند، نه شکست (`utils/otp.ts`): `OTP_INVALID` با تلاش‌های باقی‌مانده، `OTP_EXPIRED`/`OTP_TOO_MANY_ATTEMPTS` ← کد مرده (خانه‌ها و دکمه غیرفعال تا کد جدید)، `OTP_RESEND_TOO_SOON` ← ادامه‌ی تایمر از `retryAfterSeconds` (از مرحله‌ی شماره هم مستقیم به مرحله‌ی کد)، `RATE_LIMITED` ← متن + زمان انتظار. خطای `5xx` با «کد پیگیری» (`traceId`) نشان داده می‌شود (`mapError`).
- **تغییر شماره:** دکمه‌ی «تغییر» کنار شماره در «اطلاعات شخصی» ← مودال سه‌مرحله‌ای (شماره‌ی جدید ← دو کد ← انجام شد).
- **محیط توسعه:** بک‌اند واقعی `refresh`/`logout` را فقط از originهای مجاز می‌پذیرد (طبق راهنما: localhost یا 127.0.0.1 روی 5173 یا 3000)؛ این پروژه روی **3100** است، پس بک‌اند باید `http://localhost:3100` را هم مجاز کند. کوکی `Secure` است: روی `http://localhost` کار می‌کند ولی روی آدرس‌های HTTP دیگر (مثلاً گوشی روی `192.168…`) ورود نمی‌ماند.

## محتوای ثابت در خود پروژه (`/kiva-configs/*`)

- **تنظیمات سایت** (هدر، فوتر، کشوها، تماس، درگاه‌های مودال پرداخت) در `src/config/site.ts` (`SITE_CONFIG`) است و از route خود Next یعنی `/kiva-configs/config` (استاتیک) خوانده می‌شود، نه از `GET /config` بک‌اند. برای تغییر: همین فایل + دیپلوی. «الان پاسخگوییم» صفحه‌ی تماس حذف شد (وضعیت لحظه‌ای ندارد).
- **صفحه‌ی اصلی** از `/kiva-configs/home` خود Next می‌آید (`app/kiva-configs/home/route.ts` ← `(home)/_utils/loadHomePage.ts`): متن‌ها (هیرو، ویژگی‌ها، بنرها، «چطور کار می‌کنه») در `(home)/_utils/homeContent.ts`. **هیرو کاملاً ثابت است:** یک عکس (کیف تصویری دیزاین، `HERO_ART`) که `/kiva-configs/hero.svg` می‌کشد، در هر دو کارت؛ به‌جای قیمت «عکس واقعی» و به‌جای انتخاب رنگ برچسب «رنگ: یاسی» (بدون چرخش رنگ). بخش‌های کاتالوگ زنده‌اند و روی سرور از بک‌اند خوانده می‌شوند: دسته‌ها (`/categories`)، جدیدترین‌ها (`/products?sort=newest`)، حراج (`/campaigns/active`)، نظرات (`/testimonials`). بخشی که بک‌اند جواب ندهد پنهان می‌شود (و در لاگ سرور `[home] …` ثبت می‌شود)؛ بقیه‌ی صفحه می‌ماند. prefetch سرور همان loader را مستقیم صدا می‌زند.
- درخواست‌های مرورگر به این routeها با `nextApiClient` (`baseURL: /kiva-configs/`، همان origin، بدون هدر سشن) و بقیه با `httpClient` (بک‌اند) است. `config` و `home` در robots.txt بسته‌اند؛ `hero.svg` نه.

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
- هیروی صفحه‌ی اصلی ثابت است (به درخواست شما): بدون قیمت، انتخاب رنگ و چرخش رنگ‌های دیزاین؛ یک عکس ثابت + برچسب‌ها.
- پنل «موجود شد خبرم کن» (`/account/stock-alerts`) و ردیف «به دردت خورد؟» زیر نظرهای محصول در دیزاین نیستند (API دارد)؛ با اجزای خود دیزاین ساخته شدند (کارت «نظرات من»، ردیف `.helpful` بلاگ).
- لینک «قوانین و حریم خصوصی» (ورود) و «قوانین کیوا» (تسویه، `termsUrl`) در دیزاین به `faq.html` می‌رفت؛ حالا به `/pages/terms`. همین لینک به ستون «راهنمای خرید» فوتر هم اضافه شد (برای اینماد باید از همه‌ی صفحات در دسترس باشد).
- کارهای سفارش: جاهایی که API داده‌ی طراحی را نمی‌دهد (مهلت نگه‌داشت پرداخت، دلیل بانک، «رنگ قبل ← بعد» درخواست تغییر، مراحل برگشت وجه روی کارت لغوشده) طبق تصمیم‌های PROGRESS.md (بخش ۰.۳) حذف یا با متن عمومی جایگزین شده‌اند. سند PDF فاکتور را بک‌اند می‌سازد؛ `order-invoice.html` فقط قالب پیشنهادی است.
