from django.contrib import admin
from django.utils.html import format_html
from .models import Portfolio, TechnologyTag, ProjectTestimonial


@admin.register(TechnologyTag)
class TechnologyTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color_display', 'created_at']
    list_filter = ['created_at']
    search_fields = ['name']
    ordering = ['name']
    
    def color_display(self, obj):
        return format_html(
            '<span style="background-color: {}; padding: 2px 8px; border-radius: 3px; color: white;">{}</span>',
            obj.color,
            obj.color
        )
    color_display.short_description = 'Color'


class ProjectTestimonialInline(admin.TabularInline):
    model = ProjectTestimonial
    extra = 0
    fields = ['client_name', 'client_position', 'rating', 'is_featured']


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'project_type', 'client_name', 'status',
        'is_featured', 'start_date', 'views_count', 'created_by'
    ]
    list_filter = [
        'status', 'project_type', 'is_featured', 'start_date',
        'technologies', 'created_at'
    ]
    search_fields = ['title', 'description', 'client_name', 'slug']
    prepopulated_fields = {'slug': ('title',)}
    filter_horizontal = ['technologies']
    readonly_fields = ['views_count', 'created_at', 'updated_at', 'created_by']
    inlines = [ProjectTestimonialInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'short_description', 'status')
        }),
        ('Project Details', {
            'fields': (
                'project_type', 'client_name', 'project_url',
                'repository_url', 'case_study_url'
            )
        }),
        ('Media', {
            'fields': ('featured_image', 'gallery_images'),
            'classes': ('collapse',)
        }),
        ('Technology Stack', {
            'fields': (
                'technologies', 'tech_stack_frontend', 'tech_stack_backend',
                'tech_stack_database', 'tech_stack_deployment'
            )
        }),
        ('Timeline & Metrics', {
            'fields': (
                'start_date', 'end_date', 'duration_months',
                'team_size', 'budget_range'
            )
        }),
        ('Visibility & Display', {
            'fields': ('is_featured', 'display_order', 'views_count')
        }),
        ('Rich Content', {
            'fields': (
                'detailed_description', 'challenges_faced',
                'key_features', 'lessons_learned'
            ),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by').prefetch_related('technologies')


@admin.register(ProjectTestimonial)
class ProjectTestimonialAdmin(admin.ModelAdmin):
    list_display = [
        'client_name', 'project', 'client_company',
        'rating', 'is_featured', 'created_at'
    ]
    list_filter = ['rating', 'is_featured', 'created_at', 'project']
    search_fields = ['client_name', 'client_company', 'testimonial_text']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Client Information', {
            'fields': ('client_name', 'client_position', 'client_company', 'client_image')
        }),
        ('Testimonial', {
            'fields': ('project', 'testimonial_text', 'rating', 'is_featured')
        }),
        ('Metadata', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        })
    )
