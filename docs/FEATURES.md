# ویژگی‌های فروشگاه کیوا — مرجع ساخت پنل ادمین

> تاریخ: ۱۸ مهر ۱۴۰۵ (2026-10-10)
> فروشگاه: `kiva-fe` (Next.js 16) · قرارداد API: `kiva-openapi.yml` **نسخه‌ی 1.4.0** · راهنمای ورود بک‌اند: `FRONTEND_AUTH.md`
>
> این سند هر چیزی را که مشتری در فروشگاه می‌بیند یا انجام می‌دهد فهرست می‌کند، و برای هر کدام می‌گوید پشتش چه داده‌ای است و ادمین کجا مدیریتش می‌کند.
> همه‌ی endpointهای `/admin/*` در کانترکت **[پیشنهادی]** علامت خورده‌اند، یعنی بک‌اند هنوز قطعی‌شان نکرده.

**فهرست**
۱. نمای کلی پنل · ۲. ویژگی‌های فروشگاه، صفحه به صفحه · ۳. چرخه‌ها و قوانین کسب‌وکار · ۴. API پنل ادمین · ۵. enumها و برچسب‌ها · ۶. چیزهایی که الان در خود فرانت ثابت است · ۷. شکاف‌ها: چیزهایی که پنل لازم دارد ولی در کانترکت نیست · ۸. نکات فنی برای ساخت پنل

---

## ۱. نمای کلی پنل

### ۱.۱ بخش‌های پنل

| # | بخش پنل | کار اصلی | نقش‌ها | endpointها |
|---|---|---|---|---|
| 1 | داشبورد | فروش، تعداد سفارش، میانگین سبد، مشتری جدید، سهم رزرو، نرخ تأیید عکس، نرخ درخواست تغییر، نرخ مرجوعی، جمع تخفیف، ترکیب روش ارسال و پیام‌رسان، پرفروش‌ها، نمودار روزانه | ADMIN | `GET /admin/reports/overview` |
| 2 | سفارش‌ها | صف عملیات: عکاسی، ارسال عکس، ثبت ارسال، تغییر وضعیت، یادداشت داخلی | ADMIN، OPERATOR | `/admin/orders*` |
| 3 | مرجوعی‌ها | تأیید یا رد، و تعیین اینکه هزینه‌ی برگشت با کیه | ADMIN، OPERATOR | `/admin/returns*` |
| 4 | استرداد وجه | برگشت کامل یا جزئی پول | **فقط ADMIN** | `POST /admin/orders/{code}/refunds` |
| 5 | محصولات و ورینت‌ها | ساخت و ویرایش، انتشار، آرشیو، ورینت رنگی، مدیا، SEO | ADMIN، CATALOG_MANAGER | `/admin/products*` |
| 6 | موجودی | ورود کالا، شمارش انبار، آسیب‌دیده، تاریخچه | ADMIN، CATALOG_MANAGER | `/admin/inventory/adjustments` |
| 7 | دسته‌بندی، رنگ، متریال | طبقه‌بندی کاتالوگ | ADMIN، CATALOG_MANAGER | `/admin/categories*`، `/admin/colors*`، `/admin/materials` |
| 8 | آپلود مدیا | عکس و ویدیوی محصول، عکس قبل از ارسال، بلاگ، بنر، دسته، پیام رضایت | ADMIN، CATALOG_MANAGER، CONTENT_EDITOR، OPERATOR | `POST /admin/media` |
| 9 | کدهای تخفیف | ساخت، شرط‌ها، آمار استفاده | **فقط ADMIN** | `/admin/discount-codes*` |
| 10 | کمپین‌ها (جشنواره) | بخش حراج صفحه‌ی اصلی با شمارش معکوس | ADMIN، CONTENT_EDITOR | `/admin/campaigns*` |
| 11 | بنرها | بنرهای صفحه‌ی اصلی، فروشگاه، محصول و بلاگ | ADMIN، CONTENT_EDITOR | `/admin/banners*` |
| 12 | نوار اطلاعیه | پیام‌های چرخان بالای سایت | ADMIN، CONTENT_EDITOR | `PUT /admin/announcements` |
| 13 | پیام‌های رضایت | «مشتری‌ها چی می‌گن» صفحه‌ی اصلی | ADMIN، CONTENT_EDITOR | `/admin/testimonials*` |
| 14 | بلاگ | مقاله‌ها با بلوک‌های محتوا | ADMIN، CONTENT_EDITOR | `/admin/blog/posts*` |
| 15 | سوالات متداول | گروه‌ها و سؤال‌ها با ترتیب | ADMIN، CONTENT_EDITOR | `PUT /admin/faq/groups` |
| 16 | صفحات ثابت | قوانین، حریم خصوصی و… | ADMIN، CONTENT_EDITOR | `PUT /admin/pages/{slug}` |
| 17 | تنظیمات | هزینه‌ی ارسال، ارسال رایگان، رزرو، بازگشت، پشتیبانی، درگاه‌ها، آمار سایت | **فقط ADMIN** | `/admin/settings` |
| 18 | نظرات | تأیید یا رد، «پاسخ کیوا» | ADMIN، SUPPORT | `/admin/reviews*` |
| 19 | پیام‌های تماس | تیکت‌های فرم تماس، پاسخ با پیامک یا ایمیل | ADMIN، SUPPORT | `/admin/contact-messages*` |
| 20 | مشتریان و نقش‌ها | جستجوی مشتری؛ دادن نقش پنل | ADMIN، SUPPORT (نقش‌دادن فقط ADMIN) | `/admin/customers*` |

### ۱.۲ نقش‌ها (کانترکت، بخش ۲)

| نقش | دسترسی |
|---|---|
| `CUSTOMER` | همه دارند و برداشتنی نیست. پنل ندارد. |
| `ADMIN` | همه‌جا |
| `CATALOG_MANAGER` | محصول، ورینت، موجودی، دسته، رنگ، متریال، آپلود مدیا |
| `OPERATOR` | سفارش‌ها، عکس قبل از ارسال، ارسال، مرجوعی (بدون استرداد)، آپلود مدیا |
| `CONTENT_EDITOR` | کمپین، بنر، نوار اطلاعیه، پیام رضایت، بلاگ، FAQ، صفحات ثابت، آپلود مدیا |
| `SUPPORT` | نظرات، پیام‌های تماس، مشتریان |

- نقش‌ها در **هر درخواست** از سرور خوانده می‌شوند. نقش ناکافی یعنی `403 FORBIDDEN`.
- منو و دکمه‌های پنل را می‌شود از `roles` توی توکن ساخت، ولی فقط برای نمایش؛ تصمیم دسترسی همیشه با سرور است.
- تغییر نقش‌های یک نفر همه‌ی نشست‌هایش را باطل می‌کند. هیچ‌کس نقش‌های **خودش** را عوض نمی‌کند (`422 ROLE_CHANGE_NOT_ALLOWED`).

### ۱.۳ صف‌های کاری: چیزهایی که مشتری در فروشگاه می‌سازد و پنل باید جوابش را بدهد

| رویداد در فروشگاه | نتیجه در پنل | چه کسی | کجا |
|---|---|---|---|
| پرداخت موفق سفارش | سفارش `PROCESSING` (یا `RESERVED` اگر رزرو شده) ← باید عکاسی شود | OPERATOR | فیلتر `awaitingPhotos=true` |
| پایان مهلت رزرو ۴ روزه | همه‌ی سفارش‌های گروه **خودکار** `PROCESSING` می‌شوند | سیستم | فیلتر `reserved` |
| مشتری عکس را تأیید کرد | آماده‌ی بسته‌بندی و ارسال | OPERATOR | جزئیات سفارش (`preShipmentMedia.feedback`) |
| مشتری «می‌خوام عوضش کنم» زد | `CHANGE_REQUESTED` با نوع تغییر (`COLOR`، `MODEL`، `CANCEL_ITEM`، `OTHER`)، کالای موردنظر، ورینت جایگزین و یادداشت | OPERATOR | ⚠️ endpoint انجام تغییر نیست (بخش ۷) |
| مشتری سفارش را لغو کرد (تا قبل از ارسال) | `CANCELLED` + یک `Refund` در حال انجام | ADMIN | `refunds` در جزئیات سفارش |
| مشتری درخواست مرجوعی داد (تا ۷ روز بعد از تحویل) | `ReturnRequest` با وضعیت `REQUESTED` + عکس‌های مستند + روش برگشت پول (یا شبا) | OPERATOR | `GET /admin/returns?status=REQUESTED` |
| مشتری نظر ثبت کرد | نظر `PENDING` (تا تأیید در سایت نیست) | SUPPORT | `GET /admin/reviews?status=PENDING` (`pendingCount`) |
| فرم تماس | تیکت `OPEN` با کد `CT-…` | SUPPORT | `GET /admin/contact-messages?status=OPEN` |
| «موجود شد خبرم کن» | شمارنده‌ی `stockAlertSubscribers` روی ورینت؛ با شارژ موجودی ورینتی که صفر بوده، پیامک «موجود شد» خودکار صف می‌شود | CATALOG_MANAGER | `AdminVariant`، `POST /admin/inventory/adjustments` |
| سفارش پرداخت‌نشده | بعد از ۱۵ دقیقه (`paymentPendingMinutes`) خودکار `EXPIRED` | سیستم | — |
| عضویت خبرنامه | ⚠️ در پنل دیده نمی‌شود | — | بخش ۷ |

