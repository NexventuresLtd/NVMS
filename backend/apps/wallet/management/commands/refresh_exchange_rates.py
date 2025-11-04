"""
Management command to refresh exchange rates from live API
Usage: python manage.py refresh_exchange_rates
"""
from django.core.management.base import BaseCommand
from apps.wallet.services import exchange_rate_service


class Command(BaseCommand):
    help = 'Refresh exchange rates from live API and update Currency model'

    def handle(self, *args, **options):
        self.stdout.write('Fetching live exchange rates...')
        
        try:
            updated_count = exchange_rate_service.refresh_currency_rates()
            
            if updated_count is not None:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Successfully updated {updated_count} currency exchange rates'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR('Failed to fetch exchange rates from API')
                )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error refreshing exchange rates: {str(e)}')
            )
