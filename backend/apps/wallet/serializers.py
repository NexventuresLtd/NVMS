from rest_framework import serializers
from django.contrib.auth.models import User, Group
from .models import (
    Currency, Wallet, TransactionCategory, TransactionTag,
    Income, Expense, Subscription, Budget, SavingsGoal,
    TransactionHistory
)
from apps.projects.serializers import ProjectListSerializer

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    # permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        # fields = ['id', 'username', 'first_name', 'last_name', 'email', 'groups', 'permissions']
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'groups']

    # def get_permissions(self, obj):
    #     # Returns a list of permission strings like "app_label.codename"
    #     return list(obj.get_all_permissions())



class CurrencySerializer(serializers.ModelSerializer):
    class Meta:
        model = Currency
        fields = '__all__'


# Lightweight wallet serializer for reference data (no expensive computations)
class WalletReferenceSerializer(serializers.ModelSerializer):
    """Lightweight wallet serializer for dropdowns and reference data"""
    currency_code = serializers.CharField(source='currency.code', read_only=True)
    currency_symbol = serializers.CharField(source='currency.symbol', read_only=True)
    wallet_type_display = serializers.CharField(source='get_wallet_type_display', read_only=True)
    
    class Meta:
        model = Wallet
        fields = ['id', 'name', 'wallet_type', 'wallet_type_display', 'currency', 
                  'currency_code', 'currency_symbol', 'balance', 'balance_rwf', 'is_active']
        read_only_fields = ['balance', 'balance_rwf']


class WalletSerializer(serializers.ModelSerializer):
    currency_details = CurrencySerializer(source='currency', read_only=True)
    wallet_type_display = serializers.CharField(source='get_wallet_type_display', read_only=True)
    
    # Removed expensive SerializerMethodFields that query all incomes/expenses
    # These should be computed at the view level when needed, not on every serialization
    
    class Meta:
        model = Wallet
        fields = '__all__'
        read_only_fields = ['balance', 'balance_rwf', 'created_at', 'updated_at']


class TransactionCategorySerializer(serializers.ModelSerializer):
    parent_details = serializers.SerializerMethodField()
    # Removed recursive subcategories - causes exponential queries
    # Return only IDs if needed or fetch separately
    subcategory_ids = serializers.SerializerMethodField()
    full_path = serializers.ReadOnlyField()
    category_type_display = serializers.CharField(source='get_category_type_display', read_only=True)
    
    class Meta:
        model = TransactionCategory
        fields = '__all__'

    def get_parent_details(self, obj):
        if obj.parent:
            return {
                'id': obj.parent.id,
                'name': obj.parent.name,
                'color': obj.parent.color
            }
        return None

    def get_subcategory_ids(self, obj):
        """Return only IDs to avoid recursive serialization"""
        return list(obj.subcategories.filter(is_active=True).values_list('id', flat=True))


class TransactionTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionTag
        fields = '__all__'


# Lightweight serializers for list views
class IncomeListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for income list - only IDs for foreign keys"""
    recurrence_type_display = serializers.CharField(source='get_recurrence_type_display', read_only=True)
    
    class Meta:
        model = Income
        fields = [
            'id', 'title', 'amount', 'amount_rwf', 'amount_original', 
            'date', 'description', 'is_recurring', 'recurrence_type', 'recurrence_type_display',
            'wallet', 'project', 'category', 'currency_original', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'amount', 'amount_rwf']


class IncomeSerializer(serializers.ModelSerializer):
    wallet_details = WalletSerializer(source='wallet', read_only=True)
    project_details = ProjectListSerializer(source='project', read_only=True)
    category_details = TransactionCategorySerializer(source='category', read_only=True)
    tags_details = TransactionTagSerializer(source='tags', many=True, read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    currency_original_details = CurrencySerializer(source='currency_original', read_only=True)
    recurrence_type_display = serializers.CharField(source='get_recurrence_type_display', read_only=True)
    
    class Meta:
        model = Income
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'next_occurrence', 'amount', 'amount_rwf']

    def validate(self, data):
        # Validate recurrence settings
        if data.get('is_recurring') and data.get('recurrence_type') == 'none':
            raise serializers.ValidationError("Recurrence type must be set when is_recurring is True")
        
        # Validate category type
        if data.get('category') and data['category'].category_type not in ['income', 'both']:
            raise serializers.ValidationError("Selected category is not valid for income")
        
        return data


# Lightweight serializer for expense list
class ExpenseListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for expense list - only IDs for foreign keys"""
    recurrence_type_display = serializers.CharField(source='get_recurrence_type_display', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id', 'title', 'amount', 'amount_rwf', 'amount_original',
            'date', 'description', 'is_recurring', 'recurrence_type', 'recurrence_type_display',
            'wallet', 'project', 'category', 'currency_original', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'amount', 'amount_rwf']