### ۱.۴ ورود به پنل (FRONTEND_AUTH، بخش ۷)

- ورود مثل فروشگاه با OTP است (`/auth/otp/send` و `/auth/otp/verify`). کسی که نقش پنل دارد همان حساب مشتری‌اش است.
- نشست پنل **۱۲ ساعت** بعد از آخرین استفاده تمام می‌شود و حداکثر **۷ روز** عمر دارد (`refreshExpiresIn` در پاسخ ورود).
- نشست در **هر درخواست** چک می‌شود، پس خروج و گرفتن نقش فوراً اثر می‌کند.
- پنل باید روی **زیردامنه‌ی `kiva.ir`** باشد (مثلاً `admin.kiva.ir`)، وگرنه کوکی `SameSite=Strict` فرستاده نمی‌شود. origin پنل هم باید در فهرست مجاز بک‌اند باشد.
- `401`: یک بار تمدید، و اگر نشد، صفحه‌ی ورود.
- `403 FORBIDDEN`: صفحه‌ی «دسترسی نداری»، **بدون** بیرون کردن کاربر.

---

## ۲. ویژگی‌های فروشگاه، صفحه به صفحه

برای هر صفحه سه چیز آمده: مشتری چه می‌کند، داده از کجا می‌آید، و **برای پنل** چه معنایی دارد.

### ۲.۱ پوسته‌ی سایت (در همه‌ی صفحه‌ها)

- **نوار اطلاعیه‌ی بالای سایت:** چند پیام چرخان با آیکن (ارسال رایگان، عکس قبل از ارسال، رزرو). الان ثابت و داخل فرانت است (بخش ۶).
- **هدر:** لوگو، منو، **مگامنو دسته‌ها** (`GET /categories`)، جستجو، قلب علاقه‌مندی با شمارنده (`GET /me/wishlist/ids`)، سبد با شمارنده، ورود یا حساب.
- **پنل جستجو:**
  - پیشنهاد تایپی (`GET /search/suggest`): محصول، دسته، رنگ.
  - پیشنهادهای اولیه (`GET /search/hints`): دسته‌ها، رنگ‌ها، «جستجوهای پرتکرار».
- **منوی موبایل** و **سبد کشویی** (کالاها، جمع، رفتن به سبد یا تسویه).
- **مودال «اول وارد شو»:** برای کارهایی که ورود می‌خواهند (قلب، «موجود شد خبرم کن»، رأی به نظر).
- **فوتر:** درباره‌ی کیوا، دو ستون لینک، شبکه‌های اجتماعی، تلفن و ایمیل و ساعت پشتیبانی، نماد اعتماد و ساماندهی، **خبرنامه‌ی ایمیلی** (`POST /newsletter/subscriptions`).
- کلید `/` جستجو را باز می‌کند و `Esc` پنل‌ها را می‌بندد.

**برای پنل:**
- دسته‌ها: نام، slug، آیکن (نوع کیف + رنگ)، عکس، ترتیب، `showInMenu`.
- منبع «جستجوهای پرتکرار» و مشترکین خبرنامه در کانترکت پنل ندارند (بخش ۷).
- لینک‌ها و اطلاعات فوتر الان ثابت‌اند (بخش ۶).

### ۲.۲ صفحه‌ی اصلی `/`

| بخش | داده | برای پنل |
|---|---|---|
| هیرو (شعار، دکمه‌ها، کارت کیف با «عکس واقعی، بدون ادیت») | **ثابت در فرانت** (`homeContent.ts`، عکس از `/kiva-configs/hero.svg`) | بخش ۶ |
| نوار ویژگی‌ها (۴ مورد) | ثابت | بخش ۶ |
| دسته‌بندی‌ها | `GET /categories` (`imageUrl`، `productCount`، آیکن) | دسته‌ها |
| جدیدترین‌ها (۸ تا) | `GET /products?sort=newest&size=8` | محصولات؛ تگ «جدید» از `newUntil` |
| دو بنر تبلیغاتی (رزرو ۴ روزه، امضای کیوا) | **ثابت** (کانترکت `Banner` با `placement=HOME_PROMO` دارد ولی فرانت فعلاً نمی‌خواند) | بنرها / بخش ۶ |
| جشنواره‌ی حراج با شمارش معکوس و کارت محصولات | `GET /campaigns/active` (`204` یعنی کمپینی فعال نیست و بخش پنهان می‌شود) | کمپین‌ها |
| نظرات مشتری‌ها (پیام پیام‌رسانی با نام، شهر، کانال، ساعت، کیف و رنگ) | `GET /testimonials?size=8` | پیام‌های رضایت |
| «چطور کار می‌کنه» (۴ قدم) | ثابت | بخش ۶ |

اگر بخشی از بک‌اند جواب ندهد، فقط همان بخش پنهان می‌شود. ISR یک‌دقیقه‌ای و JSON-LD (`Organization` + `WebSite` با جستجو) دارد.

### ۲.۳ فروشگاه `/products`

- **فیلترها (در URL):**
  - جستجو `q`
  - دسته (چندتایی)
  - رنگ (چندتایی، با swatch و تعداد)
  - بازه‌ی قیمت (اسلایدر با حدهایی که از `facets.price` می‌آیند؛ وقتی هیچ محصولی جور نیست `null`)
  - فقط تخفیف‌دار، فقط موجود
- دسته‌های سریع بالای صفحه، چیپ فیلترهای فعال (`appliedFilters`) با «حذف همه».
- **مرتب‌سازی:** جدیدترین، پرفروش‌ترین، ارزان‌ترین، گران‌ترین.
- عنوان، زیرعنوان و breadcrumb از پاسخ API. **فقط ۲۴ محصول اول** نشان داده می‌شود؛ صفحه‌بندی ندارد.
- **کارت محصول:**
  - عکس رنگ انتخاب‌شده؛ اگر عکسی آپلود نشده، ایلاستریشن کیف در همان رنگ.
  - نقطه‌های رنگ (با کلیک عکس عوض می‌شود).
  - قیمت، قیمت خط‌خورده و درصد تخفیف.
  - تگ «جدید» و «ویدیو دارد».
  - «فقط N عدد مونده» (فقط زیر `lowStockThreshold`) یا «ناموجود».
  - قلب علاقه‌مندی، و افزودن سریع به سبد با انیمیشن پرواز.
- ناموجودها ته لیست می‌آیند، مگر در مرتب‌سازی قیمتی (قانون بک‌اند).
- SEO: canonical فقط برای یک دسته یا «تخفیف‌دار»؛ صفحه‌ی جستجو (`?q=`) `noindex`.

**برای پنل:** وضعیت محصول (فقط `ACTIVE` در سایت است)، قیمت و `compareAtPrice`، `newUntil`، `sortPriority` (پین در لیست)، دسته، رنگ‌ها، ویدیو، موجودی.

### ۲.۴ جزئیات محصول `/product/[slug]`

آدرس با slug، id یا SKU (`KV-1001`) کار می‌کند. محصول ناموجود در سیستم وضعیت واقعی ۴۰۴ می‌گیرد.

- **گالری:**
  - تامبنیل‌ها، تامبنیل ویدیو، زوم با کلیک که دنبال موس می‌رود، سوایپ روی موبایل.
  - تگ‌های روی عکس: جدید، حراج، ویدیو، ارسال رایگان، ناموجود.
  - اگر رنگ عکس ندارد، ایلاستریشن کیف.
- **انتخاب رنگ:** با `?color=` در URL؛ هر رنگ عکس، قیمت و موجودی خودش را دارد.
- **قیمت و موجودی:** «فقط N عدد»؛ سقف تعداد از `maxOrderQuantity` (`maxPerOrder`).
- **افزودن به سبد:** با انیمیشن و toast «تسویه حساب». نوار خرید چسبان در موبایل.
- **قلب علاقه‌مندی.**
- **«موجود شد خبرم کن»** برای رنگ ناموجود (`POST /products/{id}/stock-alerts`؛ مهمان باید وارد شود).
- **«سؤال داری؟»:** لینک پیام‌رسان‌ها با متن آماده (`GET /products/{id}/inquiry`).
- **کادر امضای کیوا** (عکس قبل از ارسال) و perks (ثابت).
- **تب‌ها:**
  - توضیحات: HTML از API + بولت‌های «چرا …؟» (`highlights`).
  - مشخصات: جدول `specTable`، با swatch و tone.
  - نظرات (پایین‌تر).
  - ارسال و بازگشت: متن **ثابت** در فرانت.
- **نظرات:**
  - خلاصه‌ی امتیاز با میله‌ی هر ستاره، و لیست با تگ «خریدار» و رنگ خریده‌شده.
  - «پاسخ کیوا» زیر نظر.
  - **«به دردت خورد؟»** (آره/نه با شمارنده؛ `PUT /reviews/{id}/helpful`).
  - فرم ثبت نظر برای کاربر واردشده: امتیاز، نام، موبایل یا ایمیل، متن حداقل ۱۰ حرف. مهمان قفل «ورود و ثبت نظر» می‌بیند.
  - نظر خود کاربر با تگ «در انتظار تأیید» دیده می‌شود.
- **ویدیو** در مودال.
- **محصولات مرتبط** (`GET /products/{id}/related`).
- **SEO:** عنوان، توضیح، canonical، OG از بلوک `seo`. JSON-LD `Product`: یک `Offer` برای هر رنگ با SKU و موجودی، قیمت به ریال، `AggregateRating`. breadcrumb هم دارد.

