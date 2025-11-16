# payments/admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import PaymentMethod, Payment, WebhookEvent


@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "card_brand_display",
        "last_four_display",
        "expiry_display",
        "is_default",
        "created_at",
    )
    list_filter = ("card_brand", "is_default", "created_at")
    search_fields = ("user__email", "user__username", "last_four_digits")
    readonly_fields = (
        "stripe_payment_method_id",
        "card_brand",
        "last_four_digits",
        "exp_month",
        "exp_year",
        "created_at",
        "updated_at",
    )
    fieldsets = (
        ("User Information", {"fields": ("user",)}),
        ("Card Details", {
            "fields": ("card_brand", "last_four_digits", "exp_month", "exp_year", "is_default"),
            "description": "These fields are read-only and populated from Stripe.",
        }),
        ("Stripe Integration", {
            "fields": ("stripe_payment_method_id",),
            "classes": ("collapse",),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at"),
            "classes": ("collapse",),
        }),
    )

    def card_brand_display(self, obj):
        brand_colors = {
            'visa': '#1A1F71',
            'mastercard': '#FF5F00',
            'amex': '#006FCF',
            'discover': '#FF6000',
        }
        color = brand_colors.get(obj.card_brand, '#999999')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            obj.get_card_brand_display()
        )
    card_brand_display.short_description = "Card Brand"

    def last_four_display(self, obj):
        return f"****{obj.last_four_digits}"
    last_four_display.short_description = "Card Number"

    def expiry_display(self, obj):
        if obj.exp_month and obj.exp_year:
            return f"{obj.exp_month:02d}/{obj.exp_year}"
        return "N/A"
    expiry_display.short_description = "Expiry"

    def has_add_permission(self, request):
        return False  # Payment methods should only be created via Stripe

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superusers can delete


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "amount_display",
        "status_badge",
        "stripe_payment_intent_id_short",
        "paid_at",
        "created_at",
    )
    list_filter = ("status", "currency", "created_at")
    search_fields = ("user__email", "user__username", "stripe_payment_intent_id", "stripe_charge_id")
    readonly_fields = (
        "id",
        "user",
        "stripe_payment_intent_id",
        "stripe_charge_id",
        "stripe_payment_method_id",
        "transaction_id",
        "created_at",
        "updated_at",
        "paid_at",
        "error_details",
    )
    fieldsets = (
        ("Payment Information", {
            "fields": ("id", "user", "amount", "currency", "status"),
        }),
        ("Stripe Details", {
            "fields": (
                "stripe_payment_intent_id",
                "stripe_charge_id",
                "stripe_payment_method_id",
                "transaction_id",
            ),
            "classes": ("collapse",),
        }),
        ("Description & Error Details", {
            "fields": ("description", "error_details"),
        }),
        ("Timestamps", {
            "fields": ("created_at", "updated_at", "paid_at"),
            "classes": ("collapse",),
        }),
    )

    def amount_display(self, obj):
        return f"${obj.amount} {obj.currency}"
    amount_display.short_description = "Amount"

    def status_badge(self, obj):
        status_colors = {
            'pending': '#FFA500',
            'processing': '#87CEEB',
            'succeeded': '#00AA00',
            'failed': '#FF0000',
            'refunded': '#9966CC',
            'cancelled': '#666666',
        }
        color = status_colors.get(obj.status, '#999999')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"

    def stripe_payment_intent_id_short(self, obj):
        if obj.stripe_payment_intent_id:
            return f"{obj.stripe_payment_intent_id[:15]}..."
        return "N/A"
    stripe_payment_intent_id_short.short_description = "Payment Intent ID"

    def error_details(self, obj):
        if obj.error_message:
            return format_html(
                '<div style="background-color: #FFE6E6; border: 1px solid #FF0000; padding: 10px; border-radius: 3px; color: #660000;"><strong>Error:</strong> {}</div>',
                obj.error_message
            )
        return "No errors"
    error_details.short_description = "Error Information"

    def has_add_permission(self, request):
        return False  # Payments should only be created via API

    def has_delete_permission(self, request, obj=None):
        return False  # Never allow deleting payment records


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ("id", "event_type", "stripe_event_id_short", "processed_at")
    list_filter = ("event_type", "processed_at")
    search_fields = ("stripe_event_id", "event_type")
    readonly_fields = ("stripe_event_id", "event_type", "processed_at")

    def stripe_event_id_short(self, obj):
        return f"{obj.stripe_event_id[:20]}..."
    stripe_event_id_short.short_description = "Event ID"

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return request.user.is_superuser  # Only superuser can delete webhook events