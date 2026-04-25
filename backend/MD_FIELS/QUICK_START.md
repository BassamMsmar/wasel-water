# 🚀 Quick Start - النشر السريع

## أولاً: تحضير البيئة (5 دقائق)

```bash
# 1. الانتقال للمجلد
cd backend

# 2. نسخ قالب البيئة
cp .env.production .env

# 3. تعديل .env بمحرر نصي
nano .env
# أو
code .env

# 4. إنشاء مجلد السجلات
mkdir -p logs
```

---

## ثانياً: توليد Secret Key (2 دقيقة)

```bash
# فتح Django Shell
python manage.py shell

# تشغيل الأوامر:
>>> from django.core.management.utils import get_random_secret_key
>>> key = get_random_secret_key()
>>> print(key)
# انسخ المفتاح

# خروج
>>> exit()

# ألصق المفتاح في .env:
# SECRET_KEY=<المفتاح المنسوخ>
```

---

## ثالثاً: التحقق من الإعدادات (3 دقائق)

```bash
# فحص شامل للإنتاج
python manage.py check --deploy

# يجب أن تكون النتيجة:
# System check identified no issues (0 silenced).
```

---

## رابعاً: إعداد قاعدة البيانات (5 دقائق)

```bash
# تجميع الملفات الثابتة
python manage.py collectstatic --noinput

# تشغيل الترحيل
python manage.py migrate

# إنشاء مستخدم إدارة
python manage.py createsuperuser
# أدخل: Username, Email, Password
```

---

## خامساً: التشغيل (1 دقيقة)

### خيار 1: Gunicorn (الأفضل)

```bash
pip install gunicorn

gunicorn project.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120
```

### خيار 2: Django Development Server (للاختبار فقط)

```bash
python manage.py runserver 0.0.0.0:8000
```

---

## سادساً: الاختبار (2 دقيقة)

```bash
# اختبر في المتصفح:
# https://yourdomain.com  ✅ HTTPS فقط
# https://yourdomain.com/admin  ✅ لوحة التحكم

# اختبر من Terminal:
curl -I https://yourdomain.com
# يجب أن تعيد: HTTP/2 200 أو HTTP/1.1 200
```

---

## القائمة السريعة للمتغيرات المطلوبة

```
┌─────────────────────────────────────────────────────┐
│ المتغير               │ القيمة                      │
├─────────────────────────────────────────────────────┤
│ SECRET_KEY           │ [generate with Django]     │
│ DEBUG                │ False                      │
│ ALLOWED_HOSTS        │ your-domain.com            │
│ DB_NAME              │ wasel_water_db             │
│ DB_USER              │ wasel_user                 │
│ DB_PASSWORD          │ [strong password]          │
│ DB_HOST              │ localhost أو IP            │
│ DB_PORT              │ 5432                       │
│ CORS_ALLOWED_ORIGINS │ https://your-frontend.com │
└─────────────────────────────────────────────────────┘
```

---

## ✅ قائمة التحقق النهائية

- [ ] تم نسخ .env.production إلى .env
- [ ] تم تعيين كل المتغيرات في .env
- [ ] تم توليد SECRET_KEY
- [ ] تم تشغيل `check --deploy` بدون أخطاء
- [ ] تم تجميع Static Files
- [ ] تم تشغيل الترحيل (migrate)
- [ ] تم إنشاء Superuser
- [ ] تم اختبار الموقع بـ HTTPS
- [ ] تم التحقق من السجلات

---

## 🆘 عند الحاجة للمساعدة

1. اقرأ `PRODUCTION_SETUP.md` للتفاصيل الكاملة
2. راجع `VERIFICATION_CHECKLIST.md` لفحص الأمان
3. ابحث في السجلات: `tail -f logs/django.log`
4. شغّل الفحص: `python manage.py check --deploy`

---

## ⏱️ الوقت الإجمالي المتوقع: **~20 دقيقة**

```
توليد Secret Key:     2 دقيقة ⏱️
تحضير البيئة:       5 دقائق ⏱️
التحقق:             3 دقائق ⏱️
قاعدة البيانات:    5 دقائق ⏱️
التشغيل:            1 دقيقة  ⏱️
الاختبار:           2 دقيقة  ⏱️
────────────────────────────
الإجمالي:           18 دقيقة
```

---

**أنت الآن جاهز للنشر! 🎉**
