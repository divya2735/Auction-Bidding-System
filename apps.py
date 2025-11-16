# payments/apps.py
from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'payments'

    def ready(self):
        """
        Import signals when Django app is ready.
        Signals connect Order model to order notification tasks.
        """
        try:
            import payments.signals  # noqa: F401
        except ImportError as e:
            print(f"Warning: Failed to import payments signals: {e}")