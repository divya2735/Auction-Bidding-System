# users/utils.py

from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP
import random


def generate_otp():
    """Generate a random 6-digit OTP."""
    return ''.join(random.choices('0123456789', k=6))


def send_otp_email(user):
    """Send OTP to user's email and store it in the EmailOTP model."""
    otp = generate_otp()
    EmailOTP.objects.create(user=user, otp=otp)

    subject = "Your OTP Verification Code"
    message = f"""
Hi {user.first_name},

Your OTP verification code is: {otp}

This code is valid for 10 minutes. Do not share it with anyone.

Thank you,
{settings.PROJECT_NAME if hasattr(settings, 'PROJECT_NAME') else 'Team'}
"""

    send_mail(
        subject=subject,
        message=message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )
