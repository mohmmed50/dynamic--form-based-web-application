# استمارة تسجيل درجات الطلاب والشهادات المعادلة (Student Registration Form)

تطبيق **ASP.NET Core 8** واحد (API + واجهة Razor Pages) لتسجيل بيانات الطلاب وحساب درجاتهم المعادلة (سعودية / IG / قطرية / بحرينية / كويتية)، مع حفظ البيانات في **SQL Server**.

> لا يوجد أي كود PHP أو Angular في هذا المشروع — التطبيق بالكامل داخل مشروع `backend/StudentRegistry.API` الواحد.

---

## 📁 هيكلية المشروع

```
backend/
  StudentRegistry.API/            ← نقطة الدخول: يضم الواجهة (Pages/) والـ API (Controllers/) معاً
    Pages/Index.cshtml            ← صفحة الاستمارة (Razor Page واحدة على المسار /)
    Pages/Shared/_Layout.cshtml   ← القالب العام (head/body، خط Tajawal، RTL)
    wwwroot/css/styles.css        ← التنسيقات
    wwwroot/js/{app,conditional,form-handler}.js ← منطق العميل بالكامل (تحقق، حساب الدرجات، إرسال)
    wwwroot/uploads/              ← صور الطلاب المرفوعة
    Controllers/StudentsController.cs ← POST /api/students/register وقراءة بيانات الطلاب
    Controllers/ConfigController.cs   ← مصدر الحقيقة الوحيد للشهادات/المسارات/المواد
    Program.cs                    ← تسجيل الخدمات وخط أنابيب الـ Middleware
  StudentRegistry.Application/    ← DTOs، FluentValidation، منطق حساب الدرجات (StudentService)
  StudentRegistry.Domain/         ← الكيانات (Student وكيانات الدرجات الفرعية)
  StudentRegistry.Data/           ← DbContext + EF Core Migrations
  StudentRegistry.Repository/     ← تنفيذ الاستعلامات (UnitOfWork)
  StudentRegistry.Infrastructure/ ← حفظ الصور (FileStorageService)
database/schema.sql                ← نسخة SQL مرجعية من نفس المخطط (اختيارية، المصدر الحقيقي هو EF Migrations)
```

راجع [ARCHITECTURE.md](ARCHITECTURE.md) لتفاصيل تدفّق البيانات الكامل وكيفية إضافة ميزات جديدة بأمان.

---

## 🚀 التشغيل محلياً

المتطلبات: **.NET 8 SDK**، **SQL Server** (أي إصدار محلي)، أداة `dotnet-ef` (`dotnet tool install -g dotnet-ef`).

```bash
cd backend
dotnet restore
dotnet ef database update --project StudentRegistry.Data --startup-project StudentRegistry.API
dotnet run --project StudentRegistry.API
```

افتح المتصفح على `http://localhost:5000/` — ستجد الاستمارة كاملة. الـ API نفسه متاح على نفس العنوان (`/api/students/register`, `/api/config/subjects`, `/api/config/subjects-saudi`, `/health`, و`/swagger` في بيئة التطوير فقط).

راجع [MIGRATION_DEPLOYMENT_GUIDE.md](MIGRATION_DEPLOYMENT_GUIDE.md) لخطوات النشر الكاملة على IIS.

---

## ⚙️ آلية عمل الاستمارة

الاستمارة صفحة واحدة تعرض كل الأقسام معاً (رفع صورة، بيانات شخصية، ولي أمر، عنوان، الشهادة والمسار، السنة الدراسية، جدول الدرجات)، مع شريط تقدّم بصري يعكس اكتمال الحقول. عند الإرسال:

1. يتم التحقق من كل الحقول في المتصفح (`wwwroot/js/form-handler.js`).
2. تُرسل البيانات كـ JSON (تشمل الصورة كـ base64) عبر `POST /api/students/register` — نفس الأصل (same-origin)، بدون الحاجة لـ CORS.
3. الخادم يتحقق مرة أخرى (FluentValidation)، يحفظ الصورة في `wwwroot/uploads/`، ويحسب الدرجات النهائية من جديد بشكل موثوق (الخادم هو المرجع الأخير للحساب)، ثم يحفظ كل شيء في SQL Server.
4. عند فشل الاتصال بالخادم فقط، تُحفظ البيانات مؤقتاً في `localStorage` كخطة احتياطية، مع إتاحة تنزيل الاستمارة كملف **JSON** أو **CSV** (بترميز UTF-8 BOM لدعم العربية في Excel).

---

## 📊 أنواع الشهادات المدعومة وطرق الحساب

| الشهادة | طريقة الحساب |
|---|---|
| **سعودية** | معدل تراكمي موزون بالمعامل: `(مجموع الدرجة×المعامل) / (100 × مجموع المعاملات) × 100` |
| **IG** (IGCSE/AS/A-Levels) | نقاط لكل تقدير، معامل نسبي اختياري، حافز رياضي، ثم مجموع حكومي معادل من 410 |
| **قطرية / بحرينية / كويتية** | لكل مادة: `الدرجة × الوزن النسبي ÷ 100` |

التفاصيل الكاملة للصيغ (بما فيها جدول تحويل نقاط الـ IG) موجودة في [ARCHITECTURE.md](ARCHITECTURE.md).