**برای پنل (فرم محصول):**
- نام، slug، SKU، دسته، نوع کیف (`bagType`)، متریال و توضیح متریال.
- قیمت و قیمت قبل از تخفیف.
- توضیح کوتاه، توضیح HTML، تا ۸ `highlights`، مشخصات ساختاریافته (`specs`)، تگ‌ها.
- `newUntil`، `maxPerOrder`، `returnable`، `reservable`، `sortPriority`، وضعیت، SEO.
- **ورینت‌ها:** رنگ، SKU، بارکد، قیمت اختصاصی، موجودی، پیش‌فرض، فعال، ترتیب، و مدیا با `view`، ترتیب، `isPrimary` و alt.
- **آمار پنل:** بازدید، نرخ تبدیل، فروش، موجودی فیزیکی، رزرو‌شده و در دسترس، مشترکین «موجود شد».
- منطق «مرتبط‌ها» و متن آماده‌ی «سؤال داری؟» در پنل نیستند (بخش ۷).

### ۲.۵ سبد خرید `/cart`

- سبد مهمان با توکن `X-Cart-Token` کار می‌کند و بعد از ورود با سبد کاربر ادغام می‌شود (از فاز سبد بک‌اند).
- **کالا:** تغییر تعداد (سقف موجودی)، حذف با «برگردون»، انتقال به علاقه‌مندی‌ها.
- **روش ارسال:** تیپاکس یا پست، با قیمت. اگر ارسال رایگان شامل شود، قیمت خط می‌خورد.
- **رزرو ۴ روزه (اختیاری، پیش‌فرض خاموش):**
  - با تایم‌لاین و زیرخط «یک هزینه ارسال».
  - اگر رزرو فعال دارد، به‌جای سوییچ پیام «به سفارش رزروی می‌پیوندد» می‌آید.
  - کالای غیرقابل رزرو سوییچ را غیرفعال می‌کند.
  - بخش ۳.۳ را ببینید.
- **کد تخفیف:** خطاهای inline مثل حداقل خرید یا منقضی.
- **جمع:** نوار پیشرفت تا ارسال رایگان، تخفیف محصولات، کد، هزینه‌ی ارسال، مبلغ قابل پرداخت، «صرفه‌جویی کردی».
- **هشدارهای سبد (`issues`):** موجودی کم شد، قیمت عوض شد، ناموجود شد.
- **سبد خالی:** ۴ پرفروش موجود.
- ادامه برای مهمان به ورود می‌رود و بعد برمی‌گردد به تسویه.

**برای پنل:** کدهای تخفیف، تنظیمات ارسال و رزرو، `reservable` محصول، موجودی.

### ۲.۶ تکمیل خرید `/checkout` و نتیجه‌ی پرداخت `/checkout/result`

- **آدرس:**
  - انتخاب از آدرس‌های ذخیره‌شده یا آدرس جدید (استان و شهر از `GET /geo/provinces`، کد پستی، گیرنده خودم یا دیگری) + ذخیره‌ی آدرس.
- **امضای کیوا (اجباری):** پیام‌رسان (روبیکا، تلگرام یا بله) و شماره‌ای که عکس قبل از ارسال به آن برود.
- **روش ارسال** و رزرو (اگر روش ارسال روی گروه رزرو قفل باشد، قابل تغییر نیست).
- **درگاه پرداخت:** زرین‌پال، سامان یا ملت.
- **خلاصه‌ی سفارش** و پذیرش قوانین (لینک `/pages/terms`).
- **ثبت سفارش:** `POST /orders` با `Idempotency-Key` و مبلغ مورد انتظار.
  - `409 PRICE_CHANGED`: هشدار و خواندن دوباره.
  - مبلغ صفر (تخفیف کامل): بدون درگاه، مودال موفقیت.
  - در غیر این صورت، رفتن به درگاه.
- **نتیجه‌ی پرداخت** (`GET /payments/{id}`): موفق با کد سفارش و قدم‌های بعدی؛ ناموفق یا انصراف با «تلاش دوباره» (`POST /payments/{id}/retry`).

**برای پنل:** پرداخت‌های هر سفارش (`AdminOrder.payments`)، روش‌ها و هزینه‌های ارسال، درگاه‌ها (تنظیمات)، شرایط و قوانین (صفحات ثابت).

### ۲.۷ ورود و ثبت‌نام `/login`

- **شماره ← کد ۵ رقمی.** تایمر دایره‌ای ارسال دوباره ۱۲۰ ثانیه است. کد با رقم فارسی هم قبول می‌شود و پر شدن خانه‌ها خودکار تأیید می‌کند.
- **خطاها:**
  - کد اشتباه با تعداد تلاش باقی‌مانده.
  - کد منقضی یا ۵ بار اشتباه: کد جدید لازم است.
  - ارسال زودهنگام: تایمر ادامه پیدا می‌کند.
  - محدودیت: زمان انتظار نشان داده می‌شود.
- **کاربر جدید:** مرحله‌ی اختیاری «دوست داری چی صدات کنیم؟» (`PATCH /me`). بعد «خوش اومدی» و برگشت به `next`.
- **نشست:** access token فقط در حافظه، refresh token کوکی HttpOnly، تمدید بی‌صدا و هماهنگی بین تب‌ها.

**برای پنل:** محدودیت‌ها و کدها در بک‌اند‌اند؛ پنل فقط نقش‌ها را مدیریت می‌کند. لیست نشست‌ها و دستگاه‌ها در کانترکت نیست.

### ۲.۸ حساب کاربری `/account/*`

سربرگ: سلام، ۴ کارت آمار (کل سفارش، سفارش جاری، عکس دریافتی، علاقه‌مندی)، کارت کاربر و منوی کناری با شمارنده‌ها (`GET /me/dashboard`). مهمان به ورود فرستاده می‌شود.

| پنل | ویژگی‌ها | endpointها |
|---|---|---|
| **سفارش‌های من** `/account/orders` | فیلتر همه، جاری، تحویل‌شده، لغوشده؛ «سفارش‌های بیشتر». کارت: کد، تاریخ، وضعیت، تامبنیل‌ها، stepper ۴ مرحله‌ای، کد رهگیری با کپی، نوار رزرو با شمارش معکوس. جزئیات بازشونده: عکس و ویدیوی قبل از ارسال (لایت‌باکس)، کالاها، گیرنده، خلاصه‌ی پرداخت. | `GET /me/orders`، `GET /me/orders/{code}` |
| ↳ کارهای سفارش (بر اساس `actions` سرور) | **پرداخت** سفارش در انتظار یا ناموفق (مودال درگاه)؛ **خرید دوباره** (منقضی یا لغوشده)؛ **لغو** با دلیل (و پیشنهاد «عوضش کن»)؛ **«همونه؟»**: تأیید یک‌کلیکی عکس یا **درخواست تغییر** (رنگ با موجودی، مدل مشابه، حذف یک کیف، چیز دیگر؛ با مابه‌التفاوت)؛ **فاکتور PDF**؛ **مرجوعی**؛ کادر وضعیت مرجوعی | `POST …/payments`، `/reorder`، `/cancel`، `/media-feedback`، `GET …/media`، `GET …/invoice`، `GET /me/returns` |
| **صفحه‌ی مرجوعی** `/account/orders/[code]/return` | انتخاب کالا و تعداد، دلیل، توضیح، آپلود عکس و ویدیو با درصد (`POST /me/uploads`)، روش برگشت پول (کارت، شبا، اعتبار)، خلاصه؛ حالت‌های «ثبت شد» و «دیگه نمی‌شه» | `POST /me/orders/{code}/returns` |
| **کدهای رهگیری** `/account/tracking` | رهگیری سفارش‌های ارسال‌شده | `GET /me/tracking` |
| **آدرس‌ها** | افزودن، ویرایش، پیش‌فرض، حذف | `/me/addresses*` |
| **علاقه‌مندی‌ها** | همان لیست علاقه‌مندی | `/me/wishlist` |
| **موجود شد خبرم کن** | لیست اشتراک‌ها (منتظر یا موجود شد)، لغو با «برگردون» | `GET/DELETE /me/stock-alerts` |
| **نظرات من** | نظرهای کاربر با وضعیت و پاسخ کیوا | `GET /me/reviews` |
| **اطلاعات شخصی** | نام، نام خانوادگی، ایمیل، تاریخ تولد شمسی، جنسیت، پیام‌رسان پیش‌فرض، پیامک تخفیف‌ها؛ **تغییر شماره** (کد به هر دو شماره) | `GET/PATCH /me`، `/me/phone-change/*` |

**برای پنل:**
- همه‌ی این کارهای مشتری به صف‌های بخش ۱.۳ می‌رسند.
- `allowedTransitions` و `actions` را سرور تعیین می‌کند.
- فاکتور را بک‌اند می‌سازد (طرح پیشنهادی: `kiva-order-actions/order-invoice.html`).

### ۲.۹ علاقه‌مندی‌ها `/wishlist` و لیست اشتراکی `/wishlist/shared/[token]`

- کارت‌ها با قیمت زمان افزودن و تغییر قیمت. حذف، «افزودن همه‌ی موجودها به سبد»، «پاک کردن لیست».
- **اشتراک‌گذاری** (`POST /me/wishlist/share` و کپی لینک). صفحه‌ی لیست اشتراکی فقط‌خواندنی و بدون ورود است.

