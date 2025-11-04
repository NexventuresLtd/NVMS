"""
Exchange rate service for fetching and caching live currency exchange rates
"""
import requests
from django.core.cache import cache
from django.conf import settings
from decimal import Decimal
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

# Default cache duration: 1 hour (3600 seconds)
EXCHANGE_RATE_CACHE_DURATION = getattr(settings, 'EXCHANGE_RATE_CACHE_DURATION', 3600)

# Use exchangerate-api.com with API key
EXCHANGE_RATE_API_KEY = getattr(settings, 'EXCHANGE_RATE_API_KEY', '589d2e78ed29b70fe39b0e88')
EXCHANGE_RATE_API_URL = f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_API_KEY}"


class ExchangeRateService:
    """Service for fetching and caching exchange rates"""
    
    def __init__(self, base_currency: str = 'USD'):
        self.base_currency = base_currency
    
    def get_cache_key(self, from_currency: str, to_currency: str) -> str:
        """Generate cache key for exchange rate"""
        return f"exchange_rate:{from_currency}:{to_currency}"
    
    def fetch_live_rates(self, base: str = None) -> Optional[Dict[str, Decimal]]:
        """
        Fetch live exchange rates from API
        Returns a dict of currency_code -> exchange_rate
        """
        if base is None:
            base = self.base_currency
        
        try:
            # Using exchangerate-api.com with API key
            url = f"{EXCHANGE_RATE_API_URL}/latest/{base}"
            
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('result') == 'success' and 'conversion_rates' in data:
                rates = data['conversion_rates']
                # Convert to Decimal for precision
                return {
                    currency: Decimal(str(rate))
                    for currency, rate in rates.items()
                }
            else:
                logger.error(f"Invalid response from exchange rate API: {data}")
                return None
                
        except requests.RequestException as e:
            logger.error(f"Failed to fetch exchange rates: {e}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error fetching exchange rates: {e}")
            return None
    
    def get_exchange_rate(self, from_currency: str, to_currency: str) -> Optional[Decimal]:
        """
        Get exchange rate from from_currency to to_currency
        Uses cache first, falls back to API
        """
        # Same currency, rate is 1
        if from_currency == to_currency:
            return Decimal('1.0')
        
        # Check cache first
        cache_key = self.get_cache_key(from_currency, to_currency)
        cached_rate = cache.get(cache_key)
        
        if cached_rate is not None:
            logger.debug(f"Using cached exchange rate: {from_currency} -> {to_currency} = {cached_rate}")
            return Decimal(str(cached_rate))
        
        # Fetch from API using pair endpoint (more efficient)
        logger.info(f"Fetching live exchange rate: {from_currency} -> {to_currency}")
        
        try:
            # Use pair endpoint for direct conversion
            url = f"{EXCHANGE_RATE_API_URL}/pair/{from_currency}/{to_currency}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('result') == 'success' and 'conversion_rate' in data:
                rate = Decimal(str(data['conversion_rate']))
                
                # Cache the rate
                cache.set(cache_key, str(rate), EXCHANGE_RATE_CACHE_DURATION)
                logger.info(f"Cached exchange rate: {from_currency} -> {to_currency} = {rate}")
                return rate
            else:
                logger.error(f"Invalid response from pair endpoint: {data}")
        except Exception as e:
            logger.error(f"Error fetching from pair endpoint: {e}")
        
        # Fallback: Get rates with from_currency as base
        rates = self.fetch_live_rates(base=from_currency)
        
        if rates and to_currency in rates:
            rate = rates[to_currency]
            
            # Cache the rate
            cache.set(cache_key, str(rate), EXCHANGE_RATE_CACHE_DURATION)
            
            # Also cache all other rates we got (to reduce API calls)
            for currency, currency_rate in rates.items():
                if currency != from_currency:
                    other_cache_key = self.get_cache_key(from_currency, currency)
                    cache.set(other_cache_key, str(currency_rate), EXCHANGE_RATE_CACHE_DURATION)
            
            logger.info(f"Cached exchange rate: {from_currency} -> {to_currency} = {rate}")
            return rate
        
        logger.warning(f"Could not get exchange rate for {from_currency} -> {to_currency}")
        return None
    
    def get_all_rates(self, base: str = None) -> Dict[str, Decimal]:
        """
        Get all exchange rates for a base currency
        """
        if base is None:
            base = self.base_currency
        
        # Check cache for bulk rates
        cache_key = f"exchange_rates_bulk:{base}"
        cached_rates = cache.get(cache_key)
        
        if cached_rates is not None:
            logger.debug(f"Using cached bulk exchange rates for base {base}")
            return {
                currency: Decimal(str(rate))
                for currency, rate in cached_rates.items()
            }
        
        # Fetch from API
        rates = self.fetch_live_rates(base=base)
        
        if rates:
            # Cache bulk rates
            cache.set(cache_key, {k: str(v) for k, v in rates.items()}, EXCHANGE_RATE_CACHE_DURATION)
            logger.info(f"Cached bulk exchange rates for base {base}")
            return rates
        
        return {}
    
    def convert_amount(
        self,
        amount: Decimal,
        from_currency: str,
        to_currency: str
    ) -> Optional[Decimal]:
        """
        Convert an amount from one currency to another
        Uses API's pair endpoint with amount for direct conversion
        """
        if from_currency == to_currency:
            return amount.quantize(Decimal('0.01'))
        
        # Check if we can use cached rate
        cache_key = self.get_cache_key(from_currency, to_currency)
        cached_rate = cache.get(cache_key)
        
        if cached_rate is not None:
            converted = amount * Decimal(str(cached_rate))
            return converted.quantize(Decimal('0.01'))
        
        # Use API's pair endpoint with amount for accurate conversion
        try:
            url = f"{EXCHANGE_RATE_API_URL}/pair/{from_currency}/{to_currency}/{amount}"
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('result') == 'success':
                # Cache the rate for future use
                if 'conversion_rate' in data:
                    rate = Decimal(str(data['conversion_rate']))
                    cache.set(cache_key, str(rate), EXCHANGE_RATE_CACHE_DURATION)
                
                # Return the converted result
                if 'conversion_result' in data:
                    return Decimal(str(data['conversion_result'])).quantize(Decimal('0.01'))
        except Exception as e:
            logger.error(f"Error in direct conversion API call: {e}")
        
        # Fallback: Use get_exchange_rate method
        rate = self.get_exchange_rate(from_currency, to_currency)
        
        if rate is None:
            return None
        
        converted = amount * rate
        return converted.quantize(Decimal('0.01'))  # Round to 2 decimal places
    
    def refresh_currency_rates(self):
        """
        Refresh exchange rates for all currencies in the database
        This can be called periodically (e.g., via cron job)
        """
        from .models import Currency
        
        base_currency = Currency.objects.filter(is_default=True).first()
        if not base_currency:
            logger.warning("No default base currency found")
            return
        
        # Fetch all rates with base currency
        rates = self.get_all_rates(base=base_currency.code)
        
        if not rates:
            logger.error("Failed to fetch exchange rates for refresh")
            return
        
        updated_count = 0
        for currency in Currency.objects.filter(is_active=True):
            if currency.code == base_currency.code:
                # Base currency always has rate of 1
                if currency.exchange_rate_to_base != Decimal('1.0'):
                    currency.exchange_rate_to_base = Decimal('1.0')
                    currency.save()
                    updated_count += 1
            elif currency.code in rates:
                new_rate = rates[currency.code]
                if currency.exchange_rate_to_base != new_rate:
                    currency.exchange_rate_to_base = new_rate
                    currency.save()
                    updated_count += 1
                    logger.info(f"Updated {currency.code} rate to {new_rate}")
        
        logger.info(f"Refreshed exchange rates: {updated_count} currencies updated")
        return updated_count


# Global instance
exchange_rate_service = ExchangeRateService()
