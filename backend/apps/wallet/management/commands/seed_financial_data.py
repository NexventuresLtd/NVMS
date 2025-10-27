from django.core.management.base import BaseCommand
from apps.wallet.models import Currency, TransactionCategory


class Command(BaseCommand):
    help = 'Seed initial financial data (currencies and categories)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding initial financial data...')
        
        # Create currencies
        currencies = [
            {'code': 'USD', 'name': 'US Dollar', 'symbol': '$', 'exchange_rate_to_base': 1.0},
            {'code': 'RWF', 'name': 'Rwandan Franc', 'symbol': 'FRw', 'exchange_rate_to_base': 0.00078},
            {'code': 'EUR', 'name': 'Euro', 'symbol': '€', 'exchange_rate_to_base': 1.08},
            {'code': 'GBP', 'name': 'British Pound', 'symbol': '£', 'exchange_rate_to_base': 1.27},
        ]
        
        for curr_data in currencies:
            currency, created = Currency.objects.get_or_create(
                code=curr_data['code'],
                defaults=curr_data
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created currency: {currency}'))
        
        # Create income categories
        income_categories = [
            {'name': 'Project Income', 'type': 'income', 'color': '#10B981', 'icon': 'briefcase'},
            {'name': 'Consulting', 'type': 'income', 'color': '#3B82F6', 'icon': 'user-tie'},
            {'name': 'Maintenance', 'type': 'income', 'color': '#8B5CF6', 'icon': 'tools'},
            {'name': 'Training', 'type': 'income', 'color': '#F59E0B', 'icon': 'graduation-cap'},
            {'name': 'Support', 'type': 'income', 'color': '#EF4444', 'icon': 'headset'},
            {'name': 'Other Income', 'type': 'income', 'color': '#6B7280', 'icon': 'dollar-sign'},
        ]
        
        for cat_data in income_categories:
            category, created = TransactionCategory.objects.get_or_create(
                name=cat_data['name'],
                category_type=cat_data['type'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created income category: {category}'))
        
        # Create expense categories
        expense_categories = [
            # Main categories
            {'name': 'Salaries & Wages', 'type': 'expense', 'color': '#3B82F6', 'icon': 'users'},
            {'name': 'Office Expenses', 'type': 'expense', 'color': '#10B981', 'icon': 'building'},
            {'name': 'Marketing & Advertising', 'type': 'expense', 'color': '#F59E0B', 'icon': 'megaphone'},
            {'name': 'Software & Tools', 'type': 'expense', 'color': '#8B5CF6', 'icon': 'laptop'},
            {'name': 'Travel & Transportation', 'type': 'expense', 'color': '#EF4444', 'icon': 'plane'},
            {'name': 'Utilities', 'type': 'expense', 'color': '#6366F1', 'icon': 'zap'},
            {'name': 'Professional Services', 'type': 'expense', 'color': '#EC4899', 'icon': 'briefcase'},
            {'name': 'Equipment & Hardware', 'type': 'expense', 'color': '#14B8A6', 'icon': 'server'},
            {'name': 'Training & Development', 'type': 'expense', 'color': '#F97316', 'icon': 'book-open'},
            {'name': 'Other Expenses', 'type': 'expense', 'color': '#6B7280', 'icon': 'more-horizontal'},
        ]
        
        for cat_data in expense_categories:
            category, created = TransactionCategory.objects.get_or_create(
                name=cat_data['name'],
                category_type=cat_data['type'],
                defaults={
                    'color': cat_data['color'],
                    'icon': cat_data['icon']
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f'Created expense category: {category}'))
        
        # Create some subcategories
        subcategories = [
            # Office Expenses subcategories
            {'name': 'Rent', 'parent': 'Office Expenses', 'type': 'expense', 'color': '#10B981'},
            {'name': 'Internet', 'parent': 'Office Expenses', 'type': 'expense', 'color': '#10B981'},
            {'name': 'Office Supplies', 'parent': 'Office Expenses', 'type': 'expense', 'color': '#10B981'},
            
            # Software & Tools subcategories
            {'name': 'Hosting Services', 'parent': 'Software & Tools', 'type': 'expense', 'color': '#8B5CF6'},
            {'name': 'Development Tools', 'parent': 'Software & Tools', 'type': 'expense', 'color': '#8B5CF6'},
            {'name': 'Design Software', 'parent': 'Software & Tools', 'type': 'expense', 'color': '#8B5CF6'},
            
            # Utilities subcategories
            {'name': 'Electricity', 'parent': 'Utilities', 'type': 'expense', 'color': '#6366F1'},
            {'name': 'Water', 'parent': 'Utilities', 'type': 'expense', 'color': '#6366F1'},
            {'name': 'Phone', 'parent': 'Utilities', 'type': 'expense', 'color': '#6366F1'},
        ]
        
        for subcat_data in subcategories:
            parent_cat = TransactionCategory.objects.filter(
                name=subcat_data['parent']
            ).first()
            
            if parent_cat:
                category, created = TransactionCategory.objects.get_or_create(
                    name=subcat_data['name'],
                    parent=parent_cat,
                    category_type=subcat_data['type'],
                    defaults={
                        'color': subcat_data['color']
                    }
                )
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created subcategory: {category}'))
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded initial financial data!'))
