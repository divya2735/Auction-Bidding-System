# payments/webhook_handler.py
"""
Stripe webhook event handlers.
Processes payment events: succeeded, failed, disputed, refunded.
Includes amount verification and idempotency checks.

NOTE: Imports are done inside methods to avoid circular imports.
"""
import logging
from decimal import Decimal
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

# ✅ FIXED: Don't import models at module level to avoid circular imports
# from orders.models import Order
# from auctions.models import AuctionItem

from .models import Payment, PaymentMethod, WebhookEvent

logger = logging.getLogger(__name__)


class StripeWebhookHandler:
    """Handle Stripe webhook events with idempotency and validation"""

    @staticmethod
    def _check_event_processed(event_id):
        """Check if event has already been processed"""
        try:
            return WebhookEvent.objects.filter(stripe_event_id=event_id).exists()
        except Exception as e:
            logger.error(f"Error checking event processing: {e}")
            return False

    @staticmethod
    def _mark_event_processed(event_id, event_type):
        """Mark event as processed"""
        try:
            WebhookEvent.objects.create(
                stripe_event_id=event_id,
                event_type=event_type
            )
        except Exception as e:
            logger.error(f"Error marking event processed: {e}")

    @staticmethod
    def _send_user_email(user_email, subject, message):
        """Send email with error handling"""
        try:
            if not settings.EMAIL_HOST_USER:
                logger.warning("EMAIL_HOST_USER not configured")
                return False
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user_email],
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send email to {user_email}: {e}")
            return False

    @staticmethod
    def _send_admin_email(subject, message):
        """Send email to admin with error handling"""
        try:
            if not hasattr(settings, 'ADMIN_EMAIL') or not settings.ADMIN_EMAIL:
                logger.warning("ADMIN_EMAIL not configured")
                return False
            
            if not settings.EMAIL_HOST_USER:
                logger.warning("EMAIL_HOST_USER not configured")
                return False
            
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.ADMIN_EMAIL],
                fail_silently=False,
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send admin email: {e}")
            return False

    @staticmethod
    def _send_websocket_notification(user_id, notification_type, content):
        """Send WebSocket notification with error handling"""
        try:
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f"user_{user_id}",
                {
                    "type": "payment_notification",
                    "content": {
                        "type": notification_type,
                        **content
                    }
                }
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send WebSocket notification: {e}")
            return False

    @staticmethod
    def handle_payment_intent_succeeded(event):
        """
        Handle payment_intent.succeeded event
        
        ✅ FIXED: Proper transaction handling and status updates
        """
        try:
            event_id = event['id']
            event_type = event['type']
            
            logger.info(f"\n{'='*60}")
            logger.info(f"🔔 WEBHOOK: payment_intent.succeeded")
            logger.info(f"Event ID: {event_id}")
            logger.info(f"{'='*60}")
            
            # Check if already processed (idempotency)
            if StripeWebhookHandler._check_event_processed(event_id):
                logger.info(f"Event already processed: {event_id}")
                return {'success': True, 'duplicate': True}
            
            intent = event['data']['object']
            payment_intent_id = intent['id']
            stripe_amount = Decimal(str(intent['amount'])) / 100  # Convert cents to dollars
            
            logger.info(f"Payment Intent: {payment_intent_id}")
            logger.info(f"Amount: ${stripe_amount}")
            
            # ✅ Find the Payment record with atomic transaction
            from django.db import transaction
            
            with transaction.atomic():
                try:
                    # Lock the payment record
                    payment = Payment.objects.select_for_update().get(
                        stripe_payment_intent_id=payment_intent_id
                    )
                    logger.info(f"✅ Payment found: {payment.id}")
                    logger.info(f"   Current Status: {payment.status}")
                    logger.info(f"   User: {payment.user.email}")
                except Payment.DoesNotExist:
                    logger.warning(f"❌ Payment not found for intent: {payment_intent_id}")
                    return {'success': False, 'error': 'Payment not found'}

                # ✅ VALIDATE AMOUNT MATCH
                if stripe_amount != payment.amount:
                    logger.error(
                        f"❌ AMOUNT MISMATCH for payment {payment.id}: "
                        f"Stripe=${stripe_amount}, DB=${payment.amount}"
                    )
                    payment.status = 'failed'
                    payment.error_message = f"Amount mismatch: Stripe ${stripe_amount} != DB ${payment.amount}"
                    payment.save()
                    logger.error("Amount validation failed - payment marked as failed")
                    return {'success': False, 'error': 'Amount verification failed'}

                # ✅ UPDATE PAYMENT STATUS
                logger.info(f"\n💳 UPDATING PAYMENT STATUS")
                payment.status = 'succeeded'
                payment.paid_at = timezone.now()
                
                # Store charge ID
                try:
                    if intent.get('charges') and intent['charges'].get('data'):
                        payment.stripe_charge_id = intent['charges']['data'][0]['id']
                        logger.info(f"   Charge ID: {payment.stripe_charge_id}")
                except (AttributeError, IndexError, TypeError) as e:
                    logger.warning(f"⚠️ Could not extract charge ID: {e}")
                
                # ✅ SAVE TO DATABASE - CRITICAL
                payment.save()
                logger.info(f"✅ Payment {payment.id} SAVED")
                logger.info(f"   New Status: {payment.status}")
                logger.info(f"   Paid At: {payment.paid_at}")
                
                # Verify save
                payment.refresh_from_db()
                logger.info(f"✅ VERIFICATION: DB Status = {payment.status}")

            # ✅ Send notifications OUTSIDE transaction
            user = payment.user
            logger.info(f"\n📧 SENDING NOTIFICATIONS")
            
            # 1️⃣ Email notification
            StripeWebhookHandler._send_user_email(
                user.email,
                '✅ Payment Successful',
                f"""
    Hi {user.first_name or 'Customer'},

    Your payment of ${payment.amount} has been processed successfully.

    Payment ID: {payment.id}
    Transaction ID: {payment_intent_id}
    Date: {payment.paid_at.strftime('%Y-%m-%d %H:%M:%S')}

    Thank you for your purchase!
                """
            )
            logger.info(f"✅ Email sent to {user.email}")

            # 2️⃣ WebSocket notification
            StripeWebhookHandler._send_websocket_notification(
                user.id,
                "payment_succeeded",
                {
                    "payment_id": payment.id,
                    "amount": str(payment.amount),
                    "message": "Payment processed successfully!"
                }
            )
            logger.info(f"✅ WebSocket notification sent")

            # Mark event as processed
            StripeWebhookHandler._mark_event_processed(event_id, event_type)
            
            logger.info(f"\n✅ WEBHOOK PROCESSING COMPLETE")
            logger.info(f"{'='*60}\n")

            return {'success': True, 'payment_id': payment.id}

        except Exception as e:
            logger.error(f"❌ Error in handle_payment_intent_succeeded: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {'success': False, 'error': str(e)}
    
    @staticmethod
    def handle_payment_intent_payment_failed(event):
        """
        Handle payment_intent.payment_failed event
        
        Updates payment status to failed and notifies user.
        """
        try:
            event_id = event['id']
            event_type = event['type']
            
            # Check if already processed (idempotency)
            if StripeWebhookHandler._check_event_processed(event_id):
                logger.info(f"Event already processed: {event_id}")
                return {'success': True, 'duplicate': True}
            
            intent = event['data']['object']
            payment_intent_id = intent['id']
            
            # Find the Payment record
            try:
                payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            except Payment.DoesNotExist:
                logger.warning(f"❌ Payment not found for intent: {payment_intent_id}")
                return {'success': False, 'error': 'Payment not found'}

            # Update payment status
            payment.status = 'failed'
            error_msg = intent.get('last_payment_error', {}).get('message', 'Unknown error')
            payment.error_message = error_msg
            payment.save()
            logger.error(f"❌ Payment failed: {payment.id} - {error_msg}")

            # Get user and send notifications
            user = payment.user
            
            # 1️⃣ Email notification
            StripeWebhookHandler._send_user_email(
                user.email,
                '❌ Payment Failed',
                f"""
Hi {user.first_name or 'Customer'},

Your payment of ${payment.amount} could not be processed.

Error: {error_msg}
Payment ID: {payment.id}

Please try again or contact support.
                """
            )

            # 2️⃣ WebSocket notification
            StripeWebhookHandler._send_websocket_notification(
                user.id,
                "payment_failed",
                {
                    "payment_id": payment.id,
                    "error": error_msg,
                    "message": "Payment failed. Please try again."
                }
            )

            # Mark event as processed
            StripeWebhookHandler._mark_event_processed(event_id, event_type)

            return {'success': True, 'payment_id': payment.id}

        except Exception as e:
            logger.error(f"Error in handle_payment_intent_payment_failed: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def handle_charge_dispute_created(event):
        """
        Handle charge.dispute.created event
        
        Alerts user and admin about dispute.
        """
        try:
            event_id = event['id']
            event_type = event['type']
            
            # Check if already processed
            if StripeWebhookHandler._check_event_processed(event_id):
                logger.info(f"Event already processed: {event_id}")
                return {'success': True, 'duplicate': True}
            
            dispute = event['data']['object']
            charge_id = dispute.get('charge')
            
            # Find the Payment record by charge ID
            try:
                payment = Payment.objects.get(stripe_charge_id=charge_id)
            except Payment.DoesNotExist:
                logger.warning(f"❌ Payment not found for charge: {charge_id}")
                return {'success': False, 'error': 'Payment not found'}

            logger.warning(f"⚠️ Dispute created for payment: {payment.id} (Charge: {charge_id})")

            user = payment.user
            dispute_amount = Decimal(str(dispute.get('amount', 0))) / 100
            
            # 1️⃣ Email to user
            StripeWebhookHandler._send_user_email(
                user.email,
                '⚠️ Dispute Reported on Your Payment',
                f"""
Hi {user.first_name or 'Customer'},

A dispute has been reported on your payment of ${payment.amount}.

Payment ID: {payment.id}
Dispute Amount: ${dispute_amount}
Reason: {dispute.get('reason', 'Unknown')}

We will investigate this matter and contact you shortly.
                """
            )

            # 2️⃣ Alert admin
            StripeWebhookHandler._send_admin_email(
                f'🚨 New Dispute - Payment ID {payment.id}',
                f"""
New dispute created for payment {payment.id}

User: {user.email}
Amount: ${payment.amount}
Dispute ID: {dispute.get('id')}
Reason: {dispute.get('reason')}
Status: {dispute.get('status')}
                """
            )

            # Mark event as processed
            StripeWebhookHandler._mark_event_processed(event_id, event_type)

            return {'success': True}

        except Exception as e:
            logger.error(f"Error in handle_charge_dispute_created: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def handle_charge_refunded(event):
        """
        Handle charge.refunded event
        
        Updates payment and order status to refunded.
        Notifies user about refund.
        
        ✅ FIXED: Imports Order inside method to avoid circular imports
        """
        try:
            event_id = event['id']
            event_type = event['type']
            
            # Check if already processed
            if StripeWebhookHandler._check_event_processed(event_id):
                logger.info(f"Event already processed: {event_id}")
                return {'success': True, 'duplicate': True}
            
            charge = event['data']['object']
            charge_id = charge.get('id')
            
            # Find the Payment record
            try:
                payment = Payment.objects.get(stripe_charge_id=charge_id)
            except Payment.DoesNotExist:
                logger.warning(f"❌ Payment not found for charge: {charge_id}")
                return {'success': False, 'error': 'Payment not found'}

            # ✅ FIXED: Import Order here to avoid circular imports
            try:
                from orders.models import Order
                
                # Update payment status
                payment.status = 'refunded'
                payment.save()
                
                # Update related orders
                Order.objects.filter(payment=payment).update(status='refunded')
            except ImportError:
                logger.warning("Could not import Order model for refund processing")
                payment.status = 'refunded'
                payment.save()
            
            logger.info(f"✅ Payment refunded: {payment.id} (Charge: {charge_id})")

            user = payment.user
            refund_amount = Decimal(str(charge.get('amount_refunded', 0))) / 100
            
            # 1️⃣ Email notification
            StripeWebhookHandler._send_user_email(
                user.email,
                '💰 Refund Processed',
                f"""
Hi {user.first_name or 'Customer'},

A refund of ${refund_amount} has been processed for your payment.

Payment ID: {payment.id}
Original Amount: ${payment.amount}
Refunded Amount: ${refund_amount}

The refund should appear in your account within 3-5 business days.
                """
            )

            # 2️⃣ WebSocket notification
            StripeWebhookHandler._send_websocket_notification(
                user.id,
                "payment_refunded",
                {
                    "payment_id": payment.id,
                    "refund_amount": str(refund_amount),
                    "message": f"Refund of ${refund_amount} processed!"
                }
            )

            # Mark event as processed
            StripeWebhookHandler._mark_event_processed(event_id, event_type)

            return {'success': True, 'payment_id': payment.id}

        except Exception as e:
            logger.error(f"Error in handle_charge_refunded: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def handle_payment_method_attached(event):
        """
        Handle payment_method.attached event
        
        Currently just logs the event. Can be expanded for future use.
        """
        try:
            event_id = event['id']
            event_type = event['type']
            
            # Check if already processed
            if StripeWebhookHandler._check_event_processed(event_id):
                return {'success': True, 'duplicate': True}
            
            payment_method = event['data']['object']
            payment_method_id = payment_method.get('id')
            
            logger.info(f"✅ PaymentMethod attached: {payment_method_id}")
            
            # Mark event as processed
            StripeWebhookHandler._mark_event_processed(event_id, event_type)
            
            return {'success': True}

        except Exception as e:
            logger.error(f"Error in handle_payment_method_attached: {str(e)}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def handle_payment_method_detached(event):
        """
        Handle payment_method.detached event
        
        Deletes the PaymentMethod record from database.
        """
        try:
            event_id = event['id']
            event_type = event['type']
            
            # Check if already processed
            if StripeWebhookHandler._check_event_processed(event_id):
                return {'success': True, 'duplicate': True}
            
            # ✅ FIXED: Removed double assignment
            payment_method = event['data']['object']
            payment_method_id = payment_method.get('id')
            
            # Delete the PaymentMethod record from database
            try:
                pm = PaymentMethod.objects.get(stripe_payment_method_id=payment_method_id)
                pm.delete()
                logger.info(f"✅ PaymentMethod deleted: {payment_method_id}")
            except PaymentMethod.DoesNotExist:
                logger.warning(f"❌ PaymentMethod not found: {payment_method_id}")
            
            # Mark event as processed
            StripeWebhookHandler._mark_event_processed(event_id, event_type)
            
            return {'success': True}

        except Exception as e:
            logger.error(f"Error in handle_payment_method_detached: {str(e)}")
            return {'success': False, 'error': str(e)}