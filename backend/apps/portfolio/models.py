from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class TechnologyTag(models.Model):
    """Technology tags for portfolio projects"""
    name = models.CharField(max_length=50, unique=True)
    color = models.CharField(max_length=7, default='#952301')  # Hex color code
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']


class Portfolio(models.Model):
    """Portfolio project model"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    PROJECT_TYPE_CHOICES = [
        ('web_app', 'Web Application'),
        ('mobile_app', 'Mobile Application'),
        ('desktop_app', 'Desktop Application'),
        ('api', 'API/Backend Service'),
        ('landing_page', 'Landing Page'),
        ('e_commerce', 'E-commerce'),
        ('dashboard', 'Dashboard/Admin Panel'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    description = models.TextField()
    short_description = models.CharField(max_length=300, help_text="Brief description for cards/previews")
    
    # Project details
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default='web_app')
    client_name = models.CharField(max_length=100, blank=True, null=True)
    project_url = models.URLField(blank=True, null=True, help_text="Live project URL")
    repository_url = models.URLField(blank=True, null=True, help_text="GitHub/GitLab repository")
    case_study_url = models.URLField(blank=True, null=True, help_text="Detailed case study link")
    
    # Media
    featured_image = models.ImageField(upload_to='portfolio/featured/', blank=True, null=True)
    gallery_images = models.JSONField(default=list, blank=True, help_text="List of image URLs for gallery")
    
    # Technologies used
    technologies = models.ManyToManyField(TechnologyTag, blank=True)
    tech_stack_frontend = models.CharField(max_length=500, blank=True, help_text="Frontend technologies")
    tech_stack_backend = models.CharField(max_length=500, blank=True, help_text="Backend technologies")
    tech_stack_database = models.CharField(max_length=200, blank=True, help_text="Database technologies")
    tech_stack_deployment = models.CharField(max_length=200, blank=True, help_text="Deployment platform")
    
    # Project timeline
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    duration_months = models.PositiveIntegerField(blank=True, null=True, help_text="Project duration in months")
    
    # Metrics
    team_size = models.PositiveIntegerField(default=1)
    budget_range = models.CharField(max_length=50, blank=True, help_text="e.g., $5K-10K, $10K+")
    
    # SEO and visibility
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    is_featured = models.BooleanField(default=False, help_text="Show in featured projects")
    display_order = models.PositiveIntegerField(default=0, help_text="Order for display (0 = first)")
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='portfolio_projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    views_count = models.PositiveIntegerField(default=0)
    
    # Rich content
    detailed_description = models.TextField(blank=True, help_text="Detailed project description with markdown support")
    challenges_faced = models.TextField(blank=True, help_text="Technical challenges and solutions")
    key_features = models.JSONField(default=list, blank=True, help_text="List of key features")
    lessons_learned = models.TextField(blank=True)
    
    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-is_featured', 'display_order', '-created_at']
        verbose_name = 'Portfolio Project'
        verbose_name_plural = 'Portfolio Projects'
    
    def increment_views(self):
        """Increment the view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])
    
    @property
    def is_completed(self):
        """Check if project is completed"""
        return self.end_date is not None
    
    @property
    def duration_display(self):
        """Display friendly duration"""
        if self.duration_months:
            if self.duration_months == 1:
                return "1 month"
            elif self.duration_months < 12:
                return f"{self.duration_months} months"
            else:
                years = self.duration_months // 12
                months = self.duration_months % 12
                if months == 0:
                    return f"{years} year{'s' if years > 1 else ''}"
                else:
                    return f"{years}y {months}m"
        return "Duration not specified"


class ProjectTestimonial(models.Model):
    """Client testimonials for portfolio projects"""
    project = models.ForeignKey(Portfolio, on_delete=models.CASCADE, related_name='testimonials')
    client_name = models.CharField(max_length=100)
    client_position = models.CharField(max_length=100, blank=True)
    client_company = models.CharField(max_length=100, blank=True)
    client_image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    testimonial_text = models.TextField()
    rating = models.PositiveIntegerField(choices=[(i, i) for i in range(1, 6)], default=5)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.client_name} - {self.project.title}"
    
    class Meta:
        ordering = ['-is_featured', '-created_at']
