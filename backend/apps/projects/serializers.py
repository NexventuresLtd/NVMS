from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Project, ProjectTag, ProjectTagAssignment, ProjectNote,
    ProjectDocument, ProjectAssignment
)


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
    mentioned_users = UserSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProjectNote
        fields = ['id', 'content', 'image', 'mentioned_users', 'is_internal', 'author', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at', 'mentioned_users']


class ProjectDocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    file_extension = serializers.SerializerMethodField()
    
    class Meta:
        model = ProjectDocument
        fields = [
            'id', 'title', 'document_type', 'file', 'description', 'version',
            'uploaded_by', 'is_confidential', 'created_at', 'updated_at',
            'file_size_mb', 'file_extension'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_file_size_mb(self, obj):
        try:
            return round(obj.file.size / (1024 * 1024), 2)
        except (ValueError, FileNotFoundError):
            return 0

    def get_file_extension(self, obj):
        try:
            import os
            return os.path.splitext(obj.file.name)[1] if obj.file else ''
        except (ValueError, AttributeError):
            return ''


class ProjectAssignmentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_by = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = ProjectAssignment
        fields = [
            'id', 'user', 'role', 'assigned_by', 'assigned_date', 'is_active',
            'notes', 'user_id'
        ]
        read_only_fields = ['assigned_by', 'assigned_date']


class ProjectListSerializer(serializers.ModelSerializer):
    """Serializer for project list view with essential fields"""
    assigned_to = UserSerializer(read_only=True)
    supervisor = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    tags = ProjectTagSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    # Use annotated fields from viewset instead of model properties/methods
    document_count = serializers.IntegerField(source='document_count_annotated', read_only=True)
    team_member_count = serializers.IntegerField(source='team_member_count_annotated', read_only=True)
    
    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'status', 'priority',
            'start_date', 'due_date', 'client_name', 'assigned_to', 'supervisor', 
            'created_by', 'budget', 'estimated_hours', 'actual_hours', 'created_at', 
            'updated_at', 'progress_percentage', 'is_overdue', 'tags', 'document_count',
            'team_member_count'
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for project detail view"""
    assigned_to = UserSerializer(read_only=True)
    supervisor = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    tags = ProjectTagSerializer(many=True, read_only=True)
    notes = ProjectNoteSerializer(many=True, read_only=True)
    documents = ProjectDocumentSerializer(many=True, read_only=True)
    assignments = ProjectAssignmentSerializer(many=True, read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    document_count = serializers.ReadOnlyField()
    team_members = UserSerializer(many=True, read_only=True)
    can_edit_progress = serializers.SerializerMethodField()
    
    # Write fields for relationships
    assigned_to_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    supervisor_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
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
            'assigned_to', 'supervisor', 'created_by', 'budget', 'estimated_hours', 'actual_hours',
            'manual_progress', 'repository_url', 'live_url', 'staging_url', 'created_at', 'updated_at',
            'is_active', 'progress_percentage', 'is_overdue', 'can_edit_progress', 'tags', 'notes', 'documents',
            'assignments', 'document_count', 'team_members',
            'assigned_to_id', 'supervisor_id', 'tag_ids'
        ]
        read_only_fields = ['slug', 'created_by', 'created_at', 'updated_at']
    
    def get_can_edit_progress(self, obj):
        """Check if current user can edit progress"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.can_edit_progress(request.user)
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        supervisor_id = validated_data.pop('supervisor_id', None)
        
        # Set the creator
        validated_data['created_by'] = self.context['request'].user
        
        # Set assigned user if provided
        if assigned_to_id:
            try:
                validated_data['assigned_to'] = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                pass
        
        # Set supervisor if provided
        if supervisor_id:
            try:
                validated_data['supervisor'] = User.objects.get(id=supervisor_id)
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
        supervisor_id = validated_data.pop('supervisor_id', None)
        
        # Update assigned user if provided
        if assigned_to_id is not None:
            if assigned_to_id:
                try:
                    instance.assigned_to = User.objects.get(id=assigned_to_id)
                except User.DoesNotExist:
                    pass
            else:
                instance.assigned_to = None
        
        # Update supervisor if provided
        if supervisor_id is not None:
            if supervisor_id:
                try:
                    instance.supervisor = User.objects.get(id=supervisor_id)
                except User.DoesNotExist:
                    pass
            else:
                instance.supervisor = None
        
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
    supervisor_id = serializers.IntegerField(required=False, allow_null=True)
    tag_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )
    
    class Meta:
        model = Project
        fields = [
            'title', 'description', 'status', 'priority', 'start_date', 'due_date',
            'client_name', 'client_email', 'budget', 'estimated_hours',
            'repository_url', 'live_url', 'staging_url', 'assigned_to_id', 
            'supervisor_id', 'tag_ids'
        ]
    
    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        supervisor_id = validated_data.pop('supervisor_id', None)
        
        # Set the creator
        validated_data['created_by'] = self.context['request'].user
        
        # Set assigned user if provided
        if assigned_to_id:
            try:
                validated_data['assigned_to'] = User.objects.get(id=assigned_to_id)
            except User.DoesNotExist:
                pass
        
        # Set supervisor if provided
        if supervisor_id:
            try:
                validated_data['supervisor'] = User.objects.get(id=supervisor_id)
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
