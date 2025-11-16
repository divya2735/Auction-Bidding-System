# payments/signals.py
"""
Django signals for order notifications.
Triggers async task when a new order is created.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender='orders.Order')
def trigger_order_notifications(sender, instance, created, **kwargs):
    """
    Signal handler for when a new Order is created.
    Sends email and WebSocket notifications to buyer and seller.
    
    Args:
        sender: The Order model class
        instance: The Order instance that was saved
        created: Boolean indicating if this is a new object
        **kwargs: Additional keyword arguments
    """
    if created:
        try:
            from .tasks import send_order_notifications
            
            logger.info(f"Triggering order notifications for order {instance.id}")
            send_order_notifications.delay(instance.id)
        except Exception as e:
            logger.error(f"Failed to trigger order notifications: {e}")
            # Don't fail the order creation if notification fails
            pass