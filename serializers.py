# payments/serializers.py
from rest_framework import serializers
from .models import PaymentMethod, Payment


class PaymentMethodSerializer(serializers.ModelSerializer):
    """
    Secure serializer for PaymentMethod.
    Only exposes non-sensitive fields to frontend.
    """
    class Meta:
        model = PaymentMethod
        fields = [
            'id',
            'is_default',
            'card_brand',
            'last_four_digits',
            'exp_month',
            'exp_year',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'last_four_digits',
            'card_brand',
            'exp_month',
            'exp_year',
            'created_at',
        ]


class PaymentMethodCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating payment methods.
    Accepts Stripe payment method ID instead of full card details.
    """
    stripe_payment_method_id = serializers.CharField(write_only=True)
    
    class Meta:
        model = PaymentMethod
        fields = [
            'id',
            'stripe_payment_method_id',
            'is_default',
            'card_brand',
            'last_four_digits',
            'exp_month',
            'exp_year',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'card_brand',
            'last_four_digits',
            'exp_month',
            'exp_year',
            'created_at',
        ]


class PaymentSerializer(serializers.ModelSerializer):
    """
    Secure serializer for Payment.
    Only exposes safe fields to prevent information leakage.
    """
    class Meta:
        model = Payment
        fields = [
            'id',
            'amount',
            'currency',
            'status',
            'created_at',
            'paid_at',
            'error_message',
            'description',
        ]
        read_only_fields = [
            'id',
            'status',
            'created_at',
            'paid_at',
            'error_message',
            'currency',
        ]


class PaymentDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for payment information (admin only).
    Includes transaction details but not sensitive card data.
    """
    user_email = serializers.CharField(source='user.email', read_only=True)
    payment_method_display = serializers.CharField(
        source='get_payment_method_display',
        read_only=True
    )
    
    class Meta:
        model = Payment
        fields = [
            'id',
            'user_email',
            'amount',
            'currency',
            'status',
            'description',
            'error_message',
            'stripe_payment_intent_id',
            'stripe_charge_id',
            'created_at',
            'updated_at',
            'paid_at',
            'payment_method_display',
        ]
        read_only_fields = [
            'id',
            'user_email',
            'status',
            'error_message',
            'stripe_payment_intent_id',
            'stripe_charge_id',
            'created_at',
            'updated_at',
            'paid_at',
        ]