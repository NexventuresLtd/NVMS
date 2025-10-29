from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta


class Currency(models.Model):
    """Supported currencies for multi-currency support"""
    code = models.CharField(max_length=3, unique=True)  # USD, RWF, EUR, etc.
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=10)
    exchange_rate_to_base = models.DecimalField(
        max_digits=15, 
        decimal_places=6, 
        default=1.0,
        help_text="Exchange rate to base currency (usually USD)"
    )
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Currencies"
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Wallet(models.Model):
    """Different wallet/account types for managing finances"""
    WALLET_TYPES = [
        ('savings', 'Savings Account'),
        ('current', 'Current Account'),
        ('cash', 'Cash'),
        ('mobile_money', 'Mobile Money'),
        ('credit_card', 'Credit Card'),
        ('investment', 'Investment Account'),
        ('other', 'Other'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='wallets')
    name = models.CharField(max_length=100)
    wallet_type = models.CharField(max_length=20, choices=WALLET_TYPES, default='current')
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='wallets')
    balance = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_active', 'name']

    def __str__(self):
        return f"{self.name} ({self.get_wallet_type_display()}) - {self.currency.symbol}{self.balance}"

    def update_balance(self, amount, operation='add'):
        """Update wallet balance with given amount"""
        if operation == 'add':
            self.balance += amount
        elif operation == 'subtract':
            if self.balance >= amount:
                self.balance -= amount
            else:
                raise ValueError(f"Insufficient balance. Current: {self.balance}, Required: {amount}")
        self.save()


class TransactionCategory(models.Model):
    """Categories for organizing income and expenses with hierarchical structure"""
    CATEGORY_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('both', 'Both'),
    ]

    name = models.CharField(max_length=100)
    category_type = models.CharField(max_length=10, choices=CATEGORY_TYPES)
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='subcategories'
    )
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    icon = models.CharField(max_length=50, blank=True)  # Icon name for frontend
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Transaction Categories"
        ordering = ['name']

    def __str__(self):
        if self.parent:
            return f"{self.parent.name} > {self.name}"
        return self.name

    @property
    def full_path(self):
        """Get full category path"""
        if self.parent:
            return f"{self.parent.full_path} > {self.name}"
        return self.name


class TransactionTag(models.Model):
    """Custom tags for transactions (e.g., tax deductible, client reimbursable)"""
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6B7280')
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Income(models.Model):
    """Income transactions with project linking and recurrence support"""
    RECURRENCE_TYPES = [
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='incomes')
    wallet = models.ForeignKey(Wallet, on_delete=models.PROTECT, related_name='incomes')
    project = models.ForeignKey(
        'projects.Project', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='incomes'
    )
    
    title = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.ForeignKey(
        TransactionCategory, 
        on_delete=models.PROTECT, 
        related_name='incomes',
        limit_choices_to={'category_type__in': ['income', 'both']}
    )
    tags = models.ManyToManyField(TransactionTag, blank=True, related_name='incomes')
    
    description = models.TextField(blank=True)
    date = models.DateField()
    
    # Recurrence
    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=20, choices=RECURRENCE_TYPES, default='none')
    recurrence_end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField(null=True, blank=True)
    
    # Attachments
    receipt = models.FileField(upload_to='incomes/receipts/', null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_incomes'
    )

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        project_info = f" ({self.project.title})" if self.project else ""
        return f"{self.title}{project_info} - {self.wallet.currency.symbol}{self.amount}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update wallet balance for new income
        if is_new:
            self.wallet.update_balance(self.amount, 'add')
            
        # Set next occurrence if recurring
        if self.is_recurring and not self.next_occurrence:
            self.calculate_next_occurrence()

    def calculate_next_occurrence(self):
        """Calculate next occurrence date based on recurrence type"""
        if not self.is_recurring or self.recurrence_type == 'none':
            return
        
        base_date = self.next_occurrence or self.date
        
        if self.recurrence_type == 'daily':
            next_date = base_date + timedelta(days=1)
        elif self.recurrence_type == 'weekly':
            next_date = base_date + timedelta(weeks=1)
        elif self.recurrence_type == 'monthly':
            next_date = base_date + timedelta(days=30)  # Approximate
        elif self.recurrence_type == 'quarterly':
            next_date = base_date + timedelta(days=90)
        elif self.recurrence_type == 'yearly':
            next_date = base_date + timedelta(days=365)
        else:
            return
        
        # Check if next occurrence is before end date
        if self.recurrence_end_date and next_date > self.recurrence_end_date:
            self.is_recurring = False
            self.next_occurrence = None
        else:
            self.next_occurrence = next_date
        
        self.save()


