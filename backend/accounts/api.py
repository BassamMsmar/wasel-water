from datetime import timedelta
from decimal import Decimal
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.conf import settings
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.response import Response
from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Customer, Address
from .otp_utils import generate_otp, normalize_phone, send_otp, send_email_otp, validate_phone_sa
from .permissions import has_dashboard_access
from drf_spectacular.utils import extend_schema
from .serializers import (
    CustomerSerializer,
    AddressSerializer,
    UserSerializer,
    ProfileSerializer,
    RegisterSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProfileUpdateSerializer,
)


def build_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


def is_email(value):
    try:
        validate_email(value)
    except ValidationError:
        return False
    return True


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses=ProfileSerializer)
    def create(self, request, *args, **kwargs):
        data = request.data
        username = data.get('username') or data.get('email', '').split('@')[0]
        email = data.get('email', '')
        password = data.get('password', '')
        password_confirm = data.get('password_confirm', '')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')
        phone_number = (data.get('phone_number') or data.get('phone') or '').strip()

        if not email or not password or not password_confirm:
            return Response(
                {'detail': 'Email, password, and password confirmation are required'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if password != password_confirm:
            return Response(
                {'detail': 'Password confirmation does not match'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'Email already in use'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            import uuid
            username = f"{username}_{str(uuid.uuid4())[:6]}"

        user = User(username=username, email=email, first_name=first_name, last_name=last_name, is_active=False)
        user.set_password(password)
        user.save()

        customer, _ = Customer.objects.get_or_create(user=user)
        if phone_number:
            customer.phone_number = normalize_phone(phone_number)
            customer.save(update_fields=["phone_number"])

        code = generate_otp(4)
        from .models import OTPToken
        normalized_email = email.lower()
        OTPToken.objects.filter(phone_number=normalized_email, is_used=False).update(is_used=True)
        OTPToken.objects.create(
            phone_number=normalized_email,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        send_email_otp(normalized_email, code)

        response = {
            "success": True,
            "activation_required": True,
            "channel": "email",
            "identifier": normalized_email,
            "message": "Activation code sent to your email",
        }
        if settings.DEBUG:
            response["debug_code"] = code
        return Response(response, status=status.HTTP_201_CREATED)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer

    @extend_schema(request=PasswordResetRequestSerializer)
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:3000").rstrip("/")
            reset_link = f"{frontend_url}/reset-password?uid={uid}&token={token}"
            subject = "Reset your Wasel Water password"
            message = (
                "Use the link below to reset your Wasel Water password:\n\n"
                f"{reset_link}\n\n"
                "If you did not request this, you can ignore this message."
            )
            send_mail(
                subject,
                message,
                getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@wasel-water.local"),
                [email],
                fail_silently=True,
            )
            if settings.DEBUG:
                print(f"[WASEL DEV PASSWORD RESET] {email}: {reset_link}", flush=True)

        return Response({
            "success": True,
            "message": "If this email exists, a password reset link has been sent.",
        })


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    @extend_schema(request=PasswordResetConfirmSerializer)
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            uid = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
            user = User.objects.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid password reset link"}, status=status.HTTP_400_BAD_REQUEST)

        token = serializer.validated_data["token"]
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired password reset link"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"success": True, "message": "Password has been reset."})


class ProfileView(generics.GenericAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=ProfileSerializer)
    def get(self, request):
        return Response(ProfileSerializer(request.user).data)

    @extend_schema(request=ProfileUpdateSerializer, responses=ProfileSerializer)
    def patch(self, request):
        user = request.user
        data = request.data
        for field in ['first_name', 'last_name', 'email']:
            if field in data:
                setattr(user, field, data[field])
        user.save()
        if hasattr(user, 'customer'):
            customer = user.customer
            for field in ['phone_number', 'birth_date']:
                if field in data:
                    setattr(customer, field, data[field])
            customer.save()
        return Response(ProfileSerializer(user).data)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if has_dashboard_access(self.request.user):
            return Customer.objects.select_related('user').all()
        return Customer.objects.filter(user=self.request.user)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if has_dashboard_access(self.request.user):
            return User.objects.all().order_by('-date_joined')
        return User.objects.filter(id=self.request.user.id)


class AddressViewSet(viewsets.ModelViewSet):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class IdentifierLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = (request.data.get("identifier") or request.data.get("username") or "").strip()
        password = (request.data.get("password") or "").strip()

        if not identifier or not password:
            return Response({"detail": "Identifier and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=identifier, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        payload = build_tokens(user)
        payload["user"] = ProfileSerializer(user).data
        return Response(payload)


class OTPRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw = (request.data.get("phone") or request.data.get("identifier") or "").strip()
        if not raw:
            return Response({"detail": "Phone or email is required"}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError as DjVE

        # Detect channel
        try:
            validate_email(raw)
            channel = "email"
            normalized = raw.lower()
        except DjVE:
            if not validate_phone_sa(raw):
                return Response({"detail": "Invalid Saudi phone number or email"}, status=status.HTTP_400_BAD_REQUEST)
            channel = "phone"
            normalized = normalize_phone(raw)

        code = generate_otp(4)

        from .models import OTPToken
        OTPToken.objects.filter(phone_number=normalized, is_used=False).update(is_used=True)
        OTPToken.objects.create(
            phone_number=normalized,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5),
        )

        if channel == "email":
            send_email_otp(normalized, code)
            message = "OTP sent to your email"
        else:
            send_otp(normalized, code)
            message = "OTP sent to your phone"

        response = {
            "success": True,
            "phone": normalized,
            "channel": channel,
            "message": message,
        }
        from django.conf import settings
        if settings.DEBUG:
            response["debug_code"] = code
        return Response(response)


class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        raw = (request.data.get("phone") or request.data.get("identifier") or "").strip()
        code = (request.data.get("code") or "").strip()

        if not raw or not code:
            return Response({"detail": "Phone/email and code are required"}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.validators import validate_email
        from django.core.exceptions import ValidationError as DjVE
        try:
            validate_email(raw)
            normalized = raw.lower()
            channel = "email"
        except DjVE:
            normalized = normalize_phone(raw)
            channel = "phone"

        from .models import OTPToken
        token = OTPToken.objects.filter(
            phone_number=normalized,
            code=code,
            is_used=False,
        ).order_by("-created_at").first()

        if not token or not token.is_valid():
            if token:
                token.attempts += 1
                token.save(update_fields=["attempts"])
            return Response({"detail": "Invalid or expired OTP"}, status=status.HTTP_400_BAD_REQUEST)

        token.is_used = True
        token.save(update_fields=["is_used"])

        # Find or create user
        if channel == "email":
            user = User.objects.filter(email__iexact=normalized).first()
            if user is None:
                from django.utils.crypto import get_random_string
                username = normalized.split("@")[0][:120]
                if User.objects.filter(username__iexact=username).exists():
                    username = f"{username}_{get_random_string(5).lower()}"
                user = User.objects.create_user(username=username, email=normalized, password=get_random_string(16))
            elif not user.is_active:
                user.is_active = True
                user.save(update_fields=["is_active"])
        else:
            customer = Customer.objects.filter(phone_number=normalized).select_related("user").first()
            user = customer.user if customer else User.objects.filter(username=normalized).first()
            if user is None:
                from django.utils.crypto import get_random_string
                user = User.objects.create_user(username=normalized, password=get_random_string(16))

        customer, created = Customer.objects.get_or_create(user=user)
        if channel == "phone" and not customer.phone_number:
            customer.phone_number = normalized
            customer.save(update_fields=["phone_number"])

        payload = build_tokens(user)
        payload["user"] = ProfileSerializer(user).data
        return Response(payload)


class LocationSyncView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        data = request.data
        latitude = data.get("latitude")
        longitude = data.get("longitude")
        readable_address = (data.get("readable_address") or "").strip()
        maps_url = (data.get("maps_url") or "").strip()
        city = (data.get("city") or "").strip()
        country = (data.get("country") or "").strip()
        neighborhood = (data.get("neighborhood") or "").strip()
        street = (data.get("street") or "").strip()
        postal_code = (data.get("postal_code") or "").strip()
        phone_number = (data.get("phone_number") or "").strip()

        if not maps_url and (not latitude or not longitude):
            return Response({"detail": "Incomplete location data"}, status=status.HTTP_400_BAD_REQUEST)

        location_qs = Address.objects.filter(user=request.user)
        if maps_url:
            duplicate = location_qs.filter(location_link=maps_url).first()
            if duplicate:
                return Response(AddressSerializer(duplicate).data)

        duplicate = None
        if latitude and longitude:
            try:
                duplicate = location_qs.filter(
                    latitude=Decimal(str(latitude)),
                    longitude=Decimal(str(longitude)),
                ).first()
            except Exception:
                duplicate = None
            if duplicate:
                return Response(AddressSerializer(duplicate).data)

        full_name = request.user.get_full_name().strip() or request.user.username
        customer = getattr(request.user, "customer", None)
        safe_phone = phone_number or (customer.phone_number if customer and customer.phone_number else "")

        address = Address.objects.create(
            user=request.user,
            full_name=full_name[:100],
            phone_number=safe_phone[:20],
            city=(city or "jeddah")[:100],
            country=country[:100] or None,
            neighborhood=neighborhood[:255] or readable_address[:255] or None,
            street=street[:255] or None,
            postal_code=postal_code[:20] or None,
            latitude=Decimal(str(latitude)) if latitude not in (None, "") else None,
            longitude=Decimal(str(longitude)) if longitude not in (None, "") else None,
            location_link=maps_url or None,
            is_default=not location_qs.filter(is_default=True).exists(),
        )

        return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)