**برای پنل:** چیزی برای مدیریت نیست. افت قیمت علاقه‌مندی (پیامک) [پیشنهادی] است.

### ۲.۱۰ پیگیری سفارش `/track`

- **پیگیری مهمان:** کد سفارش + موبایل (`POST /tracking/lookup`) ← stepper و وضعیت. محدودیت: ۱۰ بار در ۱۰ دقیقه برای هر IP.
- **کدهای رهگیری روزانه:** تب ۱۰ روز اخیر، جستجو، اطلاعات گیرنده ماسک‌شده (`GET /tracking/daily/days`، `GET /tracking/daily`).

**برای پنل:** هر ارسالی که با `showInDailyList=true` ثبت شود (`PUT /admin/orders/{code}/shipment`) در این لیست می‌آید.

### ۲.۱۱ بلاگ `/blog` و مقاله `/blog/[slug]`

- **لیست:** چیپ دسته‌ها (`GET /blog/categories`)، جستجو، «منتخب سردبیر» (`isFeatured`)، کارت‌ها، صفحه‌بندی.
- **مقاله:**
  - نوار پیشرفت مطالعه، فهرست مطالب با scrollspy.
  - بلوک‌ها: تیتر، پاراگراف، نقل‌قول، نکته، **کارت محصول**، عکس، لیست.
  - «مفید بود؟» (`POST /blog/posts/{id}/feedback`)، نویسنده، اشتراک، مقاله‌های مرتبط.
  - JSON-LD `BlogPosting`.

**برای پنل:**
- مقاله: عنوان، slug، خلاصه، lead، دسته، نویسنده، کاور، رنگ پس‌زمینه‌ی کاور، زمان مطالعه، بلوک‌ها، تگ‌ها، منتخب، وضعیت (پیش‌نویس، منتشر، آرشیو)، زمان انتشار، SEO.
- آمار «مفید بود».
- دسته‌ها و نویسنده‌های بلاگ endpoint ادمین ندارند (بخش ۷).

### ۲.۱۲ سوالات متداول `/faq`

گروه‌ها با آیکن و تگ «امضای کیوا»، منوی کناری با شمارنده و scrollspy، جستجو با هایلایت. لینک مستقیم به گروه با `#reserve`، `#shipping`، `#return` و غیره. کادر «هنوز سؤال داری؟» با پیام‌رسان‌ها و تلفن.

**برای پنل:** گروه‌ها (`id` همان anchor است؛ فرانت و فوتر به `reserve`، `shipping`، `return` لینک می‌دهند، پس عوض کردنشان لینک را می‌شکند) و سؤال‌ها با ترتیب.

### ۲.۱۳ تماس `/contact`

- کارت‌های تماس، لیست پیام‌رسان‌ها، ساعت پاسخگویی (همه از تنظیمات ثابت).
- **فرم:** موضوع (`GET /contact/topics`؛ بعضی موضوع‌ها کد سفارش می‌خواهند)، نام، موبایل، ایمیل، کد سفارش، پیام تا ۶۰۰ حرف. برای کاربر واردشده پیش‌پر می‌شود.
- بعد از ارسال: «پیامت رسید!» با کد `CT-…`.
- `?topic=` از دکمه‌ی «گزارش به پشتیبانی» بلوک‌های خطا.

**برای پنل:** تیکت‌ها (`OPEN`، `IN_PROGRESS`، `CLOSED`)، پاسخ با پیامک یا ایمیل، یادداشت داخلی. موضوع‌ها enum ثابت‌اند.

### ۲.۱۴ درباره ما `/about`

محتوای برند ثابت + شمارنده‌های متحرک از `GET /site/stats`: مشتری راضی، عکس قبل از ارسال، درصد رضایت، تعداد مدل.

**برای پنل:** `siteStats` در تنظیمات (`AdminSettings.siteStats`).

### ۲.۱۵ صفحات ثابت `/pages/[slug]`

مثلاً `/pages/terms` (قوانین و حریم خصوصی؛ از صفحه‌ی ورود، تسویه و فوتر لینک دارد و برای اینماد لازم است). HTML از API، با ISR ده‌دقیقه‌ای.

**برای پنل:** slug، عنوان، HTML، SEO.

### ۲.۱۶ سراسری (سیستم)

- **SEO:** متادیتا از بلوک `seo` هر موجودیت، `sitemap.xml` (صفحه‌ها، دسته‌ها، محصول‌ها با عکس، مقاله‌ها، صفحات فوتر)، `robots.txt`، ۴۰۴ واقعی، JSON-LD.
- **رندر سمت سرور (prefetch)** برای صفحه‌های عمومی.
- صفحه‌های شخصی `noindex` هستند.
- **خطاها:** همه‌ی خطاها با متن فارسی سرور نمایش داده می‌شوند. خطای `5xx` «کد پیگیری» (`traceId`) دارد. دکمه‌ی «گزارش به پشتیبانی» به فرم تماس می‌رود.

**برای پنل:** هر موجودیت (محصول، دسته، مقاله، صفحه) فیلد SEO دارد: عنوان، توضیح تا ۱۷۰ حرف، canonical، تصویر OG، `noIndex`، `jsonLd`.

---

## ۳. چرخه‌ها و قوانین کسب‌وکار

### ۳.۱ وضعیت سفارش

| `status` | برچسب | چه کسی به این وضعیت می‌برد | tone |
|---|---|---|---|
| `PENDING_PAYMENT` | در انتظار پرداخت | ثبت سفارش | warn |
| `PAYMENT_FAILED` | پرداخت ناموفق | درگاه | danger |
| `EXPIRED` | منقضی | سیستم، ۱۵ دقیقه بعد از ثبت بدون پرداخت | danger |
| `RESERVED` | رزرو شده | پرداخت موفق با رزرو، یا پیوستن به گروه رزرو | cream |
| `PROCESSING` | در حال آماده‌سازی | پرداخت موفق بدون رزرو؛ یا **خودکار** در پایان مهلت رزرو | warn |
| `PHOTO_SENT` | عکس کیف ارسال شد | اپراتور: `POST …/pre-shipment-media/send` | default |
| `CHANGE_REQUESTED` | درخواست تغییر ثبت شد | مشتری: «می‌خوام عوضش کنم» | warn |
| `SHIPPED` | در مسیر | اپراتور: `PUT …/shipment` (کد رهگیری + پیامک) | default |
| `DELIVERED` | تحویل شده | اپراتور: `POST …/status` | success |
| `CANCELLED` | لغو شده | مشتری (تا قبل از ارسال) یا ادمین | danger |
| `RETURN_REQUESTED` / `RETURNED` / `REFUNDED` | درخواست مرجوعی / مرجوع شد / وجه برگشت داده شد | مشتری / اپراتور / ادمین | warn / default |

- **مسیر اصلی:** `PENDING_PAYMENT → (RESERVED) → PROCESSING → PHOTO_SENT → SHIPPED → DELIVERED`.
- `RESERVED → PROCESSING` فقط خودکار است. `RESERVED → CANCELLED` با لغو مشتری یا ادمین.
- پنل گزینه‌های تغییر وضعیت را از `AdminOrder.allowedTransitions` می‌گیرد. انتقال غیرمجاز `422` می‌گیرد.
- سرور برای هر سفارش `statusLabel`، `statusTone` و `progress` (۴ مرحله با تاریخ) را آماده برمی‌گرداند.

### ۳.۲ روند انجام یک سفارش برای اپراتور

۱. صف «باید عکاسی شود»: `GET /admin/orders?awaitingPhotos=true` (یا `status=PROCESSING`).
۲. عکاسی و فیلم‌برداری از **همان** کیف ← `POST /admin/media` (`purpose=PRE_SHIPMENT`) برای هر فایل ← `mediaId`.
۳. اتصال به سفارش، به ازای هر قلم کالا: `PUT /admin/orders/{code}/pre-shipment-media` (`mediaId`، `orderItemId`، `view`، ترتیب).
۴. ارسال به پیام‌رسان مشتری: `POST /admin/orders/{code}/pre-shipment-media/send`.
   - با ربات خودکار است؛ وگرنه اپراتور دستی می‌فرستد و `manual=true` ثبت می‌کند.
   - با `channelOverride` و `message` اختیاری.
   - وضعیت `PHOTO_SENT` می‌شود و پیامک می‌رود.
۵. پاسخ مشتری در `preShipmentMedia.feedback` می‌آید:
   - `APPROVE`: بسته‌بندی.
   - `REQUEST_CHANGE`: سفارش `CHANGE_REQUESTED` می‌شود. انجام تغییر endpoint ندارد (بخش ۷).
   - بدون پاسخ تا `feedbackDeadline` (`preShipmentFeedbackHours`، [پیشنهادی]): خودکار تأییدشده.
۶. تحویل به حامل: `PUT /admin/orders/{code}/shipment` (حامل، کد رهگیری ۶ تا ۴۰ کاراکتر، زمان، `showInDailyList`).
   - وضعیت `SHIPPED` و پیامک.
   - برای گروه رزرو، **همین کد روی همه‌ی سفارش‌های گروه** ثبت می‌شود.
۷. تحویل شد: `POST /admin/orders/{code}/status` با `DELIVERED` (`notifyCustomer` اختیاری، که پیامک درخواست نظر می‌فرستد).
۸. در هر مرحله: یادداشت داخلی `POST /admin/orders/{code}/notes`.

**جمعه‌ها ارسال نداریم** (`nonShippingWeekdays`).

### ۳.۳ رزرو ۴ روزه

- سوییچ اختیاری **کنار** روش ارسال است، نه جای آن. مبلغ کامل با هزینه‌ی ارسال پرداخت می‌شود و سفارش `RESERVED` می‌ماند.
- مهلت از **پرداخت موفق سفارش اول** شروع می‌شود و `reservationHoldDays` (۴) روز بعد تمام می‌شود. برای کل گروه ثابت است و تمدید نمی‌شود.
- **پیوستن:** سفارش جدید به **همان آدرس** خودکار به گروه می‌پیوندد: ارسال رایگان (`RESERVATION_CONSOLIDATION`) و روش ارسال سفارش اصلی.
- هر کاربر حداکثر **یک** رزرو فعال دارد. کالایی با `reservable=false` رزرو را برای کل سبد غیرفعال می‌کند.
- **پایان مهلت:** همه‌ی سفارش‌های گروه خودکار `PROCESSING` می‌شوند و بعد ارسال گروهی با یک کد رهگیری.
- **لغو** هر سفارش گروه تا قبل از `SHIPPED` آزاد است. لغو سفارش اصلی مهلت را از بین نمی‌برد.

**در پنل:**
- `AdminOrderListItem`: `reserved`، `reservationExpiresAt`، `shipmentGroupCode`.
- `AdminOrder.shipmentGroup`: `code` مثل `SG-3021`، `orderCodes`، `releaseAt`.
- تنظیمات: `reservationEnabled`، `reservationHoldDays`.

### ۳.۴ عکس قبل از ارسال («امضای کیوا»)

- پیام‌رسان و شماره در تسویه **اجباری** است. یک نسخه از عکس‌ها برای همیشه در جزئیات سفارش می‌ماند.
- وضعیت عکس (`PreShipmentMedia.status`): `WAITING`، `SENT`، `APPROVED`، `CHANGE_REQUESTED`.
- **درخواست تغییر مشتری** (`PreShipmentFeedbackRequest`):
  - `changeType`: `COLOR`، `MODEL`، `CANCEL_ITEM` یا `OTHER`
  - `orderItemId`
  - `desiredVariantId` (رنگ یا مدل جایگزین)
  - `note`
- مابه‌التفاوت را فرانت فقط نمایش می‌دهد (`قیمت ورینت × تعداد − lineTotal`).
- **در پنل:** `mediaApprovalRate` و `changeRequestRate` در داشبورد.

### ۳.۵ لغو و استرداد

- **لغو مشتری** (`POST /me/orders/{code}/cancel`): تا قبل از `SHIPPED`.
  - دلیل: `CHANGED_MIND`، `NOT_AS_PICTURED`، `ORDERED_BY_MISTAKE`، `FOUND_CHEAPER`، `DELIVERY_TOO_LONG`، `OTHER` + یادداشت.
  - پاسخ یک `Refund` است (حداکثر ۷۲ ساعت به همان کارت).
  - سفارش پرداخت‌نشده refund ندارد.
- **Refund:**
  - `method`: `ORIGINAL_PAYMENT`، `BANK_TRANSFER`، `STORE_CREDIT`
  - `status`: `PENDING`، `PROCESSING`، `COMPLETED`، `FAILED`
  - `expectedBy`، `completedAt`، `referenceId`
- **استرداد ادمین** (`POST /admin/orders/{code}/refunds`، فقط ADMIN): کامل یا جزئی، با دلیل و روش. می‌تواند به یک مرجوعی وصل شود (`returnId`).
- ⚠️ تغییر وضعیت یک refund (مثلاً به `COMPLETED`) endpoint ندارد (بخش ۷).

### ۳.۶ مرجوعی

- **درخواست مشتری:** تا **۷ روز** بعد از تحویل (`returnWindowDays`؛ `returnableUntil` روی هر قلم). فقط برای محصول با `returnable=true`.
- **ورودی‌ها:** اقلام و تعداد، دلیل، توضیح، عکس و ویدیوی مستند، روش برگشت پول، و شبا (`IR` + ۲۴ رقم، فقط برای انتقال بانکی).
- **دلیل‌ها (`ReturnReason`):** `NOT_AS_PICTURED`، `MANUFACTURING_DEFECT`، `WRONG_ITEM`، `DAMAGED_IN_TRANSIT`، `CHANGED_MIND`، `OTHER`.
  - سه مورد اول «مشکل از کیوا»‌اند و هزینه‌ی برگشت با کیواست.
  - برای `CHANGED_MIND` هزینه با مشتری است.
- **وضعیت‌ها (`ReturnStatus`):** `REQUESTED → APPROVED / REJECTED → PICKUP_SCHEDULED → RECEIVED → REFUNDED → CLOSED`. کد مرجوعی شکل `RT-1012` دارد.
- **تصمیم ادمین** (`POST /admin/returns/{id}/decision`):
  - `approve`
  - `shippingPaidBy` (`KIVA` یا `CUSTOMER`)
  - `instructions`: متن راهنمای ارسال برگشتی که مشتری روی کارتش می‌بیند
  - `rejectionReason`
- ⚠️ وضعیت‌های بعد از تصمیم (`PICKUP_SCHEDULED`، `RECEIVED`، `CLOSED`) endpoint ندارند (بخش ۷).

### ۳.۷ پرداخت

- درگاه‌ها: `ZARINPAL`، `SAMAN`، `MELLAT`. پرداخت‌ها `Idempotency-Key` دارند.
- **وضعیت پرداخت:** `PENDING`، `SUCCEEDED`، `FAILED`، `CANCELLED`، `EXPIRED`، `REFUNDED`.
- پرداخت دوباره هم از نتیجه‌ی پرداخت هست، هم از کارت سفارش در حساب.
- `PAYMENT_GATEWAY_UNAVAILABLE` یعنی همان درگاه غیرفعال نشان داده می‌شود.
- **در پنل:** `AdminOrder.payments`، و `paymentGateways` (فعال بودن، پیش‌فرض) در تنظیمات.

### ۳.۸ قیمت، تخفیف، ارسال

- **پول:** همه‌ی مبالغ عدد صحیح **تومان** هستند. تبدیل به ریال فقط در لایه‌ی درگاه انجام می‌شود.
- **جمع سبد:** `itemsCompareAtTotal − productDiscount = subtotal` ← `− codeDiscount + shippingCost = payable`.
- **ارسال رایگان:** فقط پست، وقتی `subtotal` (قبل از کد تخفیف) ≥ `freeShippingThreshold` (۳٬۰۰۰٬۰۰۰).
- **کد تخفیف:**
  - نوع: درصدی (روی `subtotal`، گرد به ۱٬۰۰۰، با سقف `maxDiscount`) یا مبلغی.
  - شرط‌ها: حداقل خرید، فقط خرید اول، فقط با ورود، بازه‌ی زمانی، سقف کل و سقف هر کاربر، اعمال‌نشدن روی کالاهای تخفیف‌خورده، فقط برای دسته‌ها یا محصول‌های خاص.
  - آمار: `usedCount`، `totalDiscountGiven`.
- **تخفیف محصول:** با `compareAtPrice` (و `compareAtPriceOverride` روی ورینت).
- **کمپین:** محصولات حراج با شمارش معکوس. `productIds` خالی یعنی همه‌ی محصولات تخفیف‌دار.

### ۳.۹ موجودی و «موجود شد خبرم کن»

- موجودی دقیق در فروشگاه نشان داده نمی‌شود؛ فقط زیر `lowStockThreshold` (۵) «فقط N عدد». سقف تعداد در سبد، موجودی ورینت است.
- **پنل** موجودی را دقیق می‌بیند:
  - `stockOnHand`: موجودی فیزیکی.
  - `stockReserved`: سبدهای در حال پرداخت + سفارش‌های ارسال‌نشده.
  - `stockAvailable`.
- **تغییر موجودی** فقط با `POST /admin/inventory/adjustments`، با دلیل و لاگ:
  - `delta` (مثبت یا منفی).
  - `reason`: `RESTOCK`، `STOCKTAKE`، `DAMAGED`، `RETURNED`، `MANUAL_CORRECTION`.
  - موجودی اولیه فقط موقع ساخت ورینت است.
- **اشتراک «موجود شد»:** کانال پیامک. وضعیت‌ها `ACTIVE`، `NOTIFIED`، `CANCELLED`. با شارژ ورینتی که صفر بوده، پیامک خودکار صف می‌شود.

### ۳.۱۰ نظرات

- وضعیت: `PENDING`، `APPROVED`، `REJECTED`. تا تأیید نشود، فقط برای نویسنده‌اش دیده می‌شود.
- تگ «خریدار» وقتی است که به خرید وصل باشد (`orderItemId`).
- رأی «به دردت خورد؟» برای هر کاربر نگه داشته می‌شود.
- **در پنل:**
  - صف با فیلتر وضعیت، محصول و «پاسخ دارد/ندارد».
  - `contact` و `customerId` نویسنده.
  - تأیید یا رد (با دلیل، و پاسخ هم‌زمان).
  - ثبت، ویرایش یا حذف «پاسخ کیوا».

### ۳.۱۱ پیامک‌ها و اعلان‌ها (کانترکت، بخش ۵)

