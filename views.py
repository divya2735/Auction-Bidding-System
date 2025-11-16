# payments/views.py - FIXED VERSION
"""
Payment endpoints for auction payment processing.
Handles PaymentIntent creation, confirmation, and payment management.
"""
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from decimal import Decimal
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db import transaction
import stripe
from django.conf import settings
import logging
import traceback

from .models import PaymentMethod, Payment
from .serializers import (
    PaymentMethodSerializer,
    PaymentMethodCreateSerializer,
    PaymentSerializer,
)
from .stripe_utils import StripePaymentHandler

logger = logging.getLogger(__name__)


# =====================================================
# PAYMENT METHODS (Save/Delete Cards)
# =====================================================

class PaymentMethodListCreateView(generics.ListCreateAPIView):
    """
    GET: List all payment methods for current user
    POST: Save a new payment method (from Stripe payment method ID)
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PaymentMethodCreateSerializer
        return PaymentMethodSerializer

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Create payment method from Stripe payment method ID"""
        stripe_pm_id = serializer.validated_data.get('stripe_payment_method_id')
        
        # Get card details from Stripe
        result = StripePaymentHandler.save_payment_method(stripe_pm_id, self.request.user)
        
        if not result['success']:
            raise serializer.ValidationError(result['error'])
        
        # Save to database
        payment_method = serializer.save(
            user=self.request.user,
            stripe_payment_method_id=stripe_pm_id,
            card_brand=result['brand'],
            last_four_digits=result['last_four'],
            exp_month=result['exp_month'],
            exp_year=result['exp_year'],
        )
        
        logger.info(f"✅ Payment method saved for user {self.request.user.id}")


class PaymentMethodDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET: Retrieve a specific payment method
    PATCH: Update a payment method (e.g., set as default)
    DELETE: Delete a payment method
    """
    serializer_class = PaymentMethodSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return PaymentMethod.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        """Delete payment method from Stripe and database"""
        if instance.stripe_payment_method_id:
            result = StripePaymentHandler.delete_payment_method(
                instance.stripe_payment_method_id
            )
            if not result['success']:
                logger.error(f"Failed to delete from Stripe: {result['error']}")
        
        instance.delete()
        logger.info(f"✅ Payment method {instance.id} deleted for user {self.request.user.id}")


# =====================================================
# CREATE PAYMENT INTENT
# =====================================================

class CreatePaymentIntentView(APIView):
    """
    POST /payments/create-intent/
    Creates a Stripe PaymentIntent for a specific auction.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            auction_id = request.data.get('auction_id')

            if not auction_id:
                return Response(
                    {'error': 'auction_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # ✅ Import inside method to avoid circular imports
            try:
                from auctions.models import AuctionItem
            except ImportError:
                return Response(
                    {'error': 'Auction app not configured'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Verify user won the auction
            try:
                auction = AuctionItem.objects.get(id=auction_id, winner=request.user)
            except AuctionItem.DoesNotExist:
                return Response(
                    {'error': 'Auction not found or you did not win this auction'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # Use auction price (don't trust user input)
            amount = auction.current_price or auction.starting_price
            
            if not amount:
                return Response(
                    {'error': 'Invalid auction price'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            try:
                amount = Decimal(str(amount))
                if amount <= 0:
                    raise ValueError("Amount must be positive")
            except (ValueError, TypeError):
                return Response(
                    {'error': 'Invalid amount'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create PaymentIntent via Stripe
            description = f"Auction #{auction_id} - {request.user.email}"
            metadata = {
                'user_id': request.user.id,
                'user_email': request.user.email,
                'auction_id': auction_id,
            }

            result = StripePaymentHandler.create_payment_intent(
                amount=amount,
                user=request.user,
                description=description,
                metadata=metadata
            )

            if not result['success']:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Create Payment record in database (status: pending)
            payment = Payment.objects.create(
                user=request.user,
                amount=amount,
                status='pending',
                stripe_payment_intent_id=result['payment_intent_id'],
                description=description
            )

            logger.info(f"✅ PaymentIntent created for user {request.user.id}, auction {auction_id}")

            return Response({
                'client_secret': result['client_secret'],
                'payment_intent_id': result['payment_intent_id'],
                'status': result['status'],
                'payment_id': payment.id,
                'amount': str(amount),
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"❌ CreatePaymentIntent error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to create payment intent: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =====================================================
# CONFIRM PAYMENT - FIXED VERSION
# =====================================================

class ConfirmPaymentView(APIView):
    """
    POST /payments/confirm-payment/
    Confirms a payment after frontend processes with Stripe.js
    
    ✅ FIXED: Proper transaction handling and status updates
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            logger.info("\n" + "="*60)
            logger.info("🔔 CONFIRM PAYMENT REQUEST")
            logger.info(f"User: {request.user}")
            logger.info(f"Data: {request.data}")
            logger.info("="*60)

            payment_intent_id = request.data.get('payment_intent_id')
            auction_id = request.data.get('auction_id')

            if not payment_intent_id:
                return Response(
                    {'error': 'payment_intent_id is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            logger.info(f"📋 Payment Intent ID: {payment_intent_id}")
            logger.info(f"🛍️ Auction ID: {auction_id}")

            # ✅ CRITICAL: Use atomic transaction
            with transaction.atomic():
                # Get Payment and LOCK it
                try:
                    payment = Payment.objects.select_for_update().get(
                        stripe_payment_intent_id=payment_intent_id,
                        user=request.user
                    )
                    logger.info(f"✅ Payment found: {payment.id} (Current status: {payment.status})")
                except Payment.DoesNotExist:
                    logger.error(f"❌ Payment not found for intent: {payment_intent_id}")
                    return Response(
                        {'error': 'Payment not found'},
                        status=status.HTTP_404_NOT_FOUND
                    )

                # Retrieve PaymentIntent from Stripe
                result = StripePaymentHandler.retrieve_payment_intent(payment_intent_id)
                if not result['success']:
                    logger.error(f"❌ Failed to retrieve intent: {result['error']}")
                    return Response(
                        {'error': result['error']},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                intent = result['intent']
                logger.info(f"✅ Intent retrieved. Status: {intent.status}")
                
                # =====================================================
                # CHECK PAYMENT STATUS FROM STRIPE
                # =====================================================
                
                if intent.status == 'succeeded':
                    logger.info(f"\n💳 PAYMENT SUCCEEDED - UPDATING DATABASE")
                    logger.info(f"   Payment ID: {payment.id}")
                    logger.info(f"   Old Status: {payment.status}")
                    
                    # ✅ Update payment status
                    payment.status = 'succeeded'
                    payment.paid_at = timezone.now()
                    
                    # Store Stripe charge ID
                    try:
                        if intent.charges and intent.charges.data and len(intent.charges.data) > 0:
                            payment.stripe_charge_id = intent.charges.data[0].id
                            logger.info(f"   Charge ID: {payment.stripe_charge_id}")
                    except (AttributeError, IndexError, TypeError) as e:
                        logger.warning(f"⚠️ Could not extract charge ID: {e}")
                    
                    # ✅ SAVE PAYMENT - THIS IS CRITICAL
                    payment.save()
                    logger.info(f"✅ PAYMENT {payment.id} SAVED")
                    logger.info(f"   New Status: {payment.status}")
                    logger.info(f"   Paid At: {payment.paid_at}")
                    
                    # Verify save was successful
                    payment.refresh_from_db()
                    logger.info(f"✅ VERIFICATION: DB Status = {payment.status}")
                    
                    # =====================================================
                    # CREATE ORDER
                    # =====================================================
                    
                    if auction_id:
                        try:
                            from auctions.models import AuctionItem
                            from orders.models import Order
                            
                            logger.info(f"\n📦 CREATING ORDER")
                            logger.info(f"   Auction ID: {auction_id}")
                            
                            # Get auction
                            auction = AuctionItem.objects.select_for_update().get(
                                id=auction_id,
                                winner=request.user
                            )
                            logger.info(f"   Auction: {auction.item_name}")
                            
                            # Create or update order
                            order, created = Order.objects.get_or_create(
                                auction_item=auction,
                                buyer=request.user,
                                defaults={
                                    'payment': payment,
                                    'status': 'paid'
                                }
                            )
                            
                            if not created:
                                # Order exists, update it
                                if order.payment_id != payment.id:
                                    order.payment = payment
                                if order.status != 'paid':
                                    order.status = 'paid'
                                order.save()
                                logger.info(f"✅ Order {order.id} UPDATED to paid status")
                            else:
                                logger.info(f"✅ Order {order.id} CREATED")
                            
                            logger.info("\n✅ PAYMENT CONFIRMATION SUCCESSFUL")
                            logger.info(f"   Payment ID: {payment.id}")
                            logger.info(f"   Payment Status: {payment.status}")
                            logger.info(f"   Order ID: {order.id}")
                            logger.info(f"   Order Status: {order.status}")
                            logger.info("="*60 + "\n")
                            
                            return Response({
                                'success': True,
                                'status': intent.status,
                                'payment_id': payment.id,
                                'payment_status': payment.status,
                                'order_id': order.id,
                            }, status=status.HTTP_200_OK)
                            
                        except (ImportError, Exception) as e:
                            logger.warning(f"⚠️ Could not create order: {str(e)}")
                            logger.error(traceback.format_exc())
                            
                            # Still return success for payment even if order fails
                            return Response({
                                'success': True,
                                'status': intent.status,
                                'payment_id': payment.id,
                                'payment_status': payment.status,
                                'message': 'Payment confirmed but order creation failed'
                            }, status=status.HTTP_200_OK)

                    # No auction ID, just confirm payment
                    return Response({
                        'success': True,
                        'status': intent.status,
                        'payment_id': payment.id,
                        'payment_status': payment.status,
                    }, status=status.HTTP_200_OK)

                # =====================================================
                # PAYMENT NOT SUCCEEDED YET
                # =====================================================
                
                elif intent.status == 'requires_payment_method':
                    logger.warning(f"⚠️ Payment requires payment method")
                    payment.status = 'processing'
                    payment.save()
                    return Response({
                        'success': False,
                        'status': intent.status,
                        'error': 'Payment method required',
                    }, status=status.HTTP_400_BAD_REQUEST)

                elif intent.status == 'requires_confirmation':
                    logger.warning(f"⚠️ Payment requires confirmation")
                    payment.status = 'processing'
                    payment.save()
                    return Response({
                        'success': False,
                        'status': intent.status,
                        'error': 'Payment confirmation required',
                    }, status=status.HTTP_400_BAD_REQUEST)

                else:
                    logger.error(f"❌ Unexpected payment intent status: {intent.status}")
                    payment.status = 'failed'
                    payment.error_message = f"PaymentIntent status: {intent.status}"
                    payment.save()
                    return Response({
                        'success': False,
                        'status': intent.status,
                        'error': f'Payment failed: {intent.status}',
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            logger.error(f"❌ ConfirmPayment error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to confirm payment: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# =====================================================
# PAYMENT STATUS
# =====================================================

class PaymentStatusView(APIView):
    """
    GET /payments/<payment_id>/status/
    Check the status of a payment
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)
            
            return Response({
                'payment_id': payment.id,
                'status': payment.status,
                'amount': str(payment.amount),
                'currency': payment.currency,
                'created_at': payment.created_at.isoformat(),
                'paid_at': payment.paid_at.isoformat() if payment.paid_at else None,
                'error': payment.error_message,
            }, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )


# =====================================================
# PAYMENT LIST
# =====================================================

class PaymentListView(generics.ListAPIView):
    """
    GET /payments/
    List all payments for the current user
    """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Payment.objects.filter(user=self.request.user).order_by('-created_at')


# =====================================================
# REFUND PAYMENT
# =====================================================

class RefundPaymentView(APIView):
    """
    POST /payments/<payment_id>/refund/
    Refund a completed payment
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, payment_id):
        try:
            payment = Payment.objects.get(id=payment_id, user=request.user)

            if payment.status != 'succeeded':
                return Response(
                    {'error': 'Only succeeded payments can be refunded'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            if not payment.stripe_charge_id:
                return Response(
                    {'error': 'No stripe charge found for this payment'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get refund amount (full or partial)
            refund_amount = request.data.get('amount')
            if refund_amount:
                try:
                    refund_amount = Decimal(str(refund_amount))
                    if refund_amount <= 0 or refund_amount > payment.amount:
                        raise ValueError("Invalid refund amount")
                except (ValueError, TypeError):
                    return Response(
                        {'error': 'Invalid refund amount'},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            # Issue refund via Stripe
            result = StripePaymentHandler.refund_payment(
                charge_id=payment.stripe_charge_id,
                amount=refund_amount
            )

            if not result['success']:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update payment status
            with transaction.atomic():
                payment.status = 'refunded'
                payment.save()
                
                # Update related orders
                try:
                    from orders.models import Order
                    Order.objects.filter(payment=payment).update(status='refunded')
                except ImportError:
                    logger.warning("Could not import Order model")

            logger.info(f"✅ Payment {payment.id} refunded for user {request.user.id}")

            return Response({
                'success': True,
                'refund_id': result['refund_id'],
                'status': result['status'],
                'payment_id': payment.id,
            }, status=status.HTTP_200_OK)

        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"❌ Refund error: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {'error': f'Failed to process refund: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )