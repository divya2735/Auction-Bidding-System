# payments/models.py
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

class PaymentMethod(models.Model):
    CARD_BRAND_CHOICES = [
        ('visa', 'Visa'),
        ('mastercard', 'Mastercard'),
        ('amex', 'American Express'),
        ('diners', 'Diners Club'),
        ('discover', 'Discover'),
        ('jcb', 'JCB'),
        ('unionpay', 'UnionPay'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payment_methods")
    
    # Legacy fields (kept for backward compatibility)
    card_number = models.CharField(max_length=16, blank=True, null=True)
    expiry_date = models.CharField(max_length=5, blank=True, null=True)
    cvv = models.CharField(max_length=3, blank=True, null=True)
    
    # Stripe fields (NEW) - WITH DEFAULTS
    stripe_payment_method_id = models.CharField(
        max_length=255, 
        unique=True, 
        blank=True, 
        null=True,
        default=None
    )
    last_four_digits = models.CharField(
        max_length=4,
        default='0000'
    )
    card_brand = models.CharField(
        max_length=20, 
        choices=CARD_BRAND_CHOICES, 
        default='visa'
    )
    exp_month = models.IntegerField(
        default=0
    )
    exp_year = models.IntegerField(
        default=0
    )
    
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.user.email} - {self.card_brand.upper()} ending in {self.last_four_digits}"


class Payment(models.Model):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("processing", "Processing"),
        ("succeeded", "Succeeded"),
        ("failed", "Failed"),
        ("refunded", "Refunded"),
        ("cancelled", "Cancelled"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payments")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(
        max_length=3, 
        default='USD'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default="pending"
    )
    
    # Legacy transaction ID
    transaction_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Stripe fields (NEW) - WITH DEFAULTS
    stripe_payment_intent_id = models.CharField(
        max_length=255, 
        unique=True, 
        blank=True, 
        null=True,
        default=None
    )
    stripe_charge_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        default=None
    )
    stripe_payment_method_id = models.CharField(
        max_length=255, 
        blank=True, 
        null=True,
        default=None
    )
    
    # Related objects
    payment_method = models.ForeignKey(
        PaymentMethod, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        default=None
    )
    
    # Metadata
    description = models.TextField(blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(
        blank=True, 
        null=True,
        default=None
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.status} (${self.amount})"
    
    def is_paid(self):
        return self.status == 'succeeded'


# NEW: WebhookEvent model for idempotency
class WebhookEvent(models.Model):
    stripe_event_id = models.CharField(max_length=255, unique=True, db_index=True)
    event_type = models.CharField(max_length=100)
    processed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-processed_at']
        verbose_name = "Webhook Event"
        verbose_name_plural = "Webhook Events"
    
    def __str__(self):
        return f"{self.event_type} - {self.stripe_event_id}"