| رویداد | کانال |
|---|---|
| کد OTP | SMS |
| پرداخت موفق (کد سفارش + لینک پیگیری) | SMS |
| ارسال عکس قبل از ارسال | پیام‌رسان انتخابی + SMS |
| ۱۲ ساعت مانده به پایان رزرو [پیشنهادی] | SMS |
| تحویل به پست یا تیپاکس (کد رهگیری) | SMS |
| تحویل شد (درخواست نظر) | SMS |
| موجود شد | SMS |
| افت قیمت علاقه‌مندی [پیشنهادی] | SMS (فقط با رضایت بازاریابی) |
| تغییر شماره (هشدار به شماره‌ی قبلی) | SMS |
| پاسخ پیام تماس | SMS یا ایمیل |

---

## ۴. API پنل ادمین (کانترکت 1.4.0)

همه با `Authorization: Bearer`. لیست‌ها `{ items, meta }` با `page` (از ۱) و `size` برمی‌گردانند. خطاها `application/problem+json` با `code` و `message` فارسی‌اند.

### ۴.۱ کاتالوگ — ADMIN، CATALOG_MANAGER

| endpoint | کار | ورودی مهم |
|---|---|---|
| `GET /admin/products` | لیست همه‌ی وضعیت‌ها با موجودی دقیق | `q`، `status` (`DRAFT`/`ACTIVE`/`ARCHIVED`)، `category`، `stockStatus`، `sort` (`newest`، `updated`، `name`، `price_asc`، `price_desc`، `bestselling`، `stock_asc`)، `page`، `size` |
| `POST /admin/products` | ساخت (ورینت‌ها هم‌زمان) | `ProductUpsertRequest` — `409` برای slug یا SKU تکراری |
| `GET /admin/products/{id}` | جزئیات | ← `AdminProduct` (+ `adminVariants`، `viewsCount`، `conversionRate`، `etag`) |
| `PUT /admin/products/{id}` | ویرایش کامل | هدر `If-Match` (etag) ← `412`، یا `409 CHANGED_BY_SOMEONE_ELSE` / `DUPLICATE_SLUG` / `DUPLICATE_SKU` |
| `DELETE /admin/products/{id}` | آرشیو (حذف نرم) | سفارش‌های قبلی سالم می‌مانند |
| `PATCH /admin/products/{id}/status` | انتشار / پیش‌نویس / آرشیو | `status`، `publishAt` (انتشار زمان‌بندی‌شده) |
| `POST /admin/products/{id}/variants` | ورینت رنگی جدید | `VariantUpsertRequest` — `409` اگر رنگ تکراری |
| `PUT /admin/products/{id}/variants/{vid}` | ویرایش ورینت | قیمت اختصاصی، مدیا، وضعیت |
| `DELETE /admin/products/{id}/variants/{vid}` | غیرفعال کردن ورینت | — |
| `POST /admin/inventory/adjustments` | تغییر موجودی با لاگ | `variantId`، `delta`، `reason`، `note` |
| `GET /admin/inventory/adjustments` | تاریخچه | `variantId` |
| `POST /admin/media` (+ OPERATOR، CONTENT_EDITOR) | آپلود multipart | `file`، `purpose` (`PRODUCT`، `PRE_SHIPMENT`، `BLOG`، `BANNER`، `CATEGORY`، `TESTIMONIAL`)، `alt` ← `MediaAsset` (سرور webp/avif، poster و blurhash را می‌سازد) |
| `GET/POST /admin/categories`، `PUT/DELETE /admin/categories/{id}` | دسته‌ها | `name`، `slug`، `description`، `iconBagType`، `iconColorKey`، `imageMediaId`، `sortOrder`، `showInMenu`، `seo` — حذف فقط بدون محصول (`409`) |
| `POST /admin/colors`، `PUT /admin/colors/{key}` | پالت رنگ | `key`، `name`، `hex`، `isLight`، `sortOrder` |
| `POST /admin/materials` | متریال | `name`، `slug`، `family`، `description`، `careInstructions[]` |

**فیلدهای `ProductUpsertRequest`:**
- **اجباری:** `name` (۱۲۰)، `slug` (لاتین کوچک، رقم و خط تیره؛ حداقل یک حرف)، `categoryId`، `bagType`، `price`، `materialId`.
- **اختیاری:**
  - `sku` (خالی = خودکار `KV-xxxx`)، `materialDescription`، `compareAtPrice`، `shortDescription` (۳۰۰)
  - `description` (HTML)، `highlights` (۸ × ۱۶۰)، `specs`، `tags`
  - `newUntil`، `maxPerOrder` (پیش‌فرض ۵)، `returnable`، `reservable`، `sortPriority`، `status`، `seo`
  - `variants` (فقط موقع ساخت)

**فیلدهای `VariantUpsertRequest`:**
- `colorKey` (اجباری)
- `sku` (خالی = خودکار `KV-1001-LIL`)، `barcode`
- `priceOverride`، `compareAtPriceOverride`
- `stockQuantity` (فقط اولیه)
- `isDefault`، `isActive`، `sortOrder`
- `media[]` = `{ mediaId, view, sortOrder, isPrimary, alt }`

**`specs`:** ابعاد، وزن، بسته‌شدن، بندها، جیب‌ها و غیره (`ProductSpecs`). نسخه‌ی آماده‌ی نمایش در `specTable` است.

### ۴.۲ سفارش‌ها و مرجوعی — ADMIN، OPERATOR

| endpoint | کار | ورودی مهم |
|---|---|---|
| `GET /admin/orders` | صف سفارش‌ها | `status[]` (چندتایی)، `q` (کد، موبایل یا نام)، `shippingMethod`، `reserved`، `awaitingPhotos`، `from`، `to` ← آیتم‌ها + `statusCounts` |
| `GET /admin/orders/{code}` | جزئیات | ← `AdminOrder` = جزئیات سفارش + `customer` (با `ordersCount`)، `shipmentGroup`، `payments`، `refunds`، `notes`، `allowedTransitions` |
| `POST /admin/orders/{code}/status` | تغییر وضعیت | `status`، `note`، `notifyCustomer` — `422` برای انتقال غیرمجاز |
| `PUT /admin/orders/{code}/pre-shipment-media` | اتصال عکس و ویدیو | `items[] = { mediaId, orderItemId, view, sortOrder }` |
| `POST /admin/orders/{code}/pre-shipment-media/send` | ارسال به پیام‌رسان ← `PHOTO_SENT` | `manual`، `channelOverride`، `message` |
| `PUT /admin/orders/{code}/shipment` | ثبت ارسال ← `SHIPPED` | `carrier`، `trackingCode`، `shippedAt`، `showInDailyList` |
| `POST /admin/orders/{code}/notes` | یادداشت داخلی | `text` (۱۰۰۰) |
| `POST /admin/orders/{code}/refunds` (**فقط ADMIN**) | استرداد | `amount`، `reason`، `method`، `returnId` |
| `GET /admin/returns` | لیست مرجوعی‌ها | `status` |
| `POST /admin/returns/{id}/decision` | تأیید یا رد | `approve`، `shippingPaidBy`، `instructions`، `rejectionReason` |

**ستون‌های لیست سفارش (`AdminOrderListItem`):** کد، زمان ثبت، وضعیت، نام و موبایل مشتری، شهر، تعداد کالا، مبلغ، روش ارسال، پیام‌رسان، رزرو و پایان رزرو، کد گروه ارسال، تعداد مدیا، کد رهگیری.

### ۴.۳ بازاریابی

| endpoint | نقش | کار و فیلدها |
|---|---|---|
| `GET/POST /admin/discount-codes`، `PUT/DELETE /admin/discount-codes/{id}` | **فقط ADMIN** | فیلدها در فهرست زیر جدول؛ لیست با فیلتر `active`؛ حذف = غیرفعال |
| `GET/POST /admin/campaigns`، `PUT /admin/campaigns/{id}` | ADMIN، CONTENT_EDITOR | `slug`، `title`، `subtitle`، `icon`، `startsAt`، `endsAt`، `productIds` (خالی = همه‌ی تخفیف‌دارها)، `isActive` |
| `GET/POST /admin/banners`، `PUT/DELETE /admin/banners/{id}` | ADMIN، CONTENT_EDITOR | `placement` (`HOME_HERO`، `HOME_PROMO`، `SHOP_TOP`، `PRODUCT_SIDEBAR`، `BLOG_TOP`)، `theme` (`CREAM`، `PURPLE`، `LILAC`، `DARK`، `WHITE`)، `tagLabel`، `tagIcon`، `title`، `text`، `ctaLabel`، `ctaUrl`، `imageMediaId`، `overlayHighlight`، `overlayTitle`، `overlaySubtitle`، `overlayChannel`، `sortOrder`، `startsAt`، `endsAt` |
| `PUT /admin/announcements` | ADMIN، CONTENT_EDITOR | جایگزینی **کل** لیست مرتب: `{ icon, text, url, sortOrder, startsAt, endsAt }` |
| `POST /admin/testimonials`، `PUT/DELETE /admin/testimonials/{id}` | ADMIN، CONTENT_EDITOR | `customerName`، `city`، `source` (روبیکا، تلگرام، بله، اینستاگرام)، `message` (۵۰۰)، `messageTime`، `receivedAt`، `rating`، `productId`، `colorKey`، `screenshotMediaId`، `isPublished`، `sortOrder` |

