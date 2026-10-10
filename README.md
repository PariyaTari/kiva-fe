# کیوا — فروشگاه آنلاین (Kiva Storefront)

فرانت‌اند فروشگاه آنلاین **کیوا**، فروشگاه کیف‌های مینیمال با شعار «هرچی ببینی، همون می‌رسه». سایت راست‌به‌چپ و فارسی است.

**Next.js 16 (App Router)** · **TypeScript** · **Tailwind CSS 3** · **TanStack Query v5** · **Zustand** · **axios**. ساختار و قراردادها مثل پروژه‌ی `avand-fe` است.

| مرجع | کجا |
|---|---|
| قرارداد API | [`kiva-openapi.yml`](kiva-openapi.yml) — نسخه‌ی **1.4.0** |
| فهرست کامل ویژگی‌ها و API پنل ادمین | [`docs/FEATURES.md`](docs/FEATURES.md) |
| طرح‌ها | `D:\pariya\kiva` (HTML/CSS؛ دیزاین‌سیستم در `assets/kiva.css`) + کارهای سفارش در `D:\pariya\kiva-order-actions` |
| گزارش کارها و تصمیم‌ها | `D:\pariya\docs\PROGRESS.md` |
| استانداردهای کد | اسکیل‌های `data-fetching` و `error-ui` |

## اجرا

```bash
npm install
npx next dev -p 3100
```

```bash
MOCK_FE_ORIGIN=http://localhost:3100 npm run mock
```

```env
# .env
NEXT_PUBLIC_SITE_URL="http://localhost:3100"        # آدرس عمومی سایت: canonical، Open Graph، sitemap
NEXT_PUBLIC_API_URL="http://localhost:8080/api/v1/"
# API_INTERNAL_URL="http://api:8080/api/v1/"        # اختیاری: آدرس API برای سرور Next، اگر از داخل شبکه فرق دارد
```

- برای وصل شدن به بک‌اند واقعی، `NEXT_PUBLIC_API_URL` را عوض کنید. در پروداکشن `NEXT_PUBLIC_SITE_URL` باید دامنه‌ی واقعی باشد.
- سرورها در `.claude/launch.json` هم تعریف شده‌اند: `kiva-dev` (3100) و `kiva-mock` (8080). اگر این پورت‌ها اشغال‌اند، `kiva-mock-8081` و `kiva-dev-8081` را بزنید.
- **قبل از کامیت:** `npx tsc --noEmit` · `npx eslint src mock` · `npx next build`

### بک‌اند واقعی: origin مجاز

بک‌اند `POST /auth/refresh` و `/auth/logout` را فقط از originهای مجاز می‌پذیرد. این پروژه روی پورت **3100** اجرا می‌شود، پس `http://localhost:3100` باید در فهرست بک‌اند باشد؛ وگرنه کاربر بعد از هر رفرش صفحه بیرون می‌افتد (`403`).

کوکی نشست `Secure` است: روی `http://localhost` کار می‌کند، ولی روی آدرس‌های HTTP دیگر (مثلاً گوشی روی `192.168…`) ورود نمی‌ماند.

## بک‌اند Mock (`mock/`)

پیاده‌سازی بخش فروشگاهی قرارداد در حافظه، بدون وابستگی، با داده‌های خود طرح. بخش ادمین (`/admin/*`) در آن نیست. با هر ری‌استارت کاربرها و نشست‌ها پاک می‌شوند و فرانت خودش مهمان می‌شود.

| برای تست | چه |
|---|---|
| ورود | هر شماره‌ی `09…` با هر کد ۵ رقمی. استثناها: `00000` کد اشتباه (پنجمین بار: `OTP_TOO_MANY_ATTEMPTS`)، `11111` کد منقضی. هر شماره هر ۱۲۰ ثانیه فقط یک کد می‌گیرد. شماره‌ی `09999999999` همیشه `RATE_LIMITED` می‌گیرد. |
| کاربر جدید | ۱۳ سفارش، از هر وضعیت یکی (در انتظار پرداخت، ناموفق، منقضی، رزرو، عکس منتظر پاسخ/تأییدشده/درخواست تغییر، ارسال‌شده، تحویل‌شده، مرجوعی، لغوشده)، یک آدرس، ۳ علاقه‌مندی، ۲ نظر، ۳ اشتراک «موجود شد» |
| کد تخفیف | `KIVA10`، `WELCOME`، `PAEEZ15` |
| پرداخت | `/mock-gateway/:id`: بانک آزمایشی با «پرداخت موفق» و «انصراف»، که به `/checkout/result` برمی‌گردد |
| خطاهای نمونه | پرداخت از حساب با «بانک سامان»: `PAYMENT_GATEWAY_UNAVAILABLE` · «کلاچ مهتاب» قابل رزرو نیست · پیگیری کدی که با `0000` تمام شود: «پیدا نشد» · نام «تداخل» در پروفایل: `CHANGED_BY_SOMEONE_ELSE` |
| انقضای توکن | `POST /api/v1/__mock/expire-access-tokens` همه‌ی access tokenها را فوراً منقضی می‌کند (برای تست تمدید، مثلاً با دو تب) |

