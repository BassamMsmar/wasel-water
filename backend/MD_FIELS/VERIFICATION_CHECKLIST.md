# ✅ قائمة التحقق من إعدادات النشر - Deployment Verification Checklist

## 📋 ملخص التعديلات المنجزة

### ✅ تم الإنجاز بنجاح:

1. **تعديل `settings.py`**
   - ✅ تغيير `DEBUG` إلى متغير بيئي
   - ✅ تأمين `SECRET_KEY` من متغيرات البيئة
   - ✅ تحديد `ALLOWED_HOSTS` بأمان
   - ✅ إزالة Debug Toolbar من الإنتاج
   - ✅ تكوين CORS مشدد للإنتاج
   - ✅ إضافة إعدادات HTTPS و SSL/TLS
   - ✅ تفعيل HSTS
   - ✅ إضافة حماية XSS و Clickjacking
   - ✅ تكوين Logging للإنتاج

2. **ملفات مُنشأة:**
   - ✅ `backend/.env.production` - قالب المتغيرات البيئية
   - ✅ `backend/PRODUCTION_SETUP.md` - دليل النشر الشامل
   - ✅ `backend/DEPLOYMENT_SUMMARY.md` - ملخص التعديلات

---

## 🔍 فحص الأمان (Security Audit)

### Configuration Checks:

```python
# ✅ DEBUG Mode
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
# يجب: DEBUG=False في الإنتاج

# ✅ SECRET_KEY Protection
SECRET_KEY = os.getenv('SECRET_KEY')
if not SECRET_KEY:
    raise ValueError('SECRET_KEY environment variable must be set')

# ✅ ALLOWED_HOSTS
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '...').split(',')

# ✅ HTTPS Redirect
SECURE_SSL_REDIRECT = True

# ✅ Cookie Security
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True
SESSION_COOKIE_HTTPONLY = True

# ✅ HSTS
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True

# ✅ XSS Protection
SECURE_BROWSER_XSS_FILTER = True

# ✅ Clickjacking Protection
X_FRAME_OPTIONS = 'DENY'

# ✅ MIME Type Sniffing Protection
SECURE_CONTENT_TYPE_NOSNIFF = True

# ✅ CORS Strict Mode
CORS_ALLOW_ALL_ORIGINS = False (in production)
CORS_ALLOWED_ORIGINS = [configured origins only]
```

---

## 📦 متغيرات البيئة المطلوبة

### يجب تعيينها قبل النشر:

```bash
# CORE APPLICATION
SECRET_KEY=<generate-with-django-command>
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# DATABASE (PostgreSQL)
DB_NAME=wasel_water_db
DB_USER=wasel_user
DB_PASSWORD=<strong-secure-password>
DB_HOST=db.example.com
DB_PORT=5432

# FRONTEND CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# SECURITY
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True

# EXTERNAL SERVICES
GOOGLE_MAPS_API_KEY=<your-key>
```

---

## 🚀 خطوات التشغيل الفوري

### 1. إعداد البيئة
```bash
cd backend
cp .env.production .env
# عدّل قيم .env بالقيم الفعلية
chmod 600 .env
```

### 2. إنشاء Secret Key
```bash
python manage.py shell
>>> from django.core.management.utils import get_random_secret_key
>>> print(get_random_secret_key())
# انسخ المفتاح في SECRET_KEY في .env
```

### 3. إعداد المجلدات المطلوبة
```bash
mkdir -p logs
chmod 755 logs
```

### 4. تثبيت الحزم
```bash
pip install -r requirements.txt
# للإنتاج أضف:
pip install gunicorn
pip install psycopg2-binary  # For PostgreSQL
```

### 5. تجميع الملفات الثابتة
```bash
python manage.py collectstatic --noinput
```

### 6. تشغيل الترحيل
```bash
python manage.py migrate
```

### 7. إنشاء Superuser (Admin)
```bash
python manage.py createsuperuser
```

### 8. اختبار الإعدادات
```bash
python manage.py check --deploy
```

### 9. تشغيل الخادم
```bash
# مع Gunicorn
gunicorn project.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 4 \
  --timeout 120 \
  --access-logfile - \
  --error-logfile -
```

---

## 🔐 نصائح الأمان الإضافية

### ✅ Reverse Proxy (Nginx)
```nginx
upstream django {
    server 127.0.0.1:8000;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location /static/ {
        alias /path/to/backend/staticfiles/;
        expires 30d;
    }
    
    location /media/ {
        alias /path/to/backend/media/;
    }
    
    location / {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### ✅ Systemd Service File
```ini
[Unit]
Description=Wasel Water Django Application
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/path/to/backend
ExecStart=/path/to/venv/bin/gunicorn \
    project.wsgi:application \
    --bind 127.0.0.1:8000 \
    --workers 4
Environment="DEBUG=False"

Restart=always
RestartSec=10s

[Install]
WantedBy=multi-user.target
```

### ✅ Monitoring & Logging
```bash
# مراقبة السجلات في الوقت الفعلي
tail -f /path/to/backend/logs/django.log

# عد عدد الأخطاء
grep ERROR /path/to/backend/logs/django.log | wc -l

# فحص الأخطاء الأمنية
grep "django.security" /path/to/backend/logs/django.log
```

---

## 🧪 اختبار التحقق من الإنتاج

```bash
# تشغيل Django deployment checks
python manage.py check --deploy

# اختبار إعدادات الـ HTTPS
python manage.py check --deploy --fail-level WARNING

# التحقق من الملفات الثابتة
python manage.py collectstatic --dry-run

# اختبار الاتصال بالـ Database
python manage.py dbshell
```

---

## ⚠️ المشاكل الشائعة والحلول

### مشكلة: Secret Key not found
```
الحل: 
1. تحقق من وجود .env
2. تأكد من تعيين SECRET_KEY
3. استخدم أمر Django لإنشاء مفتاح جديد
```

### مشكلة: CORS Error
```
الحل:
1. تحقق من CORS_ALLOWED_ORIGINS في .env
2. تأكد من عدم استخدام CORS_ALLOW_ALL_ORIGINS في الإنتاج
```

### مشكلة: Static Files 404
```
الحل:
1. شغّل collectstatic
2. تأكد من إعدادات STATIC_ROOT
3. تحقق من إعدادات Nginx
```

### مشكلة: SSL Certificate Error
```
الحل:
1. تحقق من صلاحية الشهادة
2. تأكد من تاريخ انتهاء الشهادة
3. استخدم Let's Encrypt (مجاني)
```

---

## 📊 مؤشرات النجاح

- ✅ `python manage.py check --deploy` ينجح بدون تحذيرات
- ✅ الموقع متاح عبر HTTPS فقط
- ✅ السجلات تُحفظ بنجاح في `logs/django.log`
- ✅ Static files تُحمّل بدون أخطاء
- ✅ لا توجد رسائل DEBUG في الاستجابات
- ✅ الخوادم الخلفية تستجيب بسرعة

---

## 📚 المراجع والموارد

- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Django Security Documentation](https://docs.djangoproject.com/en/5.2/topics/security/)
- [Gunicorn Documentation](https://gunicorn.org/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [OWASP Security Guidelines](https://owasp.org/)

---

## 👤 معلومات الدعم

للمساعدة والاستفسارات:
1. راجع `PRODUCTION_SETUP.md` للتفاصيل الكاملة
2. شغّل `python manage.py check --deploy` للتشخيص
3. راجع السجلات: `tail -f logs/django.log`

---

**تاريخ الإعداد:** 2026-04-25  
**الإصدار:** Production Ready v1.0  
**الحالة:** ✅ جاهز للنشر

