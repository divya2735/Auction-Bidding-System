# payments/tasks.py
"""
Celery async tasks for payment system.
Sends order notifications to buyers and sellers.
"""
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def send_order_notifications(self, order_id):
    """
    Send email and WebSocket notifications for new orders.
    
    Runs asynchronously via Celery.
    Retries up to 3 times on failure.
    
    Args:
        order_id (int): Order ID to process
    
    Returns:
        dict: Status of notification sending
    """
    try:
        # ✅ FIXED: Import inside task to avoid circular imports
        from orders.models import Order
        
        logger.info(f"📨 Sending order notifications for order {order_id}")
        
        # Get order with related objects
        try:
            order = Order.objects.select_related(
                "auction_item",
                "buyer",
                "seller"
            ).get(id=order_id)
        except Order.DoesNotExist:
            logger.error(f"❌ Order {order_id} not found")
            return {'success': False, 'error': 'Order not found'}
        
        auction = order.auction_item
        buyer = order.buyer
        seller = order.seller

        # Validate required fields
        if not buyer or not seller or not auction:
            logger.error(f"❌ Order {order_id} missing required relationships")
            return {'success': False, 'error': 'Missing required relationships'}

        # 1️⃣ Email to Buyer
        try:
            send_mail(
                subject=f"🎉 You won {auction.item_name}!",
                message=f"""
Hi {buyer.first_name or buyer.username},

Congratulations! You won {auction.item_name} at ${auction.current_price}.

Order ID: {order.id}
Item: {auction.item_name}
Final Price: ${auction.current_price}
Category: {auction.category}

Thank you for bidding! You will be contacted shortly with shipping details.

Best regards,
The Auction Team
                """,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[buyer.email],
                fail_silently=False,
            )
            logger.info(f"✅ Email sent to buyer {buyer.email}")
        except Exception as e:
            logger.error(f"❌ Failed to send buyer email: {e}")

        # 2️⃣ Email to Seller
        try:
            send_mail(
                subject=f"✅ Your item {auction.item_name} has been sold!",
                message=f"""
Hi {seller.first_name or seller.username},

Great news! Your item {auction.item_name} has been sold.

Order ID: {order.id}
Buyer: {buyer.username}
Item: {auction.item_name}
Winning Price: ${auction.current_price}

The buyer will be contacted for shipping arrangements.

Best regards,
The Auction Team
                """,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[seller.email],
                fail_silently=False,
            )
            logger.info(f"✅ Email sent to seller {seller.email}")
        except Exception as e:
            logger.error(f"❌ Failed to send seller email: {e}")

        # 3️⃣ WebSocket Notifications
        try:
            from asgiref.sync import async_to_sync
            from channels.layers import get_channel_layer
            
            channel_layer = get_channel_layer()
            content = {
                "type": "order_created",
                "content": {
                    "order_id": order.id,
                    "auction_id": auction.id,
                    "item_name": auction.item_name,
                    "price": str(auction.current_price),
                    "buyer": buyer.username,
                    "seller": seller.username,
                }
            }

            # Notify buyer
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{buyer.id}",
                    content
                )
                logger.info(f"✅ WebSocket notification sent to buyer {buyer.id}")
            except Exception as e:
                logger.error(f"❌ Failed to send WebSocket to buyer: {e}")

            # Notify seller
            try:
                async_to_sync(channel_layer.group_send)(
                    f"user_{seller.id}",
                    content
                )
                logger.info(f"✅ WebSocket notification sent to seller {seller.id}")
            except Exception as e:
                logger.error(f"❌ Failed to send WebSocket to seller: {e}")

        except ImportError:
            logger.warning("⚠️ Channels not configured - skipping WebSocket notifications")
        except Exception as e:
            logger.error(f"❌ WebSocket notification error: {e}")

        logger.info(f"✅ Order notifications completed for order {order_id}")
        return {'success': True, 'order_id': order_id}

    except Exception as e:
        logger.error(f"❌ Error in send_order_notifications: {str(e)}")
        
        # Retry with exponential backoff
        try:
            self.retry(exc=e, countdown=60 * (2 ** self.request.retries))
        except self.MaxRetriesExceededError:
            logger.error(f"❌ Max retries exceeded for order {order_id}")
            return {'success': False, 'error': 'Max retries exceeded', 'order_id': order_id}
        
        return {'success': False, 'error': str(e)}


@shared_task
def send_payment_confirmation(payment_id):
    """
    Send payment confirmation email to user.
    
    Args:
        payment_id (int): Payment ID to process
    
    Returns:
        dict: Status of email sending
    """
    try:
        # ✅ FIXED: Import inside task to avoid circular imports
        from .models import Payment
        
        logger.info(f"📧 Sending payment confirmation for payment {payment_id}")
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            logger.error(f"❌ Payment {payment_id} not found")
            return {'success': False, 'error': 'Payment not found'}
        
        user = payment.user
        
        if payment.status != 'succeeded':
            logger.warning(f"⚠️ Skipping confirmation email - payment status: {payment.status}")
            return {'success': False, 'error': 'Payment not succeeded'}
        
        # Send confirmation email
        try:
            send_mail(
                subject='💳 Payment Confirmation',
                message=f"""
Hi {user.first_name or user.username},

Your payment has been successfully processed.

Payment Details:
- Payment ID: {payment.id}
- Amount: ${payment.amount} {payment.currency}
- Status: {payment.get_status_display()}
- Date: {payment.paid_at.strftime('%Y-%m-%d %H:%M:%S')}

If you did not make this payment, please contact support immediately.

Best regards,
The Auction Team Support
                """,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"✅ Payment confirmation email sent to {user.email}")
            return {'success': True, 'payment_id': payment_id}
        except Exception as e:
            logger.error(f"❌ Failed to send confirmation email: {e}")
            return {'success': False, 'error': str(e)}
    
    except Exception as e:
        logger.error(f"❌ Error in send_payment_confirmation: {str(e)}")
        return {'success': False, 'error': str(e)}


@shared_task
def send_payment_receipt(payment_id):
    """
    Send detailed payment receipt to user.
    
    Args:
        payment_id (int): Payment ID to process
    
    Returns:
        dict: Status of email sending
    """
    try:
        # ✅ FIXED: Import inside task to avoid circular imports
        from .models import Payment
        
        logger.info(f"📄 Generating receipt for payment {payment_id}")
        
        try:
            payment = Payment.objects.get(id=payment_id)
        except Payment.DoesNotExist:
            logger.error(f"❌ Payment {payment_id} not found")
            return {'success': False, 'error': 'Payment not found'}
        
        user = payment.user
        
        # Build receipt HTML
        receipt_message = f"""
Hi {user.first_name or user.username},

Please find your payment receipt below:

═══════════════════════════════════════════════════════════
                    PAYMENT RECEIPT
═══════════════════════════════════════════════════════════

Payment ID:              {payment.id}
Transaction ID:         {payment.stripe_payment_intent_id or 'N/A'}
Amount:                 ${payment.amount} {payment.currency}
Status:                 {payment.get_status_display()}

Paid On:                {payment.paid_at.strftime('%Y-%m-%d %H:%M:%S') if payment.paid_at else 'N/A'}
Description:           {payment.description or 'N/A'}

═══════════════════════════════════════════════════════════

This is an automated receipt. Please keep it for your records.

If you have any questions, please contact support.

Best regards,
The Auction Team
        """
        
        # Send receipt email
        try:
            send_mail(
                subject='📄 Payment Receipt',
                message=receipt_message,
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )
            logger.info(f"✅ Payment receipt sent to {user.email}")
            return {'success': True, 'payment_id': payment_id}
        except Exception as e:
            logger.error(f"❌ Failed to send receipt email: {e}")
            return {'success': False, 'error': str(e)}
    
    except Exception as e:
        logger.error(f"❌ Error in send_payment_receipt: {str(e)}")
        return {'success': False, 'error': str(e)}