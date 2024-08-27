from datetime import datetime, timedelta
from django.utils import timezone
import random
import string
from rest_framework_simplejwt.tokens import AccessToken
from django.core.mail import send_mail
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from login.models import Account, VerificationCode
from person.models import UserCoupons


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)  # 允许所有用户访问登录接口

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description="username"),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description="password", format=openapi.FORMAT_PASSWORD),
            }
        ),
        responses={
            200: openapi.Response(
                description="login successful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'token': openapi.Schema(type=openapi.TYPE_STRING, description="JWT token"),
                    }
                )
            ),
            400: openapi.Response(description="bad request"),
            401: openapi.Response(description="no auth"),
            403: openapi.Response(description="account locked"),
        }
    )
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        # 锁定逻辑
        lock_key = f"lock_{username}"
        if cache.get(lock_key):
            return Response({'error': 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

        user = Account.objects.filter(username=username).first()
        if user and user.password == password:
            token = AccessToken.for_user(user)  # 生成token

            # 成功登录，重置失败计数
            cache.delete(f"login_attempts_{username}")
            return Response({'token': str(token)}, status=status.HTTP_200_OK)
        else:
            attempts = cache.get(f"login_attempts_{username}", 0)
            attempts += 1
            cache.set(f"login_attempts_{username}", attempts, timeout=60)  # 1分钟内的尝试次数

            if attempts >= 3:
                cache.set(lock_key, True, timeout=10)  # 锁定账户10秒
                return Response({'error': 'Account is temporarily locked due to multiple failed login attempts. Please try again later.'}, status=status.HTTP_403_FORBIDDEN)

            return Response({'error': 'Invalid username or password'}, status=status.HTTP_401_UNAUTHORIZED)

    @swagger_auto_schema(
        operation_description="Obtain login page information or login status",
        responses={
            200: openapi.Response(
                description="Obtain login page information or login status",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'is_authenticated': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="Has the user logged in"),

                    }
                )
            ),
            401: openapi.Response(description="no auth"),
        }
    )
    def get(self, request, *args, **kwargs):
        pass
        return Response({'test': "test"}, status=status.HTTP_200_OK)


