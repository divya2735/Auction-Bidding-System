# payments/webhook.py
import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.conf import settings

from .stripe_utils import StripePaymentHandler
from .webhook_handler import StripeWebhookHandler

logger = logging.getLogger(__name__)


@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Stripe Webhook Endpoint
    
    URL: POST /payments/webhook/stripe/
    
    Handles events:
    - payment_intent.succeeded
    - payment_intent.payment_failed
    - charge.dispute.created
    - charge.refunded
    - payment_method.attached
    - payment_method.detached
    """
    
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

    # Verify webhook signature
    result = StripePaymentHandler.verify_webhook_signature(payload, sig_header)
    
    if not result['success']:
        logger.error(f"❌ Webhook signature verification failed: {result['error']}")
        return JsonResponse({'error': result['error']}, status=400)

    event = result['event']
    event_type = event['type']
    
    logger.info(f"📨 Webhook received: {event_type}")

    # Route to appropriate handler
    handlers = {
        'payment_intent.succeeded': StripeWebhookHandler.handle_payment_intent_succeeded,
        'payment_intent.payment_failed': StripeWebhookHandler.handle_payment_intent_payment_failed,
        'charge.dispute.created': StripeWebhookHandler.handle_charge_dispute_created,
        'charge.refunded': StripeWebhookHandler.handle_charge_refunded,
        'payment_method.attached': StripeWebhookHandler.handle_payment_method_attached,
        'payment_method.detached': StripeWebhookHandler.handle_payment_method_detached,
    }

    handler = handlers.get(event_type)

    if handler:
        try:
            handler_result = handler(event)
            logger.info(f"✅ Event processed successfully: {event_type}")
            return JsonResponse({'success': True, 'event_id': event['id']}, status=200)
        except Exception as e:
            logger.error(f"❌ Error processing event {event_type}: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    else:
        # Event type not handled (but still return 200 to acknowledge)
        logger.info(f"⏭️  Event type not handled: {event_type}")
        return JsonResponse({'success': True, 'event_id': event['id']}, status=200)


# =====================================================
# WEBHOOK TESTING ENDPOINT (Development Only)
# =====================================================

@csrf_exempt
@require_http_methods(["POST"])
def test_webhook(request):
    """
    Test webhook locally without Stripe
    
    URL: POST /payments/webhook/test/
    
    Request body:
    {
        "event_type": "payment_intent.succeeded",
        "payment_intent_id": "pi_test_123"
    }
    """
    
    if not settings.DEBUG:
        return JsonResponse({'error': 'Testing endpoint only available in DEBUG mode'}, status=403)

    try:
        data = json.loads(request.body)
        event_type = data.get('event_type')
        payment_intent_id = data.get('payment_intent_id', 'pi_test_123')

        # Create mock event
        mock_event = {
            'type': event_type,
            'id': 'evt_test_123',
            'data': {
                'object': {
                    'id': payment_intent_id,
                    'charges': {
                        'data': [{'id': 'ch_test_123'}]
                    },
                    'last_payment_error': {
                        'message': 'Test error message'
                    }
                }
            }
        }

        # Route to handler
        handlers = {
            'payment_intent.succeeded': StripeWebhookHandler.handle_payment_intent_succeeded,
            'payment_intent.payment_failed': StripeWebhookHandler.handle_payment_intent_payment_failed,
            'charge.dispute.created': StripeWebhookHandler.handle_charge_dispute_created,
            'charge.refunded': StripeWebhookHandler.handle_charge_refunded,
        }

        handler = handlers.get(event_type)
        if handler:
            result = handler(mock_event)
            return JsonResponse({
                'success': True,
                'event_type': event_type,
                'handler_result': result
            }, status=200)
        else:
            return JsonResponse({
                'error': f'Unknown event type: {event_type}'
            }, status=400)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Test webhook error: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)