from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db.models import Sum, Q, F
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from django_filters.rest_framework import DjangoFilterBackend
import json
from django.core.serializers.json import DjangoJSONEncoder

from .models import (
    Currency, Wallet, TransactionCategory, TransactionTag,
    Income, Expense, Subscription, Budget, SavingsGoal,
    TransactionHistory
)
from .serializers import (
    CurrencySerializer, WalletSerializer, TransactionCategorySerializer,
    TransactionTagSerializer, IncomeSerializer, IncomeListSerializer,
    ExpenseSerializer, ExpenseListSerializer, SubscriptionSerializer,
    SubscriptionListSerializer, BudgetSerializer, SavingsGoalSerializer,
    TransactionHistorySerializer, WalletSummarySerializer,
    MonthlyReportSerializer, ProjectProfitabilitySerializer,
    CashFlowSerializer
)


class ReferenceDataView(APIView):
    """
    Single endpoint to fetch all reference data (wallets, currencies, categories, etc.)
    This reduces the number of API calls needed when loading forms
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get all reference data in one request"""
        wallets = Wallet.objects.filter(is_active=True).select_related('currency')
        currencies = Currency.objects.filter(is_active=True)
        categories = TransactionCategory.objects.filter(is_active=True).select_related('parent')
        tags = TransactionTag.objects.filter(is_active=True)
        
        return Response({
            'wallets': WalletSerializer(wallets, many=True).data,
            'currencies': CurrencySerializer(currencies, many=True).data,
            'categories': TransactionCategorySerializer(categories, many=True).data,
            'tags': TransactionTagSerializer(tags, many=True).data,
        })