**فیلدهای کد تخفیف:**
- `code` (`^[A-Z0-9_-]{3,32}$`)، `type` (`PERCENT` یا `FIXED`)، `value`، `label`
- `minSubtotal`، `maxDiscount`، `startsAt`، `endsAt`
- `usageLimit`، `perUserLimit`، `firstOrderOnly`، `requiresLogin`، `excludeSaleItems`
- `categoryIds`، `productIds`، `isActive`
- فقط در پاسخ: `usedCount`، `totalDiscountGiven`

### ۴.۴ محتوا — ADMIN، CONTENT_EDITOR (تنظیمات فقط ADMIN)

| endpoint | کار و فیلدها |
|---|---|
| `POST /admin/blog/posts`، `PUT/DELETE /admin/blog/posts/{id}` | `title`، `slug`، `excerpt` (۳۰۰)، `lead`، `categoryId`، `authorId`، `coverMediaId`، `coverBackground`، `readingMinutes` (خالی = خودکار)، `blocks[]` (`HEADING`، `PARAGRAPH`، `QUOTE`، `TIP`، `PRODUCT` با `productId`، `IMAGE` با `imageMediaId`، `LIST` با `items`)، `tags`، `isFeatured`، `status` (`DRAFT`، `PUBLISHED`، `ARCHIVED`)، `publishedAt`، `seo` |
| `PUT /admin/faq/groups` | ذخیره‌ی **کل** گروه‌ها و سؤال‌ها با ترتیب (`FaqGroup`: `id` = anchor، `name`، `icon`، `isSignature`، `sortOrder`، `questions`) |
| `PUT /admin/pages/{slug}` | ساخت یا ویرایش صفحه‌ی ثابت: `title`، `content` (HTML)، `seo` |
| `GET/PUT /admin/settings` (**فقط ADMIN**) | `shippingMethods`، `freeShippingThreshold`، `freeShippingMethods`، `reservationEnabled`، `reservationHoldDays`، `returnWindowDays`، `lowStockThreshold`، `preShipmentFeedbackHours`، `paymentPendingMinutes`، `nonShippingWeekdays`، `supportPhone`، `supportEmail`، `supportHours`، `social`، `paymentGateways`، `siteStats`، `features` |

### ۴.۵ پشتیبانی و گزارش

| endpoint | نقش | کار و فیلدها |
|---|---|---|
| `GET /admin/reviews` | ADMIN، SUPPORT | فیلتر `status`، `productId`، `hasReply` ← + `customerId`، `contact`، `pendingCount` |
| `POST /admin/reviews/{id}/moderation` | ADMIN، SUPPORT | `action` (`APPROVE` یا `REJECT`)، `rejectionReason`، `reply` |
| `PUT/DELETE /admin/reviews/{id}/reply` | ADMIN، SUPPORT | `text` (۲ تا ۱۰۰۰ حرف) |
| `GET /admin/contact-messages` | ADMIN، SUPPORT | فیلتر `status`، `topic` ← کد تیکت، موضوع، نام، موبایل، ایمیل، کد سفارش، پیام، وضعیت، پاسخ، یادداشت داخلی، `userId`، زمان‌ها |
| `PATCH /admin/contact-messages/{ticketCode}` | ADMIN، SUPPORT | `status`، `reply`، `replyChannel` (`SMS` یا `EMAIL`)، `internalNote` |
| `GET /admin/customers` | ADMIN، SUPPORT | `q` (موبایل یا نام) ← موبایل، نام، ایمیل، تعداد سفارش، جمع خرید، آخرین سفارش، پیام‌رسان پیش‌فرض، رضایت پیامک، نقش‌ها، تاریخ عضویت |
| `PUT /admin/customers/{id}/roles` | **فقط ADMIN** | `roles[]` — همه‌ی نشست‌های آن کاربر باطل می‌شوند؛ `422 ROLE_CHANGE_NOT_ALLOWED` برای خودت |
| `GET /admin/reports/overview` | **فقط ADMIN** | `from`، `to` (اجباری) ← درآمد، تعداد سفارش، میانگین سبد، مشتری جدید، `reservationShare`، `mediaApprovalRate`، `changeRequestRate`، `returnRate`، `discountTotal`، `shippingMix`، `messengerMix`، `topProducts`، `dailySeries` |

---

## ۵. enumها و برچسب‌ها (برای UI پنل)

| enum | مقدارها |
|---|---|
| `ProductStatus` | `DRAFT` پیش‌نویس · `ACTIVE` منتشرشده · `ARCHIVED` آرشیو |
| `StockStatus` | `IN_STOCK` · `LOW_STOCK` · `OUT_OF_STOCK` |
| `BagType` | `HOBO` · `CROSSBODY` · `BACKPACK` · `SATCHEL` · `CLUTCH` · `TOTE` · `BUCKET` · `WALLET` |
| `MediaView` | `FRONT` نمای جلو · `SIDE` کنار · `BACK` پشت · `DETAIL` جزئیات · `INTERIOR` داخل کیف · `STYLE` استایل · `ON_MODEL` روی مدل · `SCALE` مقایسه‌ی اندازه |
| `MaterialFamily` | `GENUINE_LEATHER` · `FAUX_LEATHER` · `CANVAS` · `SUEDE` · `FAUX_SUEDE` · `SATIN` · `VELVET` · `COTTON` · `OTHER` |
| `OrderStatus` | بخش ۳.۱ |
| `ShippingMethodCode` | `TIPAX` تیپاکس (۱ تا ۲ روز کاری) · `POST` پست (۳ تا ۵ روز) · `COURIER` پیک [پیشنهادی] |
| `PhotoMessengerChannel` | `RUBIKA` · `TELEGRAM` · `BALE` (+ `INSTAGRAM` در `SocialChannel`) |
| `PaymentGatewayCode` | `ZARINPAL` · `SAMAN` · `MELLAT` |
| `PaymentStatus` | `PENDING` · `SUCCEEDED` · `FAILED` · `CANCELLED` · `EXPIRED` · `REFUNDED` |
| `CancelReason` | `CHANGED_MIND` · `NOT_AS_PICTURED` · `ORDERED_BY_MISTAKE` · `FOUND_CHEAPER` · `DELIVERY_TOO_LONG` · `OTHER` |
| `ReturnReason` | `NOT_AS_PICTURED` · `MANUFACTURING_DEFECT` · `WRONG_ITEM` · `DAMAGED_IN_TRANSIT` · `CHANGED_MIND` · `OTHER` |
| `ReturnStatus` | `REQUESTED` · `APPROVED` · `REJECTED` · `PICKUP_SCHEDULED` · `RECEIVED` · `REFUNDED` · `CLOSED` |
| Refund `method` / `status` | `ORIGINAL_PAYMENT` · `BANK_TRANSFER` · `STORE_CREDIT` / `PENDING` · `PROCESSING` · `COMPLETED` · `FAILED` |
| `PreShipmentMedia.status` | `WAITING` · `SENT` · `APPROVED` · `CHANGE_REQUESTED` |
| feedback `changeType` | `COLOR` · `MODEL` · `CANCEL_ITEM` · `OTHER` |
| `ReviewStatus` | `PENDING` · `APPROVED` · `REJECTED` |
| `ContactTopic` | `ORDER_FOLLOWUP` · `PRODUCT_QUESTION` · `RETURN` · `COLLABORATION` · `OTHER` |
| تیکت تماس | `OPEN` · `IN_PROGRESS` · `CLOSED` |
| `StockAlert.status` | `ACTIVE` · `NOTIFIED` · `CANCELLED` |
| `BannerPlacement` / `theme` | `HOME_HERO` · `HOME_PROMO` · `SHOP_TOP` · `PRODUCT_SIDEBAR` · `BLOG_TOP` / `CREAM` · `PURPLE` · `LILAC` · `DARK` · `WHITE` |
| Inventory `reason` | `RESTOCK` · `STOCKTAKE` · `DAMAGED` · `RETURNED` · `MANUAL_CORRECTION` |
| Media `purpose` | `PRODUCT` · `PRE_SHIPMENT` · `BLOG` · `BANNER` · `CATEGORY` · `TESTIMONIAL` |
| `UserRole` | `CUSTOMER` · `ADMIN` · `CATALOG_MANAGER` · `OPERATOR` · `CONTENT_EDITOR` · `SUPPORT` |

برچسب فارسی و tone وضعیت‌ها را سرور در `statusLabel` / `statusTone` می‌دهد. برای enumهای دیگر، پنل باید نگاشت فارسی خودش را داشته باشد.

---

## ۶. چیزهایی که الان در خود فرانت ثابت است (نه از API)

به درخواست شما در جلسه‌ی ۵، `/config` و متن صفحه‌ی اصلی از خود Next خوانده می‌شوند (`/kiva-configs/*`)، نه از بک‌اند. پس **تغییرشان در پنل، در سایت دیده نمی‌شود** تا وقتی که یکی از این دو کار انجام شود:
- فرانت دوباره از API بخواند.
- یا این مقادیر با دیپلوی فرانت عوض شوند.

