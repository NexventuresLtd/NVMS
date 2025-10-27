from django.contrib import admin
from .models import (
    Currency, Wallet, TransactionCategory, TransactionTag,
    Income, Expense, Subscription, Budget, SavingsGoal,
    TransactionHistory
)


@admin.register(Currency)
class CurrencyAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'symbol', 'exchange_rate_to_base', 'is_active', 'updated_at']
    list_filter = ['is_active']
    search_fields = ['code', 'name']
    ordering = ['code']


@admin.register(Wallet)
class WalletAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'wallet_type', 'balance', 'currency', 'is_active', 'created_at']
    list_filter = ['wallet_type', 'currency', 'is_active']
    search_fields = ['name', 'user__username', 'user__email']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(TransactionCategory)
class TransactionCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'parent', 'color', 'is_active', 'created_at']
    list_filter = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(TransactionTag)
class TransactionTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'description']
    ordering = ['name']


@admin.register(Income)
class IncomeAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'wallet', 'project', 'amount', 'category', 'date', 'is_recurring', 'created_at']
    list_filter = ['is_recurring', 'recurrence_type', 'category', 'wallet']
    search_fields = ['title', 'description', 'notes', 'user__username']
    ordering = ['-date', '-created_at']
    readonly_fields = ['created_at', 'updated_at', 'next_occurrence']
    date_hierarchy = 'date'
    filter_horizontal = ['tags']


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'wallet', 'project', 'amount', 'category', 'date', 'is_recurring', 'created_at']
    list_filter = ['is_recurring', 'recurrence_type', 'category', 'wallet']
    search_fields = ['title', 'description', 'notes', 'user__username']
    ordering = ['-date', '-created_at']
    readonly_fields = ['created_at', 'updated_at', 'next_occurrence']
    date_hierarchy = 'date'
    filter_horizontal = ['tags']


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'wallet', 'amount', 'billing_cycle', 'next_billing_date', 'status', 'created_at']
    list_filter = ['billing_cycle', 'status', 'category']
    search_fields = ['name', 'description', 'user__username']
    ordering = ['next_billing_date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'next_billing_date'


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'budget_type', 'amount', 'currency', 'start_date', 'end_date', 'is_active']
    list_filter = ['budget_type', 'is_active', 'currency']
    search_fields = ['name', 'description', 'user__username']
    ordering = ['-start_date']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'start_date'


@admin.register(SavingsGoal)
class SavingsGoalAdmin(admin.ModelAdmin):
    list_display = ['name', 'user', 'wallet', 'current_amount', 'target_amount', 'progress_percentage', 'status', 'target_date']
    list_filter = ['status', 'wallet']
    search_fields = ['name', 'description', 'user__username']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at', 'progress_percentage', 'remaining_amount', 'is_completed']


@admin.register(TransactionHistory)
class TransactionHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'entity_type', 'entity_id', 'description', 'timestamp']
    list_filter = ['action', 'entity_type']
    search_fields = ['description', 'user__username']
    ordering = ['-timestamp']
    readonly_fields = ['timestamp']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
