# 🔧 Setup Guide - Python-dotenv Error

## The Problem

```
python-dotenv could not parse statement starting at line 1
```

## The Reason

The `.env` file contains special characters or complex comments that `python-dotenv` cannot parse.

---

## The Solution ✅

### Step 1: Use the Correct File

Make sure to use one of these files:

```bash
cp .env.production .env
# OR
cp .env.example .env
```

### Step 2: Correct Format

Ensure your `.env` file follows this format:

✅ **Correct:**

```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=wasel_water_db
```

❌ **Wrong:**

```env
SECRET_KEY = your-secret-key  # No spaces
DEBUG = False                  # No spaces
# comments with 'special chars' - causes issues
```

### Step 3: Avoid Special Characters

❌ **Avoid:**

```env
# Generate with: python -c 'from ...'  # Single quotes
COMMENT="This has 'quotes'"             # Quotes
```

✅ **Use:**

```env
# Generate with Django shell
# Then run the import command
SECRET_KEY=your-key
```

---

## Quick Checklist

Before running the application:

- [ ] No spaces around `=`
- [ ] No quotes around values
- [ ] Comments are simple without special chars
- [ ] All required variables present
- [ ] No unnecessary blank lines

---

## Next Steps

### 1. Test the File

```bash
python manage.py shell
>>> import os
>>> from dotenv import load_dotenv
>>> load_dotenv()
>>> print(os.getenv('SECRET_KEY'))
```

### 2. If Test Succeeds

```bash
python manage.py check --deploy
```

### 3. Run the Application

```bash
python manage.py runserver
# OR
gunicorn project.wsgi:application
```

---

## Available Files

| File | Description |
|------|-------------|
| `.env.example` | ✅ Simple template |
| `.env.production` | ✅ Complete template |
| `.env` | (Copy from one of above) |

---

## 🆘 If Problem Persists

### Step 1: Check Variables

```bash
python manage.py shell
>>> from dotenv import load_dotenv, dotenv_values
>>> config = dotenv_values(".env")
>>> for key, value in config.items():
>>>     print(f"{key}={value}")
```

### Step 2: Use Environment Variables Directly

```bash
export SECRET_KEY="your-secret-key"
export DEBUG="False"
export ALLOWED_HOSTS="localhost"
python manage.py runserver
```

### Step 3: Check Django

```bash
python manage.py check --deploy
python manage.py check
```

---

## ✅ Ready

Follow `QUICK_START.md` to begin deployment.

---

**Updated:** April 26, 2026  
**Status:** ✅ Fixed