| چه | فایل در فرانت | معادل در کانترکت پنل | وضعیت |
|---|---|---|---|
| نوار اطلاعیه | `src/config/site.ts` → `announcements` | `PUT /admin/announcements` | ⚠️ پنل عوضش کند، سایت نمی‌بیند |
| روش‌ها و هزینه‌ی ارسال، آستانه‌ی ارسال رایگان، جمعه‌ها | `shipping` | `AdminSettings` | محاسبه‌ی سبد با بک‌اند است، پس **پول درست حساب می‌شود**؛ ولی متن‌ها (فوتر، نوار اطلاعیه، تب «ارسال و بازگشت») ثابت می‌مانند |
| رزرو (فعال، ۴ روز)، بازگشت (۷ روز) | `reservation`، `returns` | `AdminSettings` | همان: منطق با بک‌اند، متن‌ها ثابت |
| پشتیبانی (تلفن، ایمیل، ساعت‌ها)، شبکه‌های اجتماعی | `support`، `social` | `AdminSettings` | ⚠️ فوتر، تماس و FAQ ثابت‌اند |
| درگاه‌ها | `paymentGateways` | `AdminSettings.paymentGateways` | مودال پرداخت حساب از فایل ثابت؛ تسویه از `GET /checkout` |
| پیام‌رسان‌های عکس قبل از ارسال | `preShipmentPhoto.channels` | — | ثابت |
| لینک‌های فوتر، نمادها، perks محصول، برند و لوگو | `footerLinks`، `trustBadges`، `productPerks`، `brand` | — | فقط در فرانت |
| هیرو، نوار ویژگی‌ها، دو بنر تبلیغاتی، «چطور کار می‌کنه» | `src/app/(home)/_utils/homeContent.ts` | بنرها (`HOME_HERO`، `HOME_PROMO`) | ⚠️ اگر پنل بنر دارد، فرانت باید `GET /banners` را بخواند |
| متن تب «ارسال و بازگشت» محصول، محتوای «درباره ما» | کامپوننت‌ها | — | ثابت |
| آمار «درباره ما» | از API (`/site/stats`) | `AdminSettings.siteStats` | ✅ از پنل قابل تغییر |

**تصمیم لازم قبل از پنل:** کدام‌ها باید از پنل قابل ویرایش باشند؟ برای آن‌ها فرانت به خواندن از API برمی‌گردد (`GET /config`، `GET /banners`، و برای خانه همان `/home` بک‌اند یا ترکیبی).

---

## ۷. شکاف‌ها: چیزهایی که پنل لازم دارد ولی در کانترکت نیست

| # | نیاز | چرا | پیشنهاد |
|---|---|---|---|
| 1 | **لیست مقاله‌ها برای ادمین** | فقط ساخت، ویرایش و حذف هست؛ `GET /blog/posts` عمومی پیش‌نویس‌ها را نشان نمی‌دهد | `GET /admin/blog/posts` (+ `GET /admin/blog/posts/{id}`) |
| 2 | **دسته‌ها و نویسنده‌های بلاگ** | مقاله `categoryId` و `authorId` می‌خواهد | `/admin/blog/categories`، `/admin/blog/authors` |
| 3 | **لیست پیام‌های رضایت برای ادمین** | `GET /testimonials` عمومی منتشرنشده‌ها را نشان نمی‌دهد | `GET /admin/testimonials` |
| 4 | **لیست و خواندن صفحات ثابت** | فقط `PUT` با slug هست | `GET /admin/pages` |
| 5 | **خواندن نوار اطلاعیه و FAQ برای فرم** | فقط `PUT` کل لیست هست (`/faq` عمومی جایگزین ممکنی است) | `GET` معادل |
| 6 | **متریال و رنگ** | متریال فقط `POST` (ویرایش، حذف، لیست ادمین ندارد)؛ رنگ حذف یا غیرفعال ندارد | `PUT/DELETE` |
| 7 | **انجام درخواست تغییر مشتری** (`CHANGE_REQUESTED`) | تعویض ورینت یا حذف قلم در سفارش و مابه‌التفاوت (پرداخت یا استرداد) endpoint ندارد | مثلاً `POST /admin/orders/{code}/items/{itemId}/replace` + لینک پرداخت مابه‌التفاوت |
| 8 | **ادامه‌ی چرخه‌ی مرجوعی** | فقط `decision` هست؛ `PICKUP_SCHEDULED`، `RECEIVED`، `CLOSED` و برگشت کالا به انبار راهی ندارند | `POST /admin/returns/{id}/status` (+ adjustment خودکار `RETURNED`) |
| 9 | **وضعیت استرداد** | `Refund` بعد از ساخت (مثلاً `COMPLETED` با `referenceId`) به‌روز نمی‌شود | `PATCH /admin/refunds/{id}` |
| 10 | **جزئیات مشتری** | فقط لیست و نقش‌ها هست؛ آدرس‌ها، سفارش‌ها، نظرها و اشتراک‌ها نیست (سفارش‌ها با `q=موبایل` قابل جستجوست) | `GET /admin/customers/{id}` |
| 11 | **مشترکین خبرنامه** | `POST /newsletter/subscriptions` هست، لیست و خروجی گرفتن نیست | `GET /admin/newsletter/subscribers` (+ CSV) |
| 12 | **اشتراک‌های «موجود شد»** | فقط شمارنده روی ورینت | `GET /admin/stock-alerts?variantId=` |
| 13 | **«جستجوهای پرتکرار»** پنل جستجو | منبعش معلوم نیست (خودکار یا دستی) | اگر دستی است، `PUT /admin/search/hints` |
| 14 | **«سؤال داری؟»** محصول | متن آماده و لینک پیام‌رسان‌ها | در `AdminSettings` |
| 15 | **محصولات مرتبط** | منطق انتخاب معلوم نیست | فیلد `relatedProductIds` در محصول، یا خودکار |
| 16 | **تراکنش‌ها و پرداخت‌ها** | فقط داخل هر سفارش؛ گزارش و مغایرت‌گیری نیست | `GET /admin/payments` |
| 17 | **گروه‌های ارسال رزرو** | فقط از طریق سفارش‌ها (`reserved`) | `GET /admin/shipment-groups` (اختیاری) |
| 18 | **رویدادهای امنیتی و لاگ تغییرات** | کانترکت می‌گوید تغییر نقش ثبت می‌شود ولی خواندنش راهی ندارد | `GET /admin/audit-log` |
| 19 | **حذف حساب** | `DELETE /me` بعد از فاز سفارش؛ پنل شاید بخواهد ببیند یا انجام دهد | بعداً |
| 20 | **موضوع‌های تماس** | enum ثابت است؛ اینکه کدام کد سفارش لازم دارد در `GET /contact/topics` است | اگر باید قابل تغییر باشد، endpoint |
| 21 | **لیست کمپین‌ها و بنرها با فیلتر وضعیت/زمان، و حذف کمپین** | کمپین `DELETE` ندارد | `DELETE` یا `isActive=false` |

---

## ۸. نکات فنی برای ساخت پنل (از تجربه‌ی فروشگاه)

**نشست و ورود:** همان مدل فروشگاه (بخش ۱.۴). در `kiva-fe` آماده است و قابل کپی:
- `src/httpClient/session.ts`: refresh با کوکی، تک‌پرواز، قفل بین تب‌ها.
- `src/httpClient/HttpClient.ts`: Bearer و یک بار تمدید روی ۴۰۱.
- `src/app/sessionProvider.tsx`: بازیابی نشست با باز شدن صفحه، هماهنگی تب‌ها.
- `src/store/auth.store.ts`
- `src/app/_components/ui/otpInput`، و مراحل ورود در `src/app/(auth)`.

**خطاها:**
- `src/httpClient/utils/mapError.ts`: problem+json به `ResultError`، کد پیگیری برای ۵xx، `Retry-After`.
- `src/utils/apiError.ts` (`toErrorView` + presetها)، و اسکیل‌های `error-ui` و `data-fetching`.
- `CHANGED_BY_SOMEONE_ELSE` و `412` (ویرایش محصول با `If-Match` / `etag`) یعنی: داده را دوباره بخوان و فرم را تازه کن.
- `403` یعنی صفحه‌ی «دسترسی نداری».

**مدیا:** دو مرحله است:
۱. `POST /admin/media` (multipart، با درصد پیشرفت؛ الگو در `uploadFile` حساب کاربری) ← `mediaId`.
۲. `mediaId` در فرم محصول، بنر، مقاله، دسته، پیام رضایت یا عکس قبل از ارسال.

**قراردادهای داده:**
- پول عدد صحیح تومان.
- تاریخ ISO-8601. نمایش شمسی با `Intl` و `fa-IR-u-ca-persian` (`src/utils/format.ts`، `src/utils/jalali.ts`).
- ورودی‌ها رقم فارسی را قبول می‌کنند؛ فیلدهای داده رقم لاتین‌اند.
- slug: `^(?=.*[a-z])[a-z0-9]+(-[a-z0-9]+)*$`.
- فیلدهای بی‌مقدار `null` هستند، نه حذف‌شده.

**صفحه‌بندی:** `page` از ۱ و `size`. پاسخ: `meta: { page, size, totalItems, totalPages, hasNext }`.

**پیش‌نمایش:** مقاله، صفحه و محصول در فروشگاه با slug باز می‌شوند (`/blog/{slug}`، `/pages/{slug}`، `/product/{slug}`).
- پیش‌نویس‌ها در سایت دیده نمی‌شوند و endpoint پیش‌نمایش در کانترکت نیست.
- ISR فروشگاه: خانه ۱ دقیقه، بلاگ، FAQ و مقاله ۵ دقیقه، صفحات ثابت ۱۰ دقیقه. یعنی تغییر محتوا تا این مدت در سایت دیر می‌رسد.

**Mock:** `kiva-fe/mock/server.mjs` فقط بخش فروشگاه را دارد. هیچ `/admin/*` در آن نیست.
