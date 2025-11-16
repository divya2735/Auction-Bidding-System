# payments/stripe_utils.py
"""
Utility class for all Stripe API operations.
Handles PaymentIntent, SetupIntent, and payment method management.
"""
import stripe
from django.conf import settings
from decimal import Decimal
import logging

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class StripePaymentHandler:
    """Utility class to handle all Stripe operations"""

    @staticmethod
    def create_payment_intent(amount, user, description=None, metadata=None):
        """
        Create a Stripe PaymentIntent for a payment.
        
        Args:
            amount (Decimal): Amount in the smallest currency unit (cents for USD)
            user: Django user object
            description (str): Payment description
            metadata (dict): Additional metadata
        
        Returns:
            dict: Payment intent details or error
        """
        try:
            # Convert amount to cents (int)
            amount_cents = int(amount * 100)
            
            # Validate amount
            if amount_cents <= 0:
                raise ValueError("Amount must be positive")
            
            # Create PaymentIntent without customer association
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',
                description=description or f"Payment for user {user.email}",
                metadata=metadata or {'user_id': user.id, 'user_email': user.email},
                automatic_payment_methods={
                    'enabled': True,
                },
            )
            
            logger.info(f"✅ PaymentIntent created: {intent.id} for user {user.email}")
            return {
                'success': True,
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'status': intent.status,
            }
        except stripe.error.CardError as e:
            logger.error(f"❌ Card error: {e.user_message}")
            return {'success': False, 'error': e.user_message}
        except stripe.error.RateLimitError as e:
            logger.error(f"❌ Rate limit error: {e}")
            return {'success': False, 'error': 'Rate limit exceeded. Try again later.'}
        except stripe.error.InvalidRequestError as e:
            logger.error(f"❌ Invalid request: {e}")
            return {'success': False, 'error': str(e)}
        except stripe.error.AuthenticationError as e:
            logger.error(f"❌ Authentication error: {e}")
            return {'success': False, 'error': 'Payment service error.'}
        except stripe.error.APIConnectionError as e:
            logger.error(f"❌ API connection error: {e}")
            return {'success': False, 'error': 'Connection error. Try again.'}
        except ValueError as e:
            logger.error(f"❌ Validation error: {str(e)}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"❌ Unexpected error: {str(e)}")
            return {'success': False, 'error': 'An unexpected error occurred.'}

    @staticmethod
    def retrieve_payment_intent(payment_intent_id):
        """
        Retrieve a PaymentIntent from Stripe.
        
        Args:
            payment_intent_id (str): Stripe PaymentIntent ID
        
        Returns:
            dict: PaymentIntent details or error
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                'success': True,
                'intent': intent,
            }
        except stripe.error.InvalidRequestError as e:
            logger.error(f"❌ PaymentIntent not found: {e}")
            return {'success': False, 'error': 'Payment intent not found.'}
        except Exception as e:
            logger.error(f"❌ Error retrieving PaymentIntent: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def confirm_payment_intent(payment_intent_id):
        """
        Confirm a PaymentIntent (legacy, mostly handled by webhook).
        
        Args:
            payment_intent_id (str): Stripe PaymentIntent ID
        
        Returns:
            dict: Confirmation status or error
        """
        try:
            intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return {
                'success': True,
                'status': intent.status,
                'intent': intent,
            }
        except stripe.error.CardError as e:
            logger.error(f"❌ Card error during confirmation: {e.user_message}")
            return {'success': False, 'error': e.user_message, 'status': 'requires_action'}
        except Exception as e:
            logger.error(f"❌ Error confirming PaymentIntent: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def create_setup_intent(user):
        """
        Create SetupIntent for saving card for future use.
        
        Args:
            user: Django user object
        
        Returns:
            dict: SetupIntent details or error
        """
        try:
            setup_intent = stripe.SetupIntent.create(
                usage='on_session',
            )
            return {
                'success': True,
                'client_secret': setup_intent.client_secret,
                'setup_intent_id': setup_intent.id,
            }
        except Exception as e:
            logger.error(f"❌ SetupIntent creation error: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def save_payment_method(payment_method_id, user):
        """
        Save a payment method for future use.
        Retrieves card details from Stripe.
        
        Args:
            payment_method_id (str): Stripe PaymentMethod ID
            user: Django user object
        
        Returns:
            dict: Payment method details or error
        """
        try:
            # Retrieve the payment method from Stripe
            pm = stripe.PaymentMethod.retrieve(payment_method_id)
            
            if not pm.card:
                return {'success': False, 'error': 'Invalid payment method'}
            
            card = pm.card
            brand = card.brand.lower()
            last_four = card.last4
            exp_month = card.exp_month
            exp_year = card.exp_year
            
            return {
                'success': True,
                'payment_method_id': payment_method_id,
                'brand': brand,
                'last_four': last_four,
                'exp_month': exp_month,
                'exp_year': exp_year,
            }
        except Exception as e:
            logger.error(f"❌ Payment method save error: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def delete_payment_method(payment_method_id):
        """
        Delete a payment method (detach from customer).
        
        Args:
            payment_method_id (str): Stripe PaymentMethod ID
        
        Returns:
            dict: Success or error
        """
        try:
            stripe.PaymentMethod.detach(payment_method_id)
            logger.info(f"✅ Payment method deleted: {payment_method_id}")
            return {'success': True}
        except stripe.error.InvalidRequestError as e:
            logger.error(f"❌ Payment method not found: {e}")
            return {'success': False, 'error': 'Payment method not found.'}
        except Exception as e:
            logger.error(f"❌ Error deleting payment method: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def refund_payment(charge_id, amount=None):
        """
        Refund a charge (full or partial).
        
        Args:
            charge_id (str): Stripe Charge ID
            amount (Decimal): Amount to refund (optional for partial refund)
        
        Returns:
            dict: Refund details or error
        """
        try:
            refund_params = {'charge': charge_id}
            if amount:
                refund_params['amount'] = int(amount * 100)  # Convert to cents
            
            refund = stripe.Refund.create(**refund_params)
            logger.info(f"✅ Refund created: {refund.id}")
            return {
                'success': True,
                'refund_id': refund.id,
                'status': refund.status,
            }
        except stripe.error.InvalidRequestError as e:
            logger.error(f"❌ Refund error: {e}")
            return {'success': False, 'error': str(e)}
        except Exception as e:
            logger.error(f"❌ Error creating refund: {e}")
            return {'success': False, 'error': str(e)}

    @staticmethod
    def verify_webhook_signature(payload, sig_header):
        """
        Verify Stripe webhook signature for security.
        
        Args:
            payload (bytes): Raw request body
            sig_header (str): Stripe-Signature header value
        
        Returns:
            dict: Verified event or error
        """
        try:
            event = stripe.Webhook.construct_event(
                payload,
                sig_header,
                settings.STRIPE_WEBHOOK_SECRET
            )
            return {'success': True, 'event': event}
        except ValueError as e:
            logger.error(f"❌ Invalid payload: {e}")
            return {'success': False, 'error': 'Invalid payload'}
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"❌ Invalid signature: {e}")
            return {'success': False, 'error': 'Invalid signature'}
        except Exception as e:
            logger.error(f"❌ Error verifying webhook: {e}")
            return {'success': False, 'error': str(e)}