class ExpenseSerializer(serializers.ModelSerializer):
    wallet_details = WalletSerializer(source='wallet', read_only=True)
    project_details = ProjectListSerializer(source='project', read_only=True)
    category_details = TransactionCategorySerializer(source='category', read_only=True)
    tags_details = TransactionTagSerializer(source='tags', many=True, read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    created_by_details = UserSerializer(source='created_by', read_only=True)
    currency_original_details = CurrencySerializer(source='currency_original', read_only=True)
    recurrence_type_display = serializers.CharField(source='get_recurrence_type_display', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'next_occurrence', 'amount', 'amount_rwf']

    def validate(self, data):
        # Validate recurrence settings
        if data.get('is_recurring') and data.get('recurrence_type') == 'none':
            raise serializers.ValidationError("Recurrence type must be set when is_recurring is True")
        
        # Validate category type
        if data.get('category') and data['category'].category_type not in ['expense', 'both']:
            raise serializers.ValidationError("Selected category is not valid for expense")
        
        # Validate wallet balance
        wallet = data.get('wallet')
        amount = data.get('amount')
        if wallet and amount and wallet.balance < amount:
            raise serializers.ValidationError(f"Insufficient balance in {wallet.name}")
        
        return data


# Lightweight serializer for subscription list
class SubscriptionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for subscription list - only IDs for foreign keys"""
    billing_cycle_display = serializers.CharField(source='get_billing_cycle_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_until_renewal = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = [
            'id', 'name', 'amount', 'amount_rwf', 'amount_original',
            'billing_cycle', 'billing_cycle_display', 'status', 'status_display',
            'start_date', 'next_billing_date', 'end_date', 'days_until_renewal',
            'wallet', 'category', 'currency_original',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'amount', 'amount_rwf']


class SubscriptionSerializer(serializers.ModelSerializer):
    wallet_details = WalletSerializer(source='wallet', read_only=True)
    category_details = TransactionCategorySerializer(source='category', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    currency_original_details = CurrencySerializer(source='currency_original', read_only=True)
    billing_cycle_display = serializers.CharField(source='get_billing_cycle_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Computed fields
    days_until_renewal = serializers.ReadOnlyField()
    should_notify = serializers.ReadOnlyField()
    
    class Meta:
        model = Subscription
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'amount', 'amount_rwf']


class BudgetSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    project_details = ProjectListSerializer(source='project', read_only=True)
    category_details = TransactionCategorySerializer(source='category', read_only=True)
    currency_details = CurrencySerializer(source='currency', read_only=True)
    budget_type_display = serializers.CharField(source='get_budget_type_display', read_only=True)
    
    # Computed fields
    spent_amount = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    usage_percentage = serializers.ReadOnlyField()
    is_exceeded = serializers.ReadOnlyField()
    should_alert = serializers.ReadOnlyField()
    
    class Meta:
        model = Budget
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        # Validate budget type requirements
        budget_type = data.get('budget_type')
        if budget_type == 'project' and not data.get('project'):
            raise serializers.ValidationError("Project is required for project budget")
        if budget_type == 'category' and not data.get('category'):
            raise serializers.ValidationError("Category is required for category budget")
        
        # Validate date range
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] >= data['end_date']:
                raise serializers.ValidationError("End date must be after start date")
        
        return data


class SavingsGoalSerializer(serializers.ModelSerializer):
    wallet_details = WalletSerializer(source='wallet', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # Computed fields
    progress_percentage = serializers.ReadOnlyField()
    remaining_amount = serializers.ReadOnlyField()
    is_completed = serializers.ReadOnlyField()
    
    class Meta:
        model = SavingsGoal
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']

    def validate(self, data):
        # Validate current amount doesn't exceed target
        current_amount = data.get('current_amount', 0)
        target_amount = data.get('target_amount')
        
        if target_amount and current_amount > target_amount:
            raise serializers.ValidationError("Current amount cannot exceed target amount")
        
        return data


class TransactionHistorySerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    action_display = serializers.CharField(source='get_action_display', read_only=True)
    entity_type_display = serializers.CharField(source='get_entity_type_display', read_only=True)
    
    class Meta:
        model = TransactionHistory
        fields = '__all__'
        read_only_fields = ['timestamp']


# Analytics Serializers
class WalletSummarySerializer(serializers.Serializer):
    """Summary statistics for a wallet"""
    wallet_id = serializers.IntegerField()
    wallet_name = serializers.CharField()
    balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_flow = serializers.DecimalField(max_digits=15, decimal_places=2)
    currency_code = serializers.CharField()


class MonthlyReportSerializer(serializers.Serializer):
    """Monthly financial report"""
    month = serializers.CharField()
    year = serializers.IntegerField()
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_savings = serializers.DecimalField(max_digits=15, decimal_places=2)
    income_by_category = serializers.DictField()
    expense_by_category = serializers.DictField()
    top_expenses = serializers.ListField()


class ProjectProfitabilitySerializer(serializers.Serializer):
    """Project profitability analysis"""
    project_id = serializers.IntegerField()
    project_name = serializers.CharField()
    total_income = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit = serializers.DecimalField(max_digits=15, decimal_places=2)
    profit_margin = serializers.DecimalField(max_digits=5, decimal_places=2)


class CashFlowSerializer(serializers.Serializer):
    """Cash flow over time"""
    date = serializers.DateField()
    income = serializers.DecimalField(max_digits=15, decimal_places=2)
    expense = serializers.DecimalField(max_digits=15, decimal_places=2)
    net_flow = serializers.DecimalField(max_digits=15, decimal_places=2)
    cumulative_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
