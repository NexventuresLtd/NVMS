from django.contrib import admin
from .models import (
    Project, ProjectTag, ProjectTagAssignment, ProjectNote,
    ProjectDocument, ProjectAssignment
)


class ProjectTagAssignmentInline(admin.TabularInline):
    model = ProjectTagAssignment
    extra = 1


class ProjectNoteInline(admin.TabularInline):
    model = ProjectNote
    extra = 1
    readonly_fields = ['author', 'created_at']


class ProjectDocumentInline(admin.TabularInline):
    model = ProjectDocument
    extra = 0
    readonly_fields = ['uploaded_by', 'created_at', 'file_size_mb']


class ProjectAssignmentInline(admin.TabularInline):
    model = ProjectAssignment
    extra = 1
    readonly_fields = ['assigned_by', 'assigned_date']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'status', 'priority', 'client_name', 'assigned_to', 'supervisor',
        'due_date', 'progress_percentage', 'document_count', 'created_at'
    ]
    list_filter = ['status', 'priority', 'assigned_to', 'supervisor', 'created_by', 'created_at']
    search_fields = ['title', 'description', 'client_name', 'client_email']
    readonly_fields = ['slug', 'created_by', 'created_at', 'updated_at', 'progress_percentage', 'document_count']
    prepopulated_fields = {'slug': ('title',)}
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'slug', 'description', 'status', 'priority')
        }),
        ('Dates', {
            'fields': ('start_date', 'due_date', 'completed_date')
        }),
        ('Client Information', {
            'fields': ('client_name', 'client_email')
        }),
        ('Assignment', {
            'fields': ('assigned_to', 'supervisor', 'created_by')
        }),
        ('Project Details', {
            'fields': ('budget', 'estimated_hours', 'actual_hours')
        }),
        ('URLs', {
            'fields': ('repository_url', 'live_url', 'staging_url'),
            'classes': ('collapse',)
        }),
        ('Meta', {
            'fields': ('is_active', 'created_at', 'updated_at', 'progress_percentage', 'document_count'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [ProjectTagAssignmentInline, ProjectAssignmentInline, ProjectDocumentInline, ProjectNoteInline]
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProjectTag)
class ProjectTagAdmin(admin.ModelAdmin):
    list_display = ['name', 'color', 'created_at']
    search_fields = ['name']
    ordering = ['name']


@admin.register(ProjectNote)
class ProjectNoteAdmin(admin.ModelAdmin):
    list_display = ['project', 'author', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at', 'author']
    search_fields = ['content', 'project__title']
    readonly_fields = ['created_at', 'updated_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.author = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProjectDocument)
class ProjectDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'project', 'document_type', 'version', 'uploaded_by', 'is_confidential', 'created_at']
    list_filter = ['document_type', 'is_confidential', 'created_at', 'uploaded_by']
    search_fields = ['title', 'description', 'project__title']
    readonly_fields = ['uploaded_by', 'created_at', 'updated_at', 'file_size_mb', 'file_extension']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(ProjectAssignment)
class ProjectAssignmentAdmin(admin.ModelAdmin):
    list_display = ['project', 'user', 'role', 'assigned_by', 'assigned_date', 'is_active']
    list_filter = ['role', 'is_active', 'assigned_date']
    search_fields = ['project__title', 'user__username', 'user__first_name', 'user__last_name']
    readonly_fields = ['assigned_by', 'assigned_date']
    
    def save_model(self, request, obj, form, change):
        if not change:  # If creating new object
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)