class CurrencyViewSet(viewsets.ModelViewSet):
    """Currency management"""
    queryset = Currency.objects.filter(is_active=True)
    serializer_class = CurrencySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name']
    ordering_fields = ['code', 'name']
    
    @action(detail=False, methods=['post'])
    def refresh_rates(self, request):
        """Refresh exchange rates from live API"""
        from .services import exchange_rate_service
        
        try:
            updated_count = exchange_rate_service.refresh_currency_rates()
            return Response({
                'message': f'Successfully refreshed exchange rates for {updated_count} currencies',
                'updated_count': updated_count
            })
        except Exception as e:
            return Response({
                'error': f'Failed to refresh exchange rates: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def live_rate(self, request):
        """Get live exchange rate between two currencies"""
        from .services import exchange_rate_service
        
        from_currency = request.query_params.get('from')
        to_currency = request.query_params.get('to')
        amount = request.query_params.get('amount', '1')
        
        if not from_currency or not to_currency:
            return Response({
                'error': 'Both from and to currency parameters are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            amount_decimal = Decimal(amount)
            rate = exchange_rate_service.get_exchange_rate(from_currency, to_currency)
            
            if rate is None:
                return Response({
                    'error': f'Could not get exchange rate for {from_currency} -> {to_currency}'
                }, status=status.HTTP_404_NOT_FOUND)
            
            converted = exchange_rate_service.convert_amount(amount_decimal, from_currency, to_currency)
            
            return Response({
                'from_currency': from_currency,
                'to_currency': to_currency,
                'exchange_rate': str(rate),
                'amount': str(amount_decimal),
                'converted_amount': str(converted),
                'cached': True  # Indicates this might be from cache
            })
        except Exception as e:
            return Response({
                'error': f'Error getting exchange rate: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class WalletViewSet(viewsets.ModelViewSet):
    """Wallet/Account management"""
    serializer_class = WalletSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['wallet_type', 'currency', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'balance', 'created_at']

    def get_queryset(self):
        return Wallet.objects.all()

    def perform_update(self, serializer):
        old_data = WalletSerializer(self.get_object()).data
        serializer.save()
        
        # Log update
        wallet: Wallet = serializer.instance
        if (wallet.initial_balance != Decimal(old_data['initial_balance'])):
            # Adjust balance based on change in initial balance
            difference = wallet.initial_balance - Decimal(old_data['initial_balance'])
            operation = 'add' if difference > 0 else 'subtract'
            wallet.update_balance(abs(difference), operation)

        TransactionHistory.objects.create(
            user=self.request.user,
            action='update',
            entity_type='wallet',
            entity_id=wallet.id,
            description=f"Updated wallet: {wallet.name}",
            old_data=json.loads(json.dumps(old_data, cls=DjangoJSONEncoder)),
            new_data=json.loads(json.dumps(serializer.data, cls=DjangoJSONEncoder))
        )

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        """Transfer funds between wallets"""
        source_wallet = self.get_object()
        target_wallet_id = request.data.get('target_wallet_id')
        amount = Decimal(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response(
                {'error': 'Amount must be positive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            target_wallet = Wallet.objects.get(id=target_wallet_id)
        except Wallet.DoesNotExist:
            return Response(
                {'error': 'Target wallet not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if source_wallet.balance < amount:
            return Response(
                {'error': 'Insufficient balance'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Perform transfer
        source_wallet.update_balance(amount, 'subtract')
        target_wallet.update_balance(amount, 'add')
        
        # Log transfer
        TransactionHistory.objects.create(
            user=request.user,
            action='transfer',
            entity_type='wallet',
            entity_id=source_wallet.id,
            description=f"Transferred {amount} from {source_wallet.name} to {target_wallet.name}",
            new_data={
                'source_wallet': source_wallet.id,
                'target_wallet': target_wallet.id,
                'amount': str(amount)
            }
        )
        
        return Response({
            'message': 'Transfer successful',
            'source_balance': source_wallet.balance,
            'target_balance': target_wallet.balance
        })

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of all wallets (totals in RWF)"""
        wallets = self.get_queryset()
        summaries = []
        
        for wallet in wallets:
            total_income = wallet.incomes.aggregate(total=Sum('amount_rwf'))['total'] or 0
            total_expense = wallet.expenses.aggregate(total=Sum('amount_rwf'))['total'] or 0
            
            summaries.append({
                'wallet_id': wallet.id,
                'wallet_name': wallet.name,
                'balance': wallet.balance,
                'balance_rwf': wallet.balance_rwf,
                'total_income': total_income,
                'total_expense': total_expense,
                'net_flow': total_income - total_expense,
                'currency_code': wallet.currency.code,
                'base_currency': 'RWF'
            })
        
        serializer = WalletSummarySerializer(summaries, many=True)
        return Response(serializer.data)


class TransactionCategoryViewSet(viewsets.ModelViewSet):
    """Transaction category management"""
    queryset = TransactionCategory.objects.filter(is_active=True)
    serializer_class = TransactionCategorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category_type', 'parent']
    search_fields = ['name', 'description']

    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Get category tree structure"""
        root_categories = TransactionCategory.objects.filter(
            parent__isnull=True,
            is_active=True
        )
        serializer = self.get_serializer(root_categories, many=True)
        return Response(serializer.data)


class TransactionTagViewSet(viewsets.ModelViewSet):
    """Transaction tag management"""
    queryset = TransactionTag.objects.filter(is_active=True)
    serializer_class = TransactionTagSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class IncomeViewSet(viewsets.ModelViewSet):
    """Income transaction management"""
    serializer_class = IncomeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['wallet', 'project', 'category', 'is_recurring', 'recurrence_type']
    search_fields = ['title', 'description', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']

    def get_serializer_class(self):
        """Use lightweight serializer for list, full serializer for detail"""
        if self.action == 'list':
            return IncomeListSerializer
        return IncomeSerializer

    def get_queryset(self):
        queryset = Income.objects.all()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

        # Log creation
        income = serializer.instance
        TransactionHistory.objects.create(
            user=self.request.user,
            action='create',
            entity_type='income',
            entity_id=income.id,
            description=f"Created income: {income.title}",
            new_data=json.loads(json.dumps(serializer.data, cls=DjangoJSONEncoder))
        )

    def perform_update(self, serializer):
        old_data = IncomeSerializer(self.get_object()).data
        serializer.save()
        
        # Log update
        income: Income = serializer.instance
        income.wallet.update_balance(
            Decimal(serializer.data['amount']) - Decimal(old_data['amount']),
            'add' if Decimal(serializer.data['amount']) > Decimal(old_data['amount']) else 'subtract'
        )
        TransactionHistory.objects.create(
            user=self.request.user,
            action='update',
            entity_type='income',
            entity_id=income.id,
            description=f"Updated income: {income.title}",
            old_data=json.loads(json.dumps(old_data, cls=DjangoJSONEncoder)),
            new_data=json.loads(json.dumps(serializer.data, cls=DjangoJSONEncoder))
        )

    def perform_destroy(self, instance: Income):
        # Log deletion
        TransactionHistory.objects.create(
            user=self.request.user,
            action='delete',
            entity_type='income',
            entity_id=instance.id,
            description=f"Deleted income: {instance.title}",
            old_data=json.dumps(IncomeSerializer(instance).data, cls=DjangoJSONEncoder)
        )
        instance.wallet.update_balance(instance.amount, 'subtract')
        instance.delete()

    @action(detail=False, methods=['post'])
    def process_recurring(self, request):
        """Process all due recurring incomes"""
        today = timezone.now().date()
        due_incomes = Income.objects.filter(
            is_recurring=True,
            next_occurrence__lte=today
        )
        
        created_count = 0
        for income in due_incomes:
            # Create new income for this occurrence
            Income.objects.create(
                wallet=income.wallet,
                project=income.project,
                title=f"{income.title} (Recurring)",
                amount=income.amount,
                category=income.category,
                description=income.description,
                date=income.next_occurrence,
                is_recurring=False,
                created_by=income.created_by
            )
            created_count += 1
            
            # Update next occurrence
            income.calculate_next_occurrence()
        
        return Response({
            'message': f'Processed {created_count} recurring incomes',
            'count': created_count
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get income statistics (using RWF as base currency)"""
        today = timezone.now().date()
        incomes = self.get_queryset()
        
        total = incomes.aggregate(total=Sum('amount_rwf'))['total'] or 0
        this_month = incomes.filter(
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0
        this_year = incomes.filter(
            date__year=today.year
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0
        count = incomes.count()
        
        return Response({
            'total': str(total),
            'this_month': str(this_month),
            'this_year': str(this_year),
            'count': count,
            'currency': 'RWF'
        })


class ExpenseViewSet(viewsets.ModelViewSet):
    """Expense transaction management"""
    serializer_class = ExpenseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['wallet', 'project', 'category', 'is_recurring', 'recurrence_type']
    search_fields = ['title', 'description', 'notes']
    ordering_fields = ['date', 'amount', 'created_at']

    def get_serializer_class(self):
        """Use lightweight serializer for list, full serializer for detail"""
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer

    def get_queryset(self):
        queryset = Expense.objects.all()
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
        
        # Log creation
        expense = serializer.instance
        TransactionHistory.objects.create(
            user=self.request.user,
            action='create',
            entity_type='expense',
            entity_id=expense.id,
            description=f"Created expense: {expense.title}",
            new_data=json.loads(json.dumps(serializer.data, cls=DjangoJSONEncoder))
        )

    def perform_update(self, serializer):
        old_data = ExpenseSerializer(self.get_object()).data
        serializer.save()
        
        # Log update
        expense = serializer.instance
        expense.wallet.update_balance(
            Decimal(old_data['amount']) - Decimal(serializer.data['amount']),
            'add' if Decimal(serializer.data['amount']) < Decimal(old_data['amount']) else 'subtract'
        )
        TransactionHistory.objects.create(
            user=self.request.user,
            action='update',
            entity_type='expense',
            entity_id=expense.id,
            description=f"Updated expense: {expense.title}",
            old_data=old_data,
            new_data=json.dumps(serializer.data, cls=DjangoJSONEncoder)
        )

    def perform_destroy(self, instance):
        # Log deletion
        TransactionHistory.objects.create(
            user=self.request.user,
            action='delete',
            entity_type='expense',
            entity_id=instance.id,
            description=f"Deleted expense: {instance.title}",
            old_data=json.dumps(ExpenseSerializer(instance).data, cls=DjangoJSONEncoder)
        )
        instance.wallet.update_balance(instance.amount, 'add')
        instance.delete()

    @action(detail=False, methods=['post'])
    def process_recurring(self, request):
        """Process all due recurring expenses"""
        today = timezone.now().date()
        due_expenses = Expense.objects.filter(
            is_recurring=True,
            next_occurrence__lte=today
        )
        
        created_count = 0
        for expense in due_expenses:
            # Create new expense for this occurrence
            Expense.objects.create(
                wallet=expense.wallet,
                project=expense.project,
                title=f"{expense.title} (Recurring)",
                amount=expense.amount,
                category=expense.category,
                description=expense.description,
                date=expense.next_occurrence,
                is_recurring=False,
                created_by=expense.user
            )
            created_count += 1
            
            # Update next occurrence
            expense.calculate_next_occurrence()
        
        return Response({
            'message': f'Processed {created_count} recurring expenses',
            'count': created_count
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get expense statistics (using RWF as base currency)"""
        today = timezone.now().date()
        expenses = self.get_queryset()
        
        total = expenses.aggregate(total=Sum('amount_rwf'))['total'] or 0
        this_month = expenses.filter(
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0
        this_year = expenses.filter(
            date__year=today.year
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0
        count = expenses.count()
        
        return Response({
            'total': str(total),
            'this_month': str(this_month),
            'this_year': str(this_year),
            'count': count,
            'currency': 'RWF'
        })


class SubscriptionViewSet(viewsets.ModelViewSet):
    """Subscription management"""
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['wallet', 'category', 'status', 'billing_cycle']
    search_fields = ['name', 'description']
    ordering_fields = ['next_billing_date', 'amount', 'name']

    def get_serializer_class(self):
        """Use lightweight serializer for list, full serializer for detail"""
        if self.action == 'list':
            return SubscriptionListSerializer
        return SubscriptionSerializer

    def get_queryset(self):
        return Subscription.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def renew(self, request, pk=None):
        """Manually trigger subscription renewal"""
        subscription = self.get_object()
        
        if subscription.status != 'active':
            return Response(
                {'error': 'Subscription is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        expense = subscription.process_renewal()
        
        if expense:
            return Response({
                'message': 'Subscription renewed successfully',
                'expense_id': expense.id,
                'next_billing_date': subscription.next_billing_date
            })
        else:
            return Response(
                {'error': 'Failed to process renewal'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def upcoming_renewals(self, request):
        """Get subscriptions with upcoming renewals"""
        days = int(request.query_params.get('days', 7))
        today = timezone.now().date()
        future_date = today + timedelta(days=days)
        
        subscriptions = self.get_queryset().filter(
            status='active',
            next_billing_date__gte=today,
            next_billing_date__lte=future_date
        )
        
        serializer = self.get_serializer(subscriptions, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def process_renewals(self, request):
        """Process all due subscription renewals"""
        today = timezone.now().date()
        due_subscriptions = self.get_queryset().filter(
            status='active',
            next_billing_date__lte=today
        )
        
        processed_count = 0
        errors = []
        
        for subscription in due_subscriptions:
            try:
                subscription.process_renewal()
                processed_count += 1
            except Exception as e:
                errors.append(f"{subscription.name}: {str(e)}")
        
        return Response({
            'message': f'Processed {processed_count} subscriptions',
            'count': processed_count,
            'errors': errors
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get subscription statistics (monthly costs in RWF)"""
        subscriptions = self.get_queryset()
        active_subscriptions = subscriptions.filter(is_active=True)
        
        # Calculate monthly cost (converting all billing cycles to monthly equivalent, using RWF amounts)
        total_monthly_cost = Decimal('0')
        for sub in active_subscriptions:
            if sub.billing_cycle == 'monthly':
                total_monthly_cost += Decimal(sub.amount_rwf)
            elif sub.billing_cycle == 'yearly':
                total_monthly_cost += Decimal(sub.amount_rwf) / 12
            elif sub.billing_cycle == 'weekly':
                total_monthly_cost += Decimal(sub.amount_rwf) * 4
            elif sub.billing_cycle == 'daily':
                total_monthly_cost += Decimal(sub.amount_rwf) * 30
        
        return Response({
            'total_monthly_cost': str(total_monthly_cost),
            'active_count': active_subscriptions.count(),
            'total_count': subscriptions.count(),
            'currency': 'RWF'
        })


class BudgetViewSet(viewsets.ModelViewSet):
    """Budget management"""
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['budget_type', 'project', 'category', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['start_date', 'amount', 'name']

    def get_queryset(self):
        return Budget.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get currently active budgets"""
        today = timezone.now().date()
        budgets = self.get_queryset().filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )
        serializer = self.get_serializer(budgets, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def alerts(self, request):
        """Get budgets that need attention (exceeded or near threshold)"""
        today = timezone.now().date()
        budgets = self.get_queryset().filter(
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        )
        
        alerts = []
        for budget in budgets:
            if budget.is_exceeded or budget.should_alert:
                serializer = self.get_serializer(budget)
                data = serializer.data
                data['alert_type'] = 'exceeded' if budget.is_exceeded else 'warning'
                alerts.append(data)
        
        return Response(alerts)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get budget statistics"""
        today = timezone.now().date()
        budgets = self.get_queryset().filter(
            is_active=True,
            start_date__lte=today
        )
        
        # Filter to active budgets within their date range
        active_budgets = budgets.filter(
            Q(end_date__isnull=True) | Q(end_date__gte=today)
        )
        
        total_budgeted = active_budgets.aggregate(total=Sum('amount'))['total'] or 0
        
        # Calculate total spent - sum up the spent field from each budget
        total_spent = Decimal('0')
        for budget in active_budgets:
            if hasattr(budget, 'spent') and budget.spent:
                total_spent += Decimal(budget.spent)
        
        total_remaining = total_budgeted - total_spent
        
        return Response({
            'total_budgeted': str(total_budgeted),
            'total_spent': str(total_spent),
            'total_remaining': str(total_remaining),
            'active_count': active_budgets.count()
        })


class SavingsGoalViewSet(viewsets.ModelViewSet):
    """Savings goal management"""
    serializer_class = SavingsGoalSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['wallet', 'status']
    search_fields = ['name', 'description']
    ordering_fields = ['target_date', 'target_amount', 'created_at']

    def get_queryset(self):
        return SavingsGoal.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    @action(detail=True, methods=['post'])
    def contribute(self, request, pk=None):
        """Add contribution to savings goal"""
        goal = self.get_object()
        amount = Decimal(request.data.get('amount', 0))
        
        if amount <= 0:
            return Response(
                {'error': 'Amount must be positive'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        goal.add_contribution(amount)
        serializer = self.get_serializer(goal)
        
        return Response({
            'message': 'Contribution added successfully',
            'goal': serializer.data
        })

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get savings goal statistics"""
        goals = self.get_queryset()
        active_goals = goals.filter(is_achieved=False)
        
        total_target = goals.aggregate(total=Sum('target_amount'))['total'] or 0
        total_saved = goals.aggregate(total=Sum('current_amount'))['total'] or 0
        
        # Calculate completion percentage
        if total_target > 0:
            completion_percentage = (Decimal(total_saved) / Decimal(total_target)) * 100
        else:
            completion_percentage = 0
        
        return Response({
            'total_target': str(total_target),
            'total_saved': str(total_saved),
            'completion_percentage': str(round(completion_percentage, 1)),
            'active_count': active_goals.count()
        })


class TransactionHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    """Transaction history/audit trail"""
    serializer_class = TransactionHistorySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['action', 'entity_type']
    ordering_fields = ['timestamp']

    def get_queryset(self):
        return TransactionHistory.objects.filter(user=self.request.user)


class AnalyticsViewSet(viewsets.ViewSet):
    """Financial analytics and reports"""
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'])
    def monthly_report(self, request):
        """Get monthly financial report (all amounts in RWF)"""
        month = int(request.query_params.get('month', timezone.now().month))
        year = int(request.query_params.get('year', timezone.now().year))
        
        # Get incomes and expenses for the month
        incomes = Income.objects.filter(
            # user=request.user,
            date__year=year,
            date__month=month
        )
        expenses = Expense.objects.filter(
            # user=request.user,
            date__year=year,
            date__month=month
        )
        
        total_income = incomes.aggregate(total=Sum('amount_rwf'))['total'] or 0
        total_expense = expenses.aggregate(total=Sum('amount_rwf'))['total'] or 0
        
        # Income by category (in RWF)
        income_by_category = {}
        for income in incomes:
            cat_name = income.category.name
            income_by_category[cat_name] = income_by_category.get(cat_name, 0) + float(income.amount_rwf)
        
        # Expense by category (in RWF)
        expense_by_category = {}
        for expense in expenses:
            cat_name = expense.category.name
            expense_by_category[cat_name] = expense_by_category.get(cat_name, 0) + float(expense.amount_rwf)
        
        # Top expenses (in RWF)
        top_expenses = list(expenses.order_by('-amount_rwf')[:10].values('title', 'amount_rwf', 'date'))
        
        report_data = {
            'month': month,
            'year': year,
            'total_income': total_income,
            'total_expense': total_expense,
            'net_savings': total_income - total_expense,
            'income_by_category': income_by_category,
            'expense_by_category': expense_by_category,
            'top_expenses': top_expenses,
            'currency': 'RWF'
        }
        
        serializer = MonthlyReportSerializer(report_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def project_profitability(self, request):
        """Analyze profitability of projects (all amounts in RWF)"""
        from apps.projects.models import Project
        
        projects = Project.objects.filter(created_by=request.user)
        profitability_data = []
        
        for project in projects:
            total_income = project.incomes.aggregate(total=Sum('amount_rwf'))['total'] or 0
            total_expense = project.expenses.aggregate(total=Sum('amount_rwf'))['total'] or 0
            profit = total_income - total_expense
            profit_margin = (profit / total_income * 100) if total_income > 0 else 0
            
            profitability_data.append({
                'project_id': project.id,
                'project_name': project.title,
                'total_income': total_income,
                'total_expense': total_expense,
                'profit': profit,
                'profit_margin': profit_margin,
                'currency': 'RWF'
            })
        
        serializer = ProjectProfitabilitySerializer(profitability_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def cash_flow(self, request):
        """Get cash flow over time (all amounts in RWF)"""
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if not start_date or not end_date:
            # Default to last 3 months
            end_date = timezone.now().date()
            start_date = end_date - timedelta(days=90)
        else:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        
        # Get all transactions in date range (using RWF amounts)
        incomes = Income.objects.filter(
            # user=request.user,
            date__gte=start_date,
            date__lte=end_date
        ).values('date').annotate(total=Sum('amount_rwf'))
        
        expenses = Expense.objects.filter(
            # user=request.user,
            date__gte=start_date,
            date__lte=end_date
        ).values('date').annotate(total=Sum('amount_rwf'))
        
        # Build daily cash flow
        cash_flow_data = []
        cumulative_balance = 0
        
        current_date = start_date
        while current_date <= end_date:
            day_income = sum(i['total'] for i in incomes if i['date'] == current_date)
            day_expense = sum(e['total'] for e in expenses if e['date'] == current_date)
            net_flow = day_income - day_expense
            cumulative_balance += net_flow
            
            cash_flow_data.append({
                'date': current_date,
                'income': day_income,
                'expense': day_expense,
                'net_flow': net_flow,
                'cumulative_balance': cumulative_balance
            })
            
            current_date += timedelta(days=1)
        
        serializer = CashFlowSerializer(cash_flow_data, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        """Get dashboard overview (all amounts in RWF)"""
        today = timezone.now().date()
        
        # Current month stats (in RWF)
        current_month_income = Income.objects.filter(
            # user=request.user,
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0
        
        current_month_expense = Expense.objects.filter(
            # user=request.user,
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0
        
        # Total wallet balance (in RWF)
        total_balance = Wallet.objects.filter(
            is_active=True
        ).aggregate(total=Sum('balance_rwf'))['total'] or 0
        
        # Active budgets
        active_budgets = Budget.objects.filter(
            # user=request.user,
            is_active=True,
            start_date__lte=today,
            end_date__gte=today
        ).count()
        
        # Active savings goals
        active_goals = SavingsGoal.objects.filter(
            # user=request.user,
            status='active'
        ).count()
        
        # Upcoming subscriptions (next 7 days)
        upcoming_subscriptions = Subscription.objects.filter(
            # user=request.user,
            status='active',
            next_billing_date__gte=today,
            next_billing_date__lte=today + timedelta(days=7)
        ).count()
        
        return Response({
            'current_month_income': current_month_income,
            'current_month_expense': current_month_expense,
            'net_savings': current_month_income - current_month_expense,
            'total_balance': total_balance,
            'active_budgets': active_budgets,
            'active_goals': active_goals,
            'upcoming_subscriptions': upcoming_subscriptions,
            'currency': 'RWF'
        })


class DashboardStatsView(APIView):
    """Dashboard statistics view"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Get dashboard statistics (all amounts in RWF)"""
        today = timezone.now().date()
        user = request.user

        # Total balance across all wallets (in RWF)
        total_balance = Wallet.objects.filter(
            is_active=True
        ).aggregate(total=Sum('balance_rwf'))['total'] or 0

        # Total income (all time, in RWF)
        total_income = Income.objects.all().aggregate(total=Sum('amount_rwf'))['total'] or 0

        # Total expenses (all time, in RWF)
        total_expenses = Expense.objects.all().aggregate(total=Sum('amount_rwf'))['total'] or 0

        # Active wallets count
        active_wallets = Wallet.objects.filter(
            is_active=True
        ).count()

        # Monthly income (current month, in RWF)
        monthly_income = Income.objects.filter(
            # user=user,
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0

        # Monthly expenses (current month, in RWF)
        monthly_expenses = Expense.objects.filter(
            # user=user,
            date__year=today.year,
            date__month=today.month
        ).aggregate(total=Sum('amount_rwf'))['total'] or 0

        # Net monthly (income - expenses for current month)
        net_monthly = Decimal(str(monthly_income)) - Decimal(str(monthly_expenses))

        return Response({
            'total_balance': str(total_balance),
            'total_income': str(total_income),
            'total_expenses': str(total_expenses),
            'active_wallets': active_wallets,
            'monthly_income': str(monthly_income),
            'monthly_expenses': str(monthly_expenses),
            'net_monthly': str(net_monthly),
            'currency': 'RWF'
        })