## صفحات

| مسیر | توضیح |
|---|---|
| `/` | صفحه‌ی اصلی |
| `/products` | فروشگاه؛ فیلترها در URL |
| `/product/[slug]` | محصول؛ slug، id یا `KV-…`، با `?color=` |
| `/cart` | سبد؛ رزرو ۴ روزه، کد تخفیف |
| `/checkout`، `/checkout/result?paymentId=` | تکمیل خرید و نتیجه‌ی پرداخت |
| `/login?next=` | ورود و ثبت‌نام با OTP |
| `/account/{orders,tracking,addresses,wishlist,stock-alerts,reviews,profile}` | حساب کاربری. روی کارت سفارش: پرداخت، لغو، تأیید عکس یا درخواست تغییر، خرید دوباره، فاکتور، مرجوعی. در پروفایل: تغییر شماره |
| `/account/orders/[code]/return` | درخواست مرجوعی |
| `/wishlist`، `/wishlist/shared/[token]` | علاقه‌مندی‌ها و لیست اشتراکی |
| `/track?order=` | پیگیری سفارش و کدهای رهگیری روزانه |
| `/blog`، `/blog/[slug]` | مجله |
| `/faq`، `/contact?topic=`، `/about` | سوالات متداول، تماس، درباره ما |
| `/pages/[slug]` | صفحه‌ی ثابت، مثلاً `/pages/terms` |

جزئیات هر صفحه در [`docs/FEATURES.md`](docs/FEATURES.md) است.

## ساختار

```
src/
├── app/
│   ├── layout.tsx            — QueryProvider، SessionProvider، پوسته‌ی سایت
│   ├── queryProvider.tsx     — کانفیگ TanStack Query + توست سراسری خطا (meta)
│   ├── sessionProvider.tsx   — بازیابی نشست بعد از mount + هماهنگی تب‌ها
│   ├── kiva-configs/         — محتوای خود پروژه: config، home، hero.svg
│   ├── sitemap.ts، robots.ts
│   ├── _components/          — site (پوسته)، shop (کارت محصول، …)، address، common، ui، icon
│   └── <feature>/            — (home)، products، product، cart، checkout، (auth)، account، wishlist، track، blog، faq، contact، about، pages
├── config/                   — global.ts (env)، site.ts (SITE_CONFIG)
├── httpClient/               — HttpClient، session (refresh)، mapError
├── hooks/  store/  types/  utils/
└── tailwind/                 — kiva/*.css (دیزاین‌سیستم ۱:۱ از kiva.css) + components.css
```

هر فیچر این شکل را دارد:

```
src/app/<feature>/
├── page.tsx                  — CSS صفحه + metadata + کامپوننت اصلی
├── _api/<feature>Endpoints.ts — توابع خالص درخواست، بدون React Query
├── _components/<name>/<name>.tsx
├── _styles/<feature>.css     — <style> صفحه‌ی طرح، scope‌شده زیر .pg-<feature>
├── _types/  _utils/apiError.ts (ERROR_BEHAVIOUR + predicateها)
```

**قراردادها:**
- **داده:**
  - `useQuery` / `useMutation` مستقیم در کامپوننت. هر `queryFn` / `mutationFn` داخل `withMappedError`.
  - کلیدها سلسله‌مراتبی‌اند (`["me","orders","list",{filter}]`).
  - کش ندارد (`staleTime: 0`) و retry خودکار هم ندارد.
- **خطا:**
  - کوئری‌ها با `toErrorView(ERROR_BEHAVIOUR, error, "متن")` و `ErrorComponent2`.
  - خطاهایی که «جواب»اند (کد تخفیف نامعتبر، خطاهای OTP، …) inline یا toast اطلاعاتی‌اند.
  - خطای `5xx` با «کد پیگیری» (`traceId`) نشان داده می‌شود.
