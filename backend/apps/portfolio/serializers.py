from rest_framework import serializers
from .models import Portfolio, TechnologyTag, ProjectTestimonial


class TechnologyTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = TechnologyTag
        fields = ['id', 'name', 'color']


class ProjectTestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectTestimonial
        fields = [
            'id', 'client_name', 'client_position', 'client_company',
            'client_image', 'testimonial_text', 'rating', 'is_featured'
        ]


class PortfolioListSerializer(serializers.ModelSerializer):
    """Serializer for portfolio list view (lighter data)"""
    technologies = TechnologyTagSerializer(many=True, read_only=True)
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'title', 'slug', 'short_description', 'project_type',
            'client_name', 'featured_image', 'technologies', 'start_date',
            'end_date', 'duration_display', 'is_featured', 'status',
            'views_count', 'tech_stack_frontend', 'tech_stack_backend'
        ]


class PortfolioDetailSerializer(serializers.ModelSerializer):
    """Serializer for portfolio detail view (complete data)"""
    technologies = TechnologyTagSerializer(many=True, read_only=True)
    testimonials = ProjectTestimonialSerializer(many=True, read_only=True)
    created_by = serializers.StringRelatedField()
    
    class Meta:
        model = Portfolio
        fields = [
            'id', 'title', 'slug', 'description', 'short_description',
            'project_type', 'client_name', 'project_url', 'repository_url',
            'case_study_url', 'featured_image', 'gallery_images',
            'technologies', 'tech_stack_frontend', 'tech_stack_backend',
            'tech_stack_database', 'tech_stack_deployment', 'start_date',
            'end_date', 'duration_months', 'duration_display', 'team_size',
            'budget_range', 'status', 'is_featured', 'display_order',
            'created_by', 'created_at', 'updated_at', 'views_count',
            'detailed_description', 'challenges_faced', 'key_features',
            'lessons_learned', 'testimonials', 'is_completed'
        ]


class PortfolioCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating portfolio projects"""
    technologies = serializers.PrimaryKeyRelatedField(
        many=True, queryset=TechnologyTag.objects.all(), required=False
    )
    
    class Meta:
        model = Portfolio
        fields = [
            'title', 'slug', 'description', 'short_description',
            'project_type', 'client_name', 'project_url', 'repository_url',
            'case_study_url', 'featured_image', 'gallery_images',
            'technologies', 'tech_stack_frontend', 'tech_stack_backend',
            'tech_stack_database', 'tech_stack_deployment', 'start_date',
            'end_date', 'duration_months', 'team_size', 'budget_range',
            'status', 'is_featured', 'display_order', 'detailed_description',
            'challenges_faced', 'key_features', 'lessons_learned'
        ]
    
    def create(self, validated_data):
        # Set the created_by field to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class PortfolioStatsSerializer(serializers.Serializer):
    """Serializer for portfolio statistics"""
    total_projects = serializers.IntegerField()
    published_projects = serializers.IntegerField()
    featured_projects = serializers.IntegerField()
    total_views = serializers.IntegerField()
    technologies_used = serializers.IntegerField()
    avg_project_duration = serializers.FloatField()
    latest_project = PortfolioListSerializer(read_only=True, allow_null=True)
