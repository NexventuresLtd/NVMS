from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from django.core.validators import URLValidator
import uuid


class ProjectStatus(models.TextChoices):
    PLANNING = 'planning', 'Planning'
    IN_PROGRESS = 'in_progress', 'In Progress'
    TESTING = 'testing', 'Testing'
    COMPLETED = 'completed', 'Completed'
    ON_HOLD = 'on_hold', 'On Hold'
    CANCELLED = 'cancelled', 'Cancelled'


class ProjectPriority(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    URGENT = 'urgent', 'Urgent'


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    description = models.TextField()
    
    # Status and priority
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.PLANNING
    )
    priority = models.CharField(
        max_length=10,
        choices=ProjectPriority.choices,
        default=ProjectPriority.MEDIUM
    )
    
    # Dates
    start_date = models.DateField(null=True, blank=True)
    due_date = models.DateField(null=True, blank=True)
    completed_date = models.DateField(null=True, blank=True)
    
    # People
    client_name = models.CharField(max_length=100, blank=True)
    client_email = models.EmailField(blank=True)
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_projects'
    )
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='created_projects'
    )
    
    # Project details
    budget = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    estimated_hours = models.PositiveIntegerField(null=True, blank=True)
    actual_hours = models.PositiveIntegerField(default=0)
    
    # URLs
    repository_url = models.URLField(blank=True, validators=[URLValidator()])
    live_url = models.URLField(blank=True, validators=[URLValidator()])
    staging_url = models.URLField(blank=True, validators=[URLValidator()])
    
    # Meta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
    
    def __str__(self):
        return self.title
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)
    
    @property
    def progress_percentage(self):
        """Calculate progress based on status"""
        status_progress = {
            ProjectStatus.PLANNING: 10,
            ProjectStatus.IN_PROGRESS: 50,
            ProjectStatus.TESTING: 80,
            ProjectStatus.COMPLETED: 100,
            ProjectStatus.ON_HOLD: 0,
            ProjectStatus.CANCELLED: 0,
        }
        return status_progress.get(self.status, 0)
    
    @property
    def is_overdue(self):
        """Check if project is overdue"""
        if not self.due_date:
            return False
        from django.utils import timezone
        return timezone.now().date() > self.due_date and self.status != ProjectStatus.COMPLETED
    
    @property
    def can_create_portfolio_entry(self):
        """Check if this project can be converted to a portfolio entry"""
        return (
            self.status == ProjectStatus.COMPLETED and 
            not hasattr(self, 'portfolio_entry')
        )
    
    def create_portfolio_entry(self, **kwargs):
        """Create a portfolio entry from this project"""
        if not self.can_create_portfolio_entry:
            raise ValueError("Cannot create portfolio entry for this project")
        
        from apps.portfolio.models import Portfolio
        
        portfolio_data = {
            'title': self.title,
            'description': self.description,
            'short_description': self.description[:250] + '...' if len(self.description) > 250 else self.description,
            'client_name': self.client_name,
            'start_date': self.start_date or self.created_at.date(),
            'end_date': self.completed_date,
            'created_by': self.created_by,
            'source_project': self,
            'status': 'draft',  # Start as draft
            **kwargs
        }
        
        return Portfolio.objects.create(**portfolio_data)


class ProjectTag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name


class ProjectTagAssignment(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tag_assignments')
    tag = models.ForeignKey(ProjectTag, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['project', 'tag']


class ProjectNote(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notes')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    is_internal = models.BooleanField(default=True)  # False for client-visible notes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Note for {self.project.title} by {self.author.username}"
