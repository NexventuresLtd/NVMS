from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CurrencyViewSet, WalletViewSet, TransactionCategoryViewSet,
    TransactionTagViewSet, IncomeViewSet, ExpenseViewSet,
    SubscriptionViewSet, BudgetViewSet, SavingsGoalViewSet,
    TransactionHistoryViewSet, AnalyticsViewSet
)

router = DefaultRouter()
router.register(r'currencies', CurrencyViewSet, basename='currency')
router.register(r'wallets', WalletViewSet, basename='wallet')
router.register(r'categories', TransactionCategoryViewSet, basename='category')
router.register(r'tags', TransactionTagViewSet, basename='tag')
router.register(r'incomes', IncomeViewSet, basename='income')
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'subscriptions', SubscriptionViewSet, basename='subscription')
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'savings-goals', SavingsGoalViewSet, basename='savings-goal')
router.register(r'history', TransactionHistoryViewSet, basename='history')
router.register(r'analytics', AnalyticsViewSet, basename='analytics')

urlpatterns = [
    path('', include(router.urls)),
]
