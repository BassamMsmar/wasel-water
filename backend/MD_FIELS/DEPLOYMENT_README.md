# Wasel Water - Backend Documentation

## 📚 دليل النشر والإعداد

تم تحديث جميع إعدادات Django للعمل في بيئة الإنتاج (Production). اختر المسار المناسب:

---

## 🚀 للبدء السريع (20 دقيقة)
👉 اقرأ: [`QUICK_START.md`](./QUICK_START.md)

خطوات بسيطة وسريعة للنشر الفوري مع قائمة تحقق سهلة.

---

## 📖 للفهم التفصيلي (الإعداد الكامل)
👉 اقرأ: [`PRODUCTION_SETUP.md`](./PRODUCTION_SETUP.md)

دليل شامل يتضمن:
- شرح جميع التغييرات الأمنية
- خطوات التشغيل المفصلة
- نصائح الأمان والمراقبة
- استكشاف الأخطاء الشائعة

---

## ✅ قائمة الفحص والتحقق
👉 اقرأ: [`VERIFICATION_CHECKLIST.md`](./VERIFICATION_CHECKLIST.md)

يتضمن:
- فحص شامل للأمان (Security Audit)
- خطوات التشغيل الفوري
- اختبار التحقق من الإنتاج
- حل المشاكل الشائعة

---

## 📋 ملخص التعديلات
👉 اقرأ: [`DEPLOYMENT_SUMMARY.md`](./DEPLOYMENT_SUMMARY.md)

ملخص سريع لجميع التعديلات التي تم إجراؤها على `settings.py`

---

## 🔐 ملف المتغيرات البيئية (قالب)
📄 ملف: `.env.production`

انسخه إلى `.env` وعدّل القيم قبل الإنتاج:
```bash
cp .env.production .env
nano .env
```

---

## 📁 البنية المهمة

```
backend/
├── .env.production          # قالب متغيرات البيئة
├── QUICK_START.md           # النشر السريع ⭐
├── PRODUCTION_SETUP.md      # الدليل الكامل
├── DEPLOYMENT_SUMMARY.md    # ملخص التعديلات
├── VERIFICATION_CHECKLIST.md # قائمة الفحص
├── logs/                    # مجلد السجلات (يُنشأ تلقائياً)
├── staticfiles/             # الملفات الثابتة المجمعة
├── media/                   # ملفات المستخدمين
├── project/
│   └── settings.py          # ✅ محدث للإنتاج
└── requirements.txt         # الحزم المطلوبة
```

---

## 🔑 المتغيرات البيئية المطلوبة

| المتغير | الوصف | مثال |
|---------|-------|------|
| `SECRET_KEY` | مفتاح سري قوي | [generate] |
| `DEBUG` | تعطيل وضع التطوير | `False` |
| `ALLOWED_HOSTS` | المجالات المسموح بها | `yourdomain.com` |
| `DB_NAME` | اسم قاعدة البيانات | `wasel_water_db` |
| `DB_USER` | مستخدم قاعدة البيانات | `wasel_user` |
| `DB_PASSWORD` | كلمة مرور قوية | `[strong-pwd]` |
| `DB_HOST` | عنوان قاعدة البيانات | `localhost` |
| `DB_PORT` | منفذ قاعدة البيانات | `5432` |
| `CORS_ALLOWED_ORIGINS` | أصول CORS المسموح بها | `https://yourdomain.com` |

---

## 📊 ملخص التغييرات الأمنية

✅ **تفعيل:**
- HTTPS Redirect
- Secure Cookies
- HSTS (HTTP Strict Transport Security)
- XSS Protection
- Clickjacking Protection
- MIME Sniffing Protection
- CSRF Protection
- Production Logging

❌ **تعطيل في الإنتاج:**
- Debug Mode
- Debug Toolbar
- CORS Allow All Origins
- SQLite Database

---

## 🎯 الخطوات الأساسية

### 1️⃣ تحضير البيئة
```bash
cp .env.production .env
# عدّل القيم في .env
```

### 2️⃣ توليد Secret Key
```bash
python manage.py shell
>>> from django.core.management.utils import get_random_secret_key
>>> print(get_random_secret_key())
```

### 3️⃣ الفحص
```bash
python manage.py check --deploy
```

### 4️⃣ إعداد قاعدة البيانات
```bash
python manage.py migrate
python manage.py createsuperuser
```

### 5️⃣ تجميع الملفات الثابتة
```bash
python manage.py collectstatic --noinput
```

### 6️⃣ التشغيل
```bash
gunicorn project.wsgi:application --bind 0.0.0.0:8000
```

---

## 🧪 الاختبار

```bash
# فحص الإنتاج
python manage.py check --deploy

# اختبار في المتصفح
https://yourdomain.com
https://yourdomain.com/admin

# مراقبة السجلات
tail -f logs/django.log
```

---

## 🆘 استكشاف الأخطاء

### خطأ: `SECRET_KEY environment variable is not set`
```bash
# الحل: تأكد من تعيين SECRET_KEY في .env
SECRET_KEY=<your-secret-key>
```

### خطأ: `Connection refused` (Database)
```bash
# الحل: تحقق من بيانات الاتصال بقاعدة البيانات
DB_HOST=correct-host
DB_USER=correct-user
DB_PASSWORD=correct-password
```

### خطأ: `CORS Error`
```bash
# الحل: حدد أصول CORS الصحيحة
CORS_ALLOWED_ORIGINS=https://your-frontend.com
```

### خطأ: `Static Files 404`
```bash
# الحل: جمّع الملفات الثابتة
python manage.py collectstatic --noinput
```

---

## 📞 الموارد والمراجع

- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Django Security Documentation](https://docs.djangoproject.com/en/5.2/topics/security/)
- [Gunicorn Documentation](https://gunicorn.org/)
- [Nginx Configuration](https://nginx.org/en/docs/)
- [SSL Certificates (Let's Encrypt)](https://letsencrypt.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 📌 ملاحظات هامة

⚠️ **لا تنسى:**
- تغيير `DEBUG=False` قبل النشر
- استخدام PostgreSQL بدلاً من SQLite
- الحصول على SSL Certificate
- إعداد Nginx كـ Reverse Proxy
- عمل backups دوري للبيانات
- مراقبة السجلات بانتظام

---

## ✅ جاهز للإنتاج!

اتبع [`QUICK_START.md`](./QUICK_START.md) للبدء في غضون 20 دقيقة.

---

**آخر تحديث:** 2026-04-25  
**الإصدار:** Production Ready v1.0  
**الحالة:** ✅ جاهز للنشر
