# إعدادات النشر - Production Deployment Guide

## 📋 تم إجراؤها من التعديلات

### 1. **تفعيل وضع الإنتاج (Disable Debug Mode)**
   - تم تغيير `DEBUG = True` إلى `DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'`
   - يجب أن يكون `DEBUG=False` في ملف `.env.production`

### 2. **تأمين SECRET_KEY**
   - تم تغيير من `os.dev` (خطأ) إلى `os.getenv('SECRET_KEY')`
   - يتم رفع Exception إذا لم يتم تعيين المتغير البيئي
   - **يجب إنشاء secret key قوي**

### 3. **ALLOWED_HOSTS - التحكم في المجالات المسموح بها**
   - تم تغيير من `['*']` (غير آمن) إلى `os.getenv('ALLOWED_HOSTS', '...).split(',')`
   - يجب تحديد المجالات المسموح بها فقط

### 4. **Debug Toolbar - إزالة من الإنتاج**
   ```python
   if DEBUG:
       INSTALLED_APPS.insert(5, 'debug_toolbar')
       MIDDLEWARE.append('debug_toolbar.middleware.DebugToolbarMiddleware')
   ```
   - Debug Toolbar الآن يتم تفعيله فقط في وضع التطوير

### 5. **CORS - تكوين مشدد للإنتاج**
   ```python
   if DEBUG:
       CORS_ALLOW_ALL_ORIGINS = True  # تطوير فقط
   else:
       CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')
       CORS_ALLOW_ALL_ORIGINS = False  # إنتاج آمن
   ```

### 6. **إعدادات الأمان في الإنتاج (Production Security)**
   - ✅ HTTPS Redirect: `SECURE_SSL_REDIRECT = True`
   - ✅ HTTP-only Cookies: `SESSION_COOKIE_HTTPONLY = True`
   - ✅ Secure Cookies: `SESSION_COOKIE_SECURE = True`
   - ✅ CSRF Protection: `CSRF_COOKIE_SECURE = True`
   - ✅ HSTS (HTTP Strict Transport Security)
   - ✅ XSS Protection: `SECURE_BROWSER_XSS_FILTER = True`
   - ✅ Content Type Sniffing Protection
   - ✅ X-Frame-Options: DENY (منع التضمين في iframes)

### 7. **Logging للإنتاج**
   - تم إعداد تسجيل الأخطاء في ملف: `backend/logs/django.log`
   - سيتم تسجيل جميع الأخطاء والمشاكل الأمنية

---

## 🚀 خطوات النشر

### المتطلبات الأساسية:
1. **إنشاء Secret Key قوي**
   ```bash
   python manage.py shell
   >>> from django.core.management.utils import get_random_secret_key
   >>> print(get_random_secret_key())
   ```

2. **إعداد متغيرات البيئة**
   - انسخ `.env.production` إلى `.env`
   - ملء جميع المتغيرات بالقيم الفعلية:
     ```bash
     SECRET_KEY=<your-generated-key>
     DEBUG=False
     ALLOWED_HOSTS=your-domain.com,www.your-domain.com
     DB_PASSWORD=<strong-password>
     CORS_ALLOWED_ORIGINS=https://your-frontend.com
     ```

3. **إنشاء مجلد السجلات**
   ```bash
   mkdir -p backend/logs
   ```

4. **تجميع الملفات الثابتة**
   ```bash
   python manage.py collectstatic --noinput
   ```

5. **تشغيل الترحيل**
   ```bash
   python manage.py migrate
   ```

6. **إنشاء مستخدم إدارة (Superuser)**
   ```bash
   python manage.py createsuperuser
   ```

---

## 📋 قائمة التحقق قبل النشر (Pre-Deployment Checklist)

- [ ] `DEBUG = False`
- [ ] `SECRET_KEY` محفوظ وقوي
- [ ] `ALLOWED_HOSTS` محدد بشكل صحيح
- [ ] `CORS_ALLOWED_ORIGINS` محدد للفرونت إند الفعلي
- [ ] قاعدة البيانات PostgreSQL جاهزة
- [ ] HTTPS مفعل على المجال
- [ ] SSL/TLS Certificates صحيحة
- [ ] مجلد `logs/` موجود وقابل للكتابة
- [ ] Static files تم تجميعها
- [ ] Migration تم تشغيلها
- [ ] Superuser تم إنشاؤه
- [ ] Google OAuth مكون (إن لزم الأمر)
- [ ] Email configuration صحيحة (إن لزم الأمر)

---

## 🔒 نصائح أمان إضافية

1. **استخدم HTTPS دائماً**
   ```
   SECURE_SSL_REDIRECT = True
   SECURE_HSTS_SECONDS = 31536000  # 1 year
   ```

2. **استخدم PostgreSQL بدلاً من SQLite**
   - SQLite غير مناسب للإنتاج

3. **قم بتعيين Permissions صحيح**
   ```bash
   chmod 600 .env
   ```

4. **استخدم Manager مثل Gunicorn**
   ```bash
   gunicorn project.wsgi:application --bind 0.0.0.0:8000
   ```

5. **استخدم Reverse Proxy (Nginx)**
   ```
   upstream django {
       server 127.0.0.1:8000;
   }
   
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;
       
       location /static/ {
           alias /path/to/staticfiles/;
       }
       
       location /media/ {
           alias /path/to/media/;
       }
       
       location / {
           proxy_pass http://django;
       }
   }
   ```

6. **استخدم PM2 أو Systemd للإدارة**
   ```bash
   # Using systemd
   sudo systemctl restart wasel-water
   ```

---

## 📊 Monitoring و Maintenance

1. **المراقبة المستمرة**
   - تفقد السجلات بانتظام: `tail -f backend/logs/django.log`

2. **النسخ الاحتياطية**
   - قم بعمل backup دوري لقاعدة البيانات
   - قم بعمل backup للملفات المرفوعة (Media)

3. **التحديثات**
   - حدث الحزم بانتظام
   - تطبيق الـ Security Patches فوراً

---

## 🆘 استكشاف الأخطاء

### المشكلة: CORS Error
```
حل: تحديث CORS_ALLOWED_ORIGINS في .env
```

### المشكلة: Static Files غير محملة
```
حل: تشغيل collectstatic
python manage.py collectstatic --noinput
```

### المشكلة: Database Connection Error
```
حل: التحقق من متغيرات DB في .env
```

---

## 📚 المراجع

- [Django Deployment Checklist](https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/)
- [Security Documentation](https://docs.djangoproject.com/en/5.2/topics/security/)
- [Static Files](https://docs.djangoproject.com/en/5.2/howto/static-files/)