class RegisterView(APIView):

    @swagger_auto_schema(
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'password', 'phone', 'email', 'verification_code', 'carType', 'carCode'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description="username"),
                'phone': openapi.Schema(type=openapi.TYPE_STRING, description="phone"),
                'email': openapi.Schema(type=openapi.TYPE_STRING, description="email"),
                'verification_code': openapi.Schema(type=openapi.TYPE_STRING, description="verification_code"),
                'carType': openapi.Schema(type=openapi.TYPE_STRING, description="carType"),
                'carCode': openapi.Schema(type=openapi.TYPE_STRING, description="carCode"),
                'password': openapi.Schema(type=openapi.TYPE_STRING, description="password", format=openapi.FORMAT_PASSWORD),
            }
        ),

    )
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        phone = request.data.get('phone')
        email = request.data.get('email')
        verification_code = request.data.get('verification_code')
        carType = request.data.get('carType')
        carCode = request.data.get('carCode')

        if not all([username, password, phone, email, carType, carCode]):
            return Response({'error': 'User name, password, phone number, and email are required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Account.objects.filter(username=username).exists():
            return Response({'error': 'The username already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        if Account.objects.filter(email=email).exists():
            return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Account.objects.filter(phone=phone).exists():
            return Response({'error': 'Phone number already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if Account.objects.filter(carCode=carCode).exists():
            return Response({'error': 'Car code already exists.'}, status=status.HTTP_400_BAD_REQUEST)

        # 获取最新的验证码
        # code_info = VerificationCode.objects.filter(email=email, action='register').order_by('-generate_time').first()
        # if not code_info or code_info.code != verification_code or not code_info.is_valid():    # 验证码不存在或已过期或不匹配
        #     return Response({'error': 'Invalid or expired verification code.'}, status=status.HTTP_401_UNAUTHORIZED)
        
        Account.objects.create(username=username, password=password, phone=phone, email=email, carType=carType, carCode=carCode)    # 创建用户
        user_id = Account.objects.get(username=username).id
        UserCoupons.objects.create(owner_id=user_id, discount=0.9, start_time=timezone.now(), end_time=timezone.now() + timedelta(days=30), status='unused')

        return Response({'user': username}, status=status.HTTP_200_OK)

class MyQueryView(APIView):
    authentication_classes = [JSONWebTokenAuthentication]

    def get(self, request, *args, **kwargs):
        pass
        return Response({'data': 'test query'})


class LogoutView(APIView):
    @swagger_auto_schema(
        manual_parameters=[
            openapi.Parameter(
                'Authorization', in_=openapi.IN_HEADER,
                description="Direct token input without 'Bearer' prefix", type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={200: 'Successfully logged out'}
    )
    def post(self, request):
        # Retrieve the Authorization header from the request
        token = request.META.get('HTTP_AUTHORIZATION', None)

        if token:
            # Add the token to the blacklist directly without checking for 'Bearer' prefix
            cache.set(token, "blacklisted", timeout=24 * 3600)  # Set expiration time to 1 day

            return Response({"detail": "Successfully logged out."}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Authorization token not provided."}, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name='dispatch')
class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)

    @swagger_auto_schema(
        operation_description="Reset password using the verification code",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['username', 'email', 'new_password', 'confirm_password', 'verification_code'],
            properties={
                'username': openapi.Schema(type=openapi.TYPE_STRING, description="Username"),
                'email': openapi.Schema(type=openapi.TYPE_STRING, description="Email"),
                'new_password': openapi.Schema(type=openapi.TYPE_STRING, description="New password"),
                'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, description="Confirm new password"),
                'verification_code': openapi.Schema(type=openapi.TYPE_STRING,
                                                    description="Verification code received by email"),
            }
        ),
        responses={
            200: openapi.Response(description="Password reset successful"),
            400: openapi.Response(description="Bad request"),
            401: openapi.Response(description="Unauthorized or verification code mismatch"),
        }
    )
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')
        verification_code = request.data.get('verification_code')

        if not (new_password and confirm_password and verification_code):
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        code_info = VerificationCode.objects.filter(email=email, action='reset_password').order_by('-generate_time').first()    # 获取最新的验证码
        if not code_info or code_info.code != verification_code or not code_info.is_valid():    # 验证码不存在或已过期或不匹配
            return Response({'error': 'Invalid or expired verification code.'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = Account.objects.get(username=username, email=email)
            if user.password == new_password:   # 新密码不能与旧密码相同
                return Response({'error': 'The new password cannot be the same as the old password.'}, status=status.HTTP_400_BAD_REQUEST)
            user.password=new_password  # 重置密码
            user.save()
            return Response({'message': 'Password reset successful.'}, status=status.HTTP_200_OK)
        except Account.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)


@method_decorator(csrf_exempt, name='dispatch')
class VerificationCodeView(APIView):
    # 生成6位随机验证码
    def generate_verification_code(self):
        characters = string.ascii_letters + string.digits
        verification_code = ''.join(random.choice(characters) for _ in range(6))
        return verification_code

    # 发送验证码邮件
    def send_verification_email(self, email, code, action):
        if action == 'register':
            subject = 'Account Verification Code'
        elif action == 'reset_password':
            subject = 'Password Reset Verification Code'
        message = f'Your verification code is: {code}'
        send_mail(subject, message, None, [email])
    
    @swagger_auto_schema(
        operation_description="Send verification code to the provided email",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email', 'action'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description="Email to receive the verification code"),
                'action': openapi.Schema(type=openapi.TYPE_STRING, description="Action (register or reset_password)"),
            }
        ),
        responses={
            200: openapi.Response(description="Verification code sent successfully"),
            400: openapi.Response(description="Bad request"),
        }
    )       
    
    def post(self, request):
        email = request.data.get('email')
        action = request.data.get('action')
        if not email:
            return Response({'error': 'Please provide an email address.'}, status=status.HTTP_400_BAD_REQUEST)
        if action == 'register':
            if Account.objects.filter(email=email).exists():    # 注册时检查邮箱是否已被注册
                return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        elif action == 'reset_password':
            if not Account.objects.filter(email=email).exists():    # 重置密码时检查邮箱是否存在
                return Response({'error': 'An account with this email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        code_info = VerificationCode.objects.filter(email=email, action=action).order_by('-generate_time').first()    # 获取最新的验证码
        if code_info and code_info.is_valid():
            verification_code = code_info.code  # 如果验证码未过期，则使用之前生成的验证码
        else:   # 如果验证码已过期或不存在，则重新生成一个验证码
            verification_code = self.generate_verification_code()
            VerificationCode.objects.create(email=email, code=verification_code, action=action)
        self.send_verification_email(email, verification_code, action)
        return Response({'message': 'Verification code sent successfully'}, status=status.HTTP_200_OK)
from rest_framework.permissions import AllowAny


# class ReadmeView(APIView):
#     permission_classes = [AllowAny]  # 允许所有用户访问

#     @swagger_auto_schema(
#         operation_description="Send introduction email about the car parking rental website",
#         request_body=openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             required=['email'],
#             properties={
#                 'email': openapi.Schema(type=openapi.TYPE_STRING, description="User's email address"),
#             }
#         ),
#         responses={
#             200: openapi.Response(description="Email sent successfully"),
#             400: openapi.Response(description="Bad request"),
#         }
#     )
#     def post(self, request, *args, **kwargs):
#         email = request.data.get('email')
#         if not email:
#             return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

#         # 预定义的网站介绍内容
#         subject = "Welcome to the Car Park Rental Website"
#         message = """
#         Welcome to Car Park Rental!

#         Find the best parking spots at the most affordable prices with us. Whether you're looking to rent a spot for your car or you have extra space you'd like to rent out, we've got you covered.

#         Get started today and make the most of your parking space with Car Park Rental.

#         Best,
#         The Car Park Rental Team
#         """
#         from_email = 'from@example.com'
#         # 发送邮件
#         send_mail(subject, message, from_email, [email])

#         return Response({"message": "Introduction email sent successfully to " + email}, status=status.HTTP_200_OK)



from django.core.mail import EmailMessage
from django.conf import settings
import os

class ReadmeView(APIView):
    permission_classes = [AllowAny]  # 允许所有用户访问

    @swagger_auto_schema(
        operation_description="Send introduction email about the car parking rental website",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['email'],
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description="User's email address"),
            }
        ),
        responses={
            200: openapi.Response(description="Email sent successfully"),
            400: openapi.Response(description="Bad request"),
        }
    )
    def post(self, request, *args, **kwargs):
        recipient_email = request.data.get('email')
        if not recipient_email:
            return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

        subject = "Welcome to the Car Park Rental Website"
        message = """
        To whom it may concern,

        I hope this email finds you well. I am writing to recommend Close A.I.'s innovative Parking Lot Finder to streamline and simplify your parking experience.

        As someone who understands the frustrations of searching for parking spaces, I've recently discovered Close A.I.'s solution, and I am thoroughly impressed. Their advanced technology harnesses the power of artificial intelligence to efficiently locate available parking spots in real-time, saving valuable time and reducing stress.

        Close A.I.'s Parking Lot Finder offers several benefits that I believe would greatly benefit you and your organization:
        1. Real-Time Updates: Receive instant updates on available parking spaces nearby, ensuring a smooth parking experience.
        2. Customizable Filters: Tailor your search based on preferences such as location, pricing, and amenities, ensuring that you find the perfect parking spot every time.
        3. User-Friendly Interface: The intuitive interface makes it easy to use for individuals of all technical abilities, enhancing accessibility.
        4. Cost-Effective Solution: By minimizing the time spent searching for parking, Close A.I. helps save on fuel costs and reduces carbon emissions, aligning with sustainability goals.

        I highly recommend considering Close A.I.'s Parking Lot Finder to enhance convenience and efficiency for your parking needs. Feel free to reach out to their team for further information or to schedule a demo.

        Thank you for considering this recommendation. I am confident that Close A.I.'s solution will greatly improve your parking experience.

        Best regards,
        Close A.I. Co.
        """
        from_email = settings.DEFAULT_FROM_EMAIL

        # Use the BASE_DIR setting to dynamically find the path
        file_path = os.path.join(settings.BASE_DIR, 'Parking rent closeai.pptx')

        email_message = EmailMessage(
            subject=subject,
            body=message,
            from_email=from_email,
            to=[recipient_email]
        )
        email_message.attach_file(file_path)  # Attach the PPT file
        email_message.send()

        return Response({"message": "Introduction email sent successfully to " + recipient_email}, status=status.HTTP_200_OK)