- **API:**
  - پاسخ‌ها بدون envelope. لیست‌ها `{ items, meta }`. خطاها RFC 7807 با `code`.
  - پول عدد صحیح تومان است و تاریخ ISO؛ تاریخ در کلاینت شمسی می‌شود.
- **ظاهر:** در JSX دقیقاً نام کلاس‌های طرح استفاده شده تا خروجی پیکسلی یکسان باشد. CSS هر صفحه زیر `.pg-<page>` scope شده است.

## ورود و نشست

- ورود و ثبت‌نام یکی است: `POST /auth/otp/send` و بعد `POST /auth/otp/verify`.
- **access token فقط در حافظه** است. refresh token کوکی HttpOnly `kiva_rt` است که جاوااسکریپت نمی‌بیند. درخواست‌هایی که کوکی را می‌گذارند یا می‌خوانند `withCredentials` دارند (verify، refresh، logout، phone-change/verify).
- **با باز شدن صفحه:** اگر نشانه‌ی `kiva-session` در localStorage باشد، `POST /auth/refresh` و بعد `GET /me` صدا زده می‌شوند. این نشانه فقط یک مقدار تصادفی است، نه توکن. مهمان‌ها درخواستی نمی‌دهند. کوئری‌های وابسته به ورود منتظر `hydrated` می‌مانند.
- **روی `401`** (درخواستی که با توکن رفته): یک بار تمدید و تکرار درخواست. تمدید بین تب‌ها زیر قفل `navigator.locks` انجام می‌شود، چون کوکی چرخشی است. اگر refresh رد شود، همه‌ی تب‌ها مهمان می‌شوند.
- **بین تب‌ها:** ورود، خروج و تغییر شماره با رویداد `storage` به تب‌های دیگر می‌رسد. هر بار که کاربر عوض شود، همه‌ی کوئری‌ها دوباره خوانده می‌شوند.

## محتوای ثابت در خود پروژه

- **تنظیمات سایت** در `src/config/site.ts` است: نوار اطلاعیه، فوتر، پشتیبانی، شبکه‌ها، درگاه‌های مودال پرداخت. از `/kiva-configs/config` خوانده می‌شود، نه از `GET /config` بک‌اند. برای تغییرش: همین فایل + دیپلوی.
- **متن‌های صفحه‌ی اصلی** در `src/app/(home)/_utils/homeContent.ts` است: هیروی ثابت با عکس `/kiva-configs/hero.svg`، ویژگی‌ها، دو بنر، «چطور کار می‌کنه».
- **بخش‌های کاتالوگ خانه** زنده‌اند و روی سرور از بک‌اند خوانده می‌شوند: دسته‌ها، جدیدترین‌ها، حراج، نظرات. بخشی که جواب ندهد پنهان می‌شود.

> این‌ها از پنل ادمین قابل تغییر نیستند (بخش ۶ [`docs/FEATURES.md`](docs/FEATURES.md)).

## SEO و رندر سمت سرور

- صفحه‌های عمومی داده‌ی اصلی را **روی سرور prefetch** می‌کنند (`getServerQueryClient` + `PrefetchBoundary`)، پس HTML محتوا دارد. کامپوننت کلاینت باید **همان queryKey** را داشته باشد (کامنت «same key» کنار هر دو). روی سرور هیچ نشستی خوانده نمی‌شود.
- **متادیتا** از بلوک `seo` خود API ساخته می‌شود (`utils/seo.ts`).
- **JSON-LD:** محصول، مقاله، breadcrumb، و `Organization` / `WebSite` برای خانه.
- **۴۰۴ واقعی** برای محصول، مقاله و صفحه‌ی ناموجود.
- **noindex:** صفحه‌های شخصی `noindex` هستند و در robots.txt بسته‌اند.
- **ISR:** خانه ۱ دقیقه؛ بلاگ، FAQ و مقاله ۵ دقیقه؛ `/pages/*` ۱۰ دقیقه؛ sitemap ۱ ساعت. فروشگاه و محصول در هر درخواست رندر می‌شوند.

## فونت

فونت برند **Yekan Bakh** است. فایل‌های HTML طرح فایل فونت را ندارند و با Vazirmatn رندر می‌شوند، پس در مقایسه با طرح فقط عرض متن و شکستن خطوط فرق دارد.
