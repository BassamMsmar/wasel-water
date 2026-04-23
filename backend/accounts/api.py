from datetime import timedelta
from decimal import Decimal
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework import viewsets, permissions, generics, status
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Customer, Address
from .otp_utils import generate_otp, normalize_phone, send_otp, validate_phone_sa
from drf_spectacular.utils import extend_schema
from .serializers import (
    CustomerSerializer,
    AddressSerializer,
    UserSerializer,
    RegisterSerializer,
    ProfileUpdateSerializer,
)


def build_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    }


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    @extend_schema(responses=UserSerializer)
    def create(self, request, *args, **kwargs):
        data = request.data
        username = data.get('username') or data.get('email', '').split('@')[0]
        email = data.get('email', '')
        password = data.get('password', '')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        if not email or not password:
            return Response(
                {'detail': 'البريد الإلكتروني وكلمة المرور مطلوبان'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'البريد الإلكتروني مستخدم بالفعل'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=username).exists():
            import uuid
            username = f"{username}_{str(uuid.uuid4())[:6]}"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        Customer.objects.get_or_create(user=user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class ProfileView(generics.GenericAPIView):
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(responses=UserSerializer)
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @extend_schema(request=ProfileUpdateSerializer, responses=UserSerializer)
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
        return Response(UserSerializer(user).data)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Customer.objects.select_related('user').all()
        return Customer.objects.filter(user=self.request.user)


class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
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
            return Response({"detail": "الهوية وكلمة المرور مطلوبتان"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=identifier, password=password)
        if user is None:
            return Response({"detail": "بيانات الدخول غير صحيحة"}, status=status.HTTP_400_BAD_REQUEST)

        payload = build_tokens(user)
        payload["user"] = UserSerializer(user).data
        return Response(payload)


class OTPRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = (request.data.get("phone") or "").strip()
        if not phone:
            return Response({"detail": "رقم الجوال مطلوب"}, status=status.HTTP_400_BAD_REQUEST)

        if not validate_phone_sa(phone):
            return Response({"detail": "رقم الجوال غير صحيح"}, status=status.HTTP_400_BAD_REQUEST)

        normalized_phone = normalize_phone(phone)
        code = generate_otp(4)

        from .models import OTPToken

        OTPToken.objects.filter(phone_number=normalized_phone, is_used=False).update(is_used=True)
        OTPToken.objects.create(
            phone_number=normalized_phone,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=5),
        )
        send_otp(normalized_phone, code)

        response = {
            "success": True,
            "phone": normalized_phone,
            "message": "تم إرسال رمز التحقق بنجاح",
        }
        from django.conf import settings
        if settings.DEBUG:
            response["debug_code"] = code
        return Response(response)


class OTPVerifyView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        phone = (request.data.get("phone") or "").strip()
        code = (request.data.get("code") or "").strip()

        if not phone or not code:
            return Response({"detail": "رقم الجوال والرمز مطلوبان"}, status=status.HTTP_400_BAD_REQUEST)

        normalized_phone = normalize_phone(phone)

        from .models import OTPToken

        token = OTPToken.objects.filter(
            phone_number=normalized_phone,
            code=code,
            is_used=False,
        ).order_by("-created_at").first()

        if not token or not token.is_valid():
            if token:
                token.attempts += 1
                token.save(update_fields=["attempts"])
            return Response({"detail": "رمز التحقق غير صحيح أو منتهي الصلاحية"}, status=status.HTTP_400_BAD_REQUEST)

        token.is_used = True
        token.save(update_fields=["is_used"])

        customer = Customer.objects.filter(phone_number=normalized_phone).select_related("user").first()
        user = customer.user if customer else User.objects.filter(username=normalized_phone).first()

        if user is None:
            from django.utils.crypto import get_random_string
            user = User.objects.create_user(username=normalized_phone, password=get_random_string(16))

        customer, created = Customer.objects.get_or_create(
            user=user,
            defaults={"phone_number": normalized_phone},
        )
        if not created and not customer.phone_number:
            customer.phone_number = normalized_phone
            customer.save(update_fields=["phone_number"])

        payload = build_tokens(user)
        payload["user"] = UserSerializer(user).data
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
            return Response({"detail": "بيانات الموقع غير مكتملة"}, status=status.HTTP_400_BAD_REQUEST)

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
            city=(city or "jeddah - جدة")[:100],
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
