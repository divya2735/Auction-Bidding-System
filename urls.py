# payments/urls.py
from django.urls import path
from . import views , webhook

urlpatterns = [
    # Payment Methods (Save/Delete Cards)
    path('methods/', views.PaymentMethodListCreateView.as_view(), name='payment-methods'),
    path('methods/<int:pk>/', views.PaymentMethodDetailView.as_view(), name='payment-method-detail'),

    # Payment Endpoints
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('create-intent/', views.CreatePaymentIntentView.as_view(), name='create-payment-intent'),
    path('confirm-payment/', views.ConfirmPaymentView.as_view(), name='confirm-payment'),
    path('<int:payment_id>/status/', views.PaymentStatusView.as_view(), name='payment-status'),
    path('<int:payment_id>/refund/', views.RefundPaymentView.as_view(), name='refund-payment'),

    path('webhook/stripe/', webhook.stripe_webhook, name='stripe-webhook'),
    path('webhook/test/', webhook.test_webhook, name='test-webhook'),
]