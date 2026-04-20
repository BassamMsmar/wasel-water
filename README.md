# Wasel Water

هيكلة المشروع الحالية مفصولة إلى واجهة Next.js وخلفية Django:

- `frontend/` واجهة المتجر العامة.
- `backend/` لوحة التحكم وواجهات Django API.

## التشغيل المحلي

1. شغل Django API:

```powershell
npm run backend:run
```

2. شغل واجهة المتجر:

```powershell
npm run frontend:dev
```

3. افتح المتجر:

```text
http://127.0.0.1:3000
```

## متغيرات الواجهة

انسخ `frontend/.env.example` إلى `frontend/.env.local` عند الحاجة:

```text
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

## الطلبات

واجهة Next.js ترسل الطلبات إلى:

```text
POST /api/v1/checkout/
```

الطلب يدعم المستخدم المسجل، وإذا لم يكن المستخدم مسجلا يتم إنشاء مستخدم ضيف برقم الجوال حتى تظهر الطلبات داخل لوحة التحكم.
