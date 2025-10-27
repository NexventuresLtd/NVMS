# Financial Management System - API Documentation

## Overview

The Financial Management System provides comprehensive tools for managing finances including wallets, income, expenses, subscriptions, budgets, and savings goals with full analytics and reporting capabilities.

## Features

### 1. Multi-Currency Wallet Management

- Multiple wallet types (Savings, Current, Cash, Mobile Money, Credit Card, Investment)
- Multi-currency support with exchange rates
- Balance tracking and transfers between wallets
- Wallet summaries and analytics

### 2. Income & Expense Tracking

- Record income and expenses with detailed categorization
- Link transactions to projects for profitability tracking
- Support for recurring transactions (daily, weekly, monthly, quarterly, yearly)
- File attachments (receipts, invoices)
- Custom notes and descriptions
- Transaction tagging (e.g., "tax deductible", "client reimbursable")

### 3. Subscription Management

- Track recurring expenses (monthly, quarterly, semi-annually, yearly)
- Renewal notifications and alerts
- Automatic renewal processing
- Status management (active, paused, cancelled)

### 4. Budget Planning

- Monthly, project-based, or category-based budgets
- Real-time budget tracking
- Usage percentage and alerts
- Budget vs actual comparison

### 5. Savings Goals

- Set financial goals with target amounts and dates
- Progress tracking
- Contribution management
- Status monitoring

### 6. Analytics & Reporting

- Monthly financial reports
- Project profitability analysis
- Cash flow tracking over time
- Dashboard overview
- Category-wise expense breakdown
- Top expenses tracking

### 7. Audit Trail

- Complete transaction history
- Track all changes, updates, and deletions
- User activity logging

## API Endpoints

### Base URL

```
/api/wallet/
```

### Authentication

All endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Currencies

#### List all currencies

```
GET /api/wallet/currencies/
```

#### Create a currency

```
POST /api/wallet/currencies/
{
  "code": "USD",
  "name": "US Dollar",
  "symbol": "$",
  "exchange_rate_to_base": 1.0
}
```

#### Update a currency

```
PUT /api/wallet/currencies/{id}/
PATCH /api/wallet/currencies/{id}/
```

#### Delete a currency

```
DELETE /api/wallet/currencies/{id}/
```

### Wallets

#### List user wallets

```
GET /api/wallet/wallets/
?wallet_type=savings
&currency=1
&is_active=true
&search=main
```

#### Create a wallet

```
POST /api/wallet/wallets/
{
  "name": "Main Savings",
  "wallet_type": "savings",
  "currency": 1,
  "description": "Primary savings account",
  "is_active": true
}
```

#### Transfer between wallets

```
POST /api/wallet/wallets/{id}/transfer/
{
  "target_wallet_id": 2,
  "amount": 1000.00
}
```

#### Get wallet summary

```
GET /api/wallet/wallets/summary/
```

Returns summary of all wallets including total income, expenses, and net flow.

### Transaction Categories

#### List categories

```
GET /api/wallet/categories/
?category_type=expense
&parent=1
&search=office
```

#### Get category tree

```
GET /api/wallet/categories/tree/
```

Returns hierarchical category structure.

#### Create a category

```
POST /api/wallet/categories/
{
  "name": "Software Licenses",
  "category_type": "expense",
  "parent": 4,
  "description": "Software subscription costs",
  "color": "#8B5CF6",
  "icon": "laptop"
}
```

### Transaction Tags

#### List tags

```
GET /api/wallet/tags/
?search=tax
```

#### Create a tag

```
POST /api/wallet/tags/
{
  "name": "Tax Deductible",
  "description": "Expenses that can be deducted from taxes",
  "color": "#10B981"
}
```

### Income

#### List income transactions

```
GET /api/wallet/incomes/
?wallet=1
&project=5
&category=2
&is_recurring=false
&start_date=2025-01-01
&end_date=2025-12-31
&ordering=-date
```

#### Create income

```
POST /api/wallet/incomes/
{
  "wallet": 1,
  "project": 5,
  "title": "Project Payment - Phase 1",
  "amount": 5000.00,
  "category": 1,
  "tags": [1, 2],
  "description": "First phase payment",
  "date": "2025-10-15",
  "is_recurring": false,
  "notes": "Invoice #INV-001"
}
```

#### Create recurring income

```
POST /api/wallet/incomes/
{
  "wallet": 1,
  "title": "Monthly Retainer",
  "amount": 1500.00,
  "category": 2,
  "date": "2025-10-01",
  "is_recurring": true,
  "recurrence_type": "monthly",
  "recurrence_end_date": "2026-10-01"
}
```

#### Process recurring incomes

```
POST /api/wallet/incomes/process_recurring/
```

Processes all due recurring incomes and creates new transactions.

### Expenses

#### List expense transactions

```
GET /api/wallet/expenses/
?wallet=1
&project=5
&category=3
&start_date=2025-01-01
&end_date=2025-12-31
```

#### Create expense

```
POST /api/wallet/expenses/
{
  "wallet": 1,
  "project": 5,
  "title": "Server Hosting",
  "amount": 250.00,
  "category": 4,
  "tags": [1],
  "description": "Monthly hosting fee",
  "date": "2025-10-15",
  "is_recurring": true,
  "recurrence_type": "monthly",
  "notes": "Provider: AWS"
}
```

#### Process recurring expenses

```
POST /api/wallet/expenses/process_recurring/
```

### Subscriptions

#### List subscriptions

```
GET /api/wallet/subscriptions/
?wallet=1
&status=active
&billing_cycle=monthly
```

#### Create subscription

```
POST /api/wallet/subscriptions/
{
  "wallet": 1,
  "name": "GitHub Pro",
  "amount": 14.00,
  "billing_cycle": "monthly",
  "category": 4,
  "start_date": "2025-01-01",
  "next_billing_date": "2025-11-01",
  "notify_days_before": 3,
  "description": "Team subscription",
  "website_url": "https://github.com"
}
```

#### Renew subscription manually

```
POST /api/wallet/subscriptions/{id}/renew/
```

#### Get upcoming renewals

```
GET /api/wallet/subscriptions/upcoming_renewals/
?days=7
```

#### Process all due renewals

```
POST /api/wallet/subscriptions/process_renewals/
```

### Budgets

#### List budgets

```
GET /api/wallet/budgets/
?budget_type=monthly
&project=5
&is_active=true
```

#### Create budget

```
POST /api/wallet/budgets/
{
  "name": "October 2025 - Operations",
  "budget_type": "monthly",
  "amount": 10000.00,
  "currency": 1,
  "start_date": "2025-10-01",
  "end_date": "2025-10-31",
  "alert_threshold": 80,
  "description": "Monthly operational budget"
}
```

#### Get active budgets

```
GET /api/wallet/budgets/active/
```

#### Get budget alerts

```
GET /api/wallet/budgets/alerts/
```

Returns budgets that are exceeded or near threshold.

### Savings Goals

#### List savings goals

```
GET /api/wallet/savings-goals/
?wallet=1
&status=active
```

#### Create savings goal

```
POST /api/wallet/savings-goals/
{
  "wallet": 1,
  "name": "New Office Equipment",
  "target_amount": 5000.00,
  "current_amount": 0.00,
  "target_date": "2026-06-01",
  "description": "Upgrade workstations and monitors",
  "icon": "monitor"
}
```

#### Add contribution to goal

```
POST /api/wallet/savings-goals/{id}/contribute/
{
  "amount": 500.00
}
```

### Transaction History

#### List audit trail

```
GET /api/wallet/history/
?action=create
&entity_type=expense
&ordering=-timestamp
```

### Analytics

#### Monthly Report

```
GET /api/wallet/analytics/monthly_report/
?month=10
&year=2025
```

Returns:

- Total income and expenses
- Net savings
- Income by category
- Expense by category
- Top expenses

#### Project Profitability

```
GET /api/wallet/analytics/project_profitability/
```

Returns profitability analysis for all projects including:

- Total income per project
- Total expenses per project
- Profit/loss
- Profit margin percentage

#### Cash Flow

```
GET /api/wallet/analytics/cash_flow/
?start_date=2025-07-01
&end_date=2025-10-27
```

Returns daily cash flow including:

- Daily income
- Daily expenses
- Net flow
- Cumulative balance

#### Dashboard Overview

```
GET /api/wallet/analytics/dashboard/
```

Returns:

- Current month income and expenses
- Total wallet balance
- Active budgets count
- Active savings goals count
- Upcoming subscriptions count

## Data Models

### Wallet

- `name`: Wallet name
- `wallet_type`: Type (savings, current, cash, mobile_money, credit_card, investment, other)
- `currency`: Foreign key to Currency
- `balance`: Current balance (auto-calculated)
- `description`: Optional description
- `is_active`: Active status

### Income/Expense

- `wallet`: Foreign key to Wallet
- `project`: Optional foreign key to Project
- `title`: Transaction title
- `amount`: Transaction amount
- `category`: Foreign key to TransactionCategory
- `tags`: Many-to-many with TransactionTag
- `date`: Transaction date
- `is_recurring`: Boolean for recurring transactions
- `recurrence_type`: Type (none, daily, weekly, monthly, quarterly, yearly)
- `recurrence_end_date`: Optional end date for recurrence
- `receipt`: Optional file upload
- `notes`: Optional notes

### Subscription

- `wallet`: Foreign key to Wallet
- `name`: Subscription name
- `amount`: Billing amount
- `billing_cycle`: Cycle (monthly, quarterly, semi_annually, yearly)
- `category`: Foreign key to TransactionCategory
- `start_date`: Subscription start date
- `next_billing_date`: Next billing date
- `end_date`: Optional end date
- `status`: Status (active, paused, cancelled)
- `notify_days_before`: Days before renewal to notify

### Budget

- `name`: Budget name
- `budget_type`: Type (monthly, project, category)
- `project`: Optional foreign key to Project
- `category`: Optional foreign key to TransactionCategory
- `amount`: Budget amount
- `currency`: Foreign key to Currency
- `start_date`: Start date
- `end_date`: End date
- `alert_threshold`: Alert threshold percentage (default: 80)

### SavingsGoal

- `wallet`: Foreign key to Wallet
- `name`: Goal name
- `target_amount`: Target amount
- `current_amount`: Current saved amount
- `target_date`: Optional target date
- `status`: Status (active, completed, cancelled)

## Best Practices

### 1. Transaction Management

- Always link expenses to projects when applicable for better profitability tracking
- Use appropriate categories and tags for better reporting
- Upload receipts for important transactions
- Add detailed notes for audit purposes

### 2. Recurring Transactions

- Set up recurring transactions for regular income/expenses
- Use subscriptions for services with fixed billing cycles
- Set appropriate notification days for subscription renewals
- Process recurring transactions regularly (recommended: daily automated job)

### 3. Budget Planning

- Create budgets at the beginning of each month
- Set realistic alert thresholds (recommended: 80%)
- Monitor budget alerts regularly
- Create project-specific budgets for better cost control

### 4. Analytics & Reporting

- Review monthly reports to track financial health
- Monitor project profitability regularly
- Use cash flow analysis for forecasting
- Check dashboard daily for overview

### 5. Security

- Keep audit trail enabled for compliance
- Review transaction history regularly
- Use appropriate user permissions
- Backup financial data regularly

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200 OK`: Successful GET request
- `201 Created`: Successful POST request
- `204 No Content`: Successful DELETE request
- `400 Bad Request`: Invalid data or business logic error
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include descriptive messages:

```json
{
  "error": "Insufficient balance in Main Account",
  "details": {
    "current_balance": 1000.0,
    "required_amount": 1500.0
  }
}
```

## Automation & Background Jobs

### Recommended Background Tasks

1. **Process Recurring Transactions** (Daily)

```python
# Call these endpoints daily
POST /api/wallet/incomes/process_recurring/
POST /api/wallet/expenses/process_recurring/
POST /api/wallet/subscriptions/process_renewals/
```

2. **Subscription Renewal Notifications** (Daily)

```python
# Check for subscriptions due in next N days
GET /api/wallet/subscriptions/upcoming_renewals/?days=3
# Send notifications to users
```

3. **Budget Alerts** (Daily)

```python
# Check for budgets near threshold or exceeded
GET /api/wallet/budgets/alerts/
# Send notifications to users
```

4. **Currency Exchange Rate Updates** (Daily/Weekly)

```python
# Update exchange rates from external API
# Update Currency model exchange_rate_to_base field
```

## Integration with Projects

The financial system is fully integrated with the project management system:

- Link income to specific projects to track revenue
- Link expenses to projects to track costs
- Calculate project profitability automatically
- Create project-specific budgets
- Generate project financial reports

Example: Track a project's finances

```python
# Get all income for a project
GET /api/wallet/incomes/?project=5

# Get all expenses for a project
GET /api/wallet/expenses/?project=5

# Get project profitability
GET /api/wallet/analytics/project_profitability/
```

## Support

For issues or questions about the Financial Management API, please contact the development team.