class Expense(models.Model):
    """Expense transactions with project linking and recurrence support"""
    RECURRENCE_TYPES = [
        ('none', 'None'),
        ('daily', 'Daily'),
        ('weekly', 'Weekly'),
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('yearly', 'Yearly'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='expenses')
    wallet = models.ForeignKey(Wallet, on_delete=models.PROTECT, related_name='expenses')
    project = models.ForeignKey(
        'projects.Project', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='expenses'
    )
    
    title = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    category = models.ForeignKey(
        TransactionCategory, 
        on_delete=models.PROTECT, 
        related_name='expenses',
        limit_choices_to={'category_type__in': ['expense', 'both']}
    )
    tags = models.ManyToManyField(TransactionTag, blank=True, related_name='expenses')
    
    description = models.TextField(blank=True)
    date = models.DateField()
    
    # Recurrence
    is_recurring = models.BooleanField(default=False)
    recurrence_type = models.CharField(max_length=20, choices=RECURRENCE_TYPES, default='none')
    recurrence_end_date = models.DateField(null=True, blank=True)
    next_occurrence = models.DateField(null=True, blank=True)
    
    # Attachments
    receipt = models.FileField(upload_to='expenses/receipts/', null=True, blank=True)
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        related_name='created_expenses'
    )

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        project_info = f" ({self.project.title})" if self.project else ""
        return f"{self.title}{project_info} - {self.wallet.currency.symbol}{self.amount}"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Update wallet balance for new expense
        if is_new:
            self.wallet.update_balance(self.amount, 'subtract')
            
        # Set next occurrence if recurring
        if self.is_recurring and not self.next_occurrence:
            self.calculate_next_occurrence()

    def calculate_next_occurrence(self):
        """Calculate next occurrence date based on recurrence type"""
        if not self.is_recurring or self.recurrence_type == 'none':
            return
        
        base_date = self.next_occurrence or self.date
        
        if self.recurrence_type == 'daily':
            next_date = base_date + timedelta(days=1)
        elif self.recurrence_type == 'weekly':
            next_date = base_date + timedelta(weeks=1)
        elif self.recurrence_type == 'monthly':
            next_date = base_date + timedelta(days=30)
        elif self.recurrence_type == 'quarterly':
            next_date = base_date + timedelta(days=90)
        elif self.recurrence_type == 'yearly':
            next_date = base_date + timedelta(days=365)
        else:
            return
        
        if self.recurrence_end_date and next_date > self.recurrence_end_date:
            self.is_recurring = False
            self.next_occurrence = None
        else:
            self.next_occurrence = next_date
        
        self.save()


