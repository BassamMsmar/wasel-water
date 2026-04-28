def has_dashboard_access(user):
    if not user or not user.is_authenticated:
        return False
    return bool(
        user.is_staff
        or user.is_superuser
        or user.has_perm("accounts.access_dashboard")
    )
