from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Project, ProjectTag, ProjectTagAssignment, ProjectNote


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class ProjectTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTag
        fields = ['id', 'name', 'color']


class ProjectNoteSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = ProjectNote
        fields = ['id', 'content', 'is_internal', 'author', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']


class ProjectListSerializer(serializers.ModelSerializer):
    """Serializer for project list view with essential fields"""
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    tags = ProjectTagSerializer(source='tag_assignments.tag', many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'status', 'priority',
            'start_date', 'due_date', 'client_name', 'assigned_to', 'created_by',
            'budget', 'estimated_hours', 'actual_hours', 'created_at', 'updated_at',
            'progress_percentage', 'is_overdue', 'tags'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for project detail view"""
    assigned_to = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    tags = ProjectTagSerializer(source='tag_assignments.tag', many=True, read_only=True)
    notes = ProjectNoteSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    # Write fields for relationships
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'status', 'priority',
            'start_date', 'due_date', 'completed_date', 'client_name', 'client_email',
            'assigned_to', 'created_by', 'budget', 'estimated_hours', 'actual_hours',
            'repository_url', 'live_url', 'staging_url', 'created_at', 'updated_at',
            'is_active', 'progress_percentage', 'is_overdue', 'tags', 'notes',
            'assigned_to_id', 'tag_ids'
        ]
        read_only_fields = ['slug', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Set the creator
        validated_data['created_by'] = self.context['request'].user
        
        # Set assigned user if provided
        if assigned_to_id:
            try:
                validated_data['assigned_to'] = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                pass
        
        project = Project.objects.create(**validated_data)
        
        # Add tags
        for tag_id in tag_ids:
            try:
                tag = ProjectTag.objects.get(id=tag_id)
                ProjectTagAssignment.objects.create(project=project, tag=tag)
            except ProjectTag.DoesNotExist:
                continue
        
        return project
    
    def update(self, instance, validated_data):
        tag_ids = validated_data.pop('tag_ids', None)
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Update assigned user if provided
        if assigned_to_id is not None:
            if assigned_to_id:
                try:
                    instance.assigned_to = User.objects.get(id=assigned_to_id)
                except User.DoesNotExist:
                    pass
            else:
                instance.assigned_to = None
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        
        # Update tags if provided
        if tag_ids is not None:
            # Remove existing tags
            ProjectTagAssignment.objects.filter(project=instance).delete()
            
            # Add new tags
            for tag_id in tag_ids:
                try:
                    tag = ProjectTag.objects.get(id=tag_id)
                    ProjectTagAssignment.objects.create(project=instance, tag=tag)
                except ProjectTag.DoesNotExist:
                    continue
        
        return instance


class ProjectCreateSerializer(serializers.ModelSerializer):
    """Simplified serializer for project creation"""
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'status', 'priority', 'start_date', 'due_date',
            'client_name', 'client_email', 'budget', 'estimated_hours',
            'repository_url', 'live_url', 'staging_url', 'assigned_to_id', 'tag_ids'
        ]
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Set the creator
        validated_data['created_by'] = self.context['request'].user
        
        # Set assigned user if provided
        if assigned_to_id:
            try:
                validated_data['assigned_to'] = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                pass
        
        project = Project.objects.create(**validated_data)
        
        # Add tags
        for tag_id in tag_ids:
            try:
                tag = ProjectTag.objects.get(id=tag_id)
                ProjectTagAssignment.objects.create(project=project, tag=tag)
            except ProjectTag.DoesNotExist:
                continue
        
        return project