class Subscription(models.Model):
    """Recurring expenses with renewal tracking"""
    BILLING_CYCLES = [
        ('monthly', 'Monthly'),
        ('quarterly', 'Quarterly'),
        ('semi_annually', 'Semi-Annually'),
        ('yearly', 'Yearly'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('cancelled', 'Cancelled'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subscriptions')
    wallet = models.ForeignKey(Wallet, on_delete=models.PROTECT, related_name='subscriptions')
    
    name = models.CharField(max_length=200)
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    billing_cycle = models.CharField(max_length=20, choices=BILLING_CYCLES)
    category = models.ForeignKey(
        TransactionCategory, 
        on_delete=models.PROTECT, 
        related_name='subscriptions'
    )
    
    start_date = models.DateField()
    next_billing_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    notify_days_before = models.IntegerField(
        default=3,
        help_text="Days before renewal to send notification"
    )
    
    description = models.TextField(blank=True)
    website_url = models.URLField(blank=True) 
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['next_billing_date', 'name']

    def __str__(self):
        return f"{self.name} - {self.wallet.currency.symbol}{self.amount}/{self.get_billing_cycle_display()}"

    def calculate_next_billing_date(self):
        """Calculate next billing date based on billing cycle"""
        if self.billing_cycle == 'monthly':
            return self.next_billing_date + timedelta(days=30)
        elif self.billing_cycle == 'quarterly':
            return self.next_billing_date + timedelta(days=90)
        elif self.billing_cycle == 'semi_annually':
            return self.next_billing_date + timedelta(days=180)
        elif self.billing_cycle == 'yearly':
            return self.next_billing_date + timedelta(days=365)
        return self.next_billing_date

    def process_renewal(self):
        """Process subscription renewal and create expense"""
        if self.status != 'active':
            return False
        
        # Create expense for this subscription
        expense = Expense.objects.create(
            user=self.user,
            wallet=self.wallet,
            title=f"{self.name} - Subscription Renewal",
            amount=self.amount,
            category=self.category,
            description=f"Auto-generated from subscription: {self.name}",
            date=self.next_billing_date,
            is_recurring=False,
            created_by=self.user
        )
        
        # Update next billing date
        self.next_billing_date = self.calculate_next_billing_date()
        
        # Check if subscription should end
        if self.end_date and self.next_billing_date > self.end_date:
            self.status = 'cancelled'
        
        self.save()
        return expense

    @property
    def days_until_renewal(self):
        """Days until next renewal"""
        return (self.next_billing_date - timezone.now().date()).days

    @property
    def should_notify(self):
        """Check if notification should be sent"""
        return self.status == 'active' and self.days_until_renewal <= self.notify_days_before


class Budget(models.Model):
    """Budgets for monthly or project-based financial planning"""
    BUDGET_TYPES = [
        ('monthly', 'Monthly Budget'),
        ('project', 'Project Budget'),
        ('category', 'Category Budget'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    name = models.CharField(max_length=200)
    budget_type = models.CharField(max_length=20, choices=BUDGET_TYPES)
    
    # Optional links
    project = models.ForeignKey(
        'projects.Project', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='budgets'
    )
    category = models.ForeignKey(
        TransactionCategory, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='budgets'
    )
    
    amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    currency = models.ForeignKey(Currency, on_delete=models.PROTECT, related_name='budgets')
    
    # Time period
    start_date = models.DateField()
    end_date = models.DateField()
    
    # Alerts
    alert_threshold = models.IntegerField(
        default=80,
        help_text="Alert when budget usage reaches this percentage"
    )
    
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date', 'name']

    def __str__(self):
        return f"{self.name} - {self.currency.symbol}{self.amount}"

    @property
    def spent_amount(self):
        """Calculate total spent against this budget"""
        expenses = Expense.objects.filter(
            # user=self.user,
            date__gte=self.start_date,
            date__lte=self.end_date
        )
        
        if self.project:
            expenses = expenses.filter(project=self.project)
        if self.category:
            expenses = expenses.filter(category=self.category)
        
        total = sum(exp.amount for exp in expenses)
        return total

    @property
    def remaining_amount(self):
        """Calculate remaining budget"""
        return self.amount - self.spent_amount

    @property
    def usage_percentage(self):
        """Calculate budget usage percentage"""
        if self.amount == 0:
            return 0
        return (self.spent_amount / self.amount) * 100

    @property
    def is_exceeded(self):
        """Check if budget is exceeded"""
        return self.spent_amount > self.amount

    @property
    def should_alert(self):
        """Check if alert threshold is reached"""
        return self.usage_percentage >= self.alert_threshold


class SavingsGoal(models.Model):
    """Savings goals for financial planning"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    # user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='savings_goals')
    wallet = models.ForeignKey(Wallet, on_delete=models.PROTECT, related_name='savings_goals')
    
    name = models.CharField(max_length=200)
    target_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    current_amount = models.DecimalField(
        max_digits=15, 
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    target_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.wallet.currency.symbol}{self.current_amount}/{self.target_amount}"

    @property
    def progress_percentage(self):
        """Calculate progress percentage"""
        if self.target_amount == 0:
            return 0
        return min((self.current_amount / self.target_amount) * 100, 100)

    @property
    def remaining_amount(self):
        """Calculate remaining amount to reach goal"""
        return max(self.target_amount - self.current_amount, 0)

    @property
    def is_completed(self):
        """Check if goal is completed"""
        return self.current_amount >= self.target_amount

    def add_contribution(self, amount):
        """Add contribution to savings goal"""
        self.current_amount += amount
        if self.is_completed and self.status == 'active':
            self.status = 'completed'
        self.save()


class TransactionHistory(models.Model):
    """Audit trail for all financial transactions"""
    ACTION_TYPES = [
        ('create', 'Created'),
        ('update', 'Updated'),
        ('delete', 'Deleted'),
        ('transfer', 'Transfer'),
    ]

    ENTITY_TYPES = [
        ('income', 'Income'),
        ('expense', 'Expense'),
        ('subscription', 'Subscription'),
        ('budget', 'Budget'),
        ('wallet', 'Wallet'),
        ('goal', 'Savings Goal'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    entity_type = models.CharField(max_length=20, choices=ENTITY_TYPES)
    entity_id = models.IntegerField()
    
    # Store snapshot of data before/after change
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name_plural = "Transaction Histories"

    def __str__(self):
        return f"{self.user} {self.get_action_display()} {self.get_entity_type_display()} #{self.entity_id}"
