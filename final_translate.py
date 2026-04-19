import re

path = r"E:\Code\wasel-water\backend\project\settings.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()

c = c.replace("LANGUAGE_CODE = 'en-us'", "LANGUAGE_CODE = 'ar'")
if "'django.middleware.locale.LocaleMiddleware'" not in c:
    c = c.replace("'django.contrib.sessions.middleware.SessionMiddleware',", "'django.contrib.sessions.middleware.SessionMiddleware',\n    'django.middleware.locale.LocaleMiddleware',")

with open(path, 'w', encoding='utf-8') as f: f.write(c)

path = r"E:\Code\wasel-water\backend\core\apps.py"
with open(path, 'r', encoding='utf-8') as f: c = f.read()

ready_code = """
    def ready(self):
        try:
            from django.apps import apps
            from django.utils.translation import gettext_lazy as _
            
            # Apps
            if apps.is_installed('auth'):
                apps.get_app_config('auth').verbose_name = _('المصادقة والصلاحيات')
            if apps.is_installed('sites'):
                apps.get_app_config('sites').verbose_name = _('واجهات المواقع')
            if apps.is_installed('token_blacklist'):
                apps.get_app_config('token_blacklist').verbose_name = _('توثيق التوكنز')
            if apps.is_installed('socialaccount'):
                apps.get_app_config('socialaccount').verbose_name = _('الحسابات الاجتماعية')
            if apps.is_installed('taggit'):
                apps.get_app_config('taggit').verbose_name = _('الوسوم')
                
            # Models
            if apps.is_installed('token_blacklist'):
                from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
                BlacklistedToken._meta.verbose_name = _('توكن محظور')
                BlacklistedToken._meta.verbose_name_plural = _('التوكن المحظورة (Blacklisted)')
                OutstandingToken._meta.verbose_name = _('توكن نشط')
                OutstandingToken._meta.verbose_name_plural = _('التوكن النشطة (Outstanding)')

            if apps.is_installed('taggit'):
                from taggit.models import Tag
                Tag._meta.verbose_name = _('وسم')
                Tag._meta.verbose_name_plural = _('وسوم')

            if apps.is_installed('socialaccount'):
                from allauth.socialaccount.models import SocialAccount, SocialApp, SocialToken
                SocialAccount._meta.verbose_name = _('حساب اجتماعي')
                SocialAccount._meta.verbose_name_plural = _('حسابات اجتماعية')
                SocialApp._meta.verbose_name = _('تطبيق اجتماعي')
                SocialApp._meta.verbose_name_plural = _('تطبيقات اجتماعية')
                SocialToken._meta.verbose_name = _('توكن اجتماعي')
                SocialToken._meta.verbose_name_plural = _('رموز التطبيقات الاجتماعية')

            if apps.is_installed('sites'):
                from django.contrib.sites.models import Site
                Site._meta.verbose_name = _('موقع')
                Site._meta.verbose_name_plural = _('المواقع')

            if apps.is_installed('auth'):
                from django.contrib.auth.models import User, Group
                User._meta.verbose_name = _('مستخدم')
                User._meta.verbose_name_plural = _('المستخدمين')
                Group._meta.verbose_name = _('مجموعة')
                Group._meta.verbose_name_plural = _('مجموعات الصلاحيات')
        except Exception:
            pass
"""

if "def ready(self):" not in c:
    c = c + ready_code

with open(path, 'w', encoding='utf-8') as f: f.write(c)

print("Done")
