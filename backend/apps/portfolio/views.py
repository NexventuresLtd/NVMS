from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Sum, Q
from django.utils.text import slugify
from .models import Portfolio, TechnologyTag, ProjectTestimonial
from .serializers import (
    PortfolioListSerializer, PortfolioDetailSerializer,
    PortfolioCreateUpdateSerializer, TechnologyTagSerializer,
    ProjectTestimonialSerializer, PortfolioStatsSerializer
)


class PortfolioViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing portfolio projects
    """
    queryset = Portfolio.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PortfolioListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PortfolioCreateUpdateSerializer
        return PortfolioDetailSerializer
    
    def get_queryset(self):
        queryset = Portfolio.objects.select_related('created_by').prefetch_related('technologies', 'testimonials')
        
        # Filter by status for non-authenticated users
        if not self.request.user.is_authenticated:
            queryset = queryset.filter(status='published')
        
        # Filter parameters
        status_filter = self.request.query_params.get('status')
        project_type = self.request.query_params.get('type')
        is_featured = self.request.query_params.get('featured')
        technology = self.request.query_params.get('technology')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if project_type:
            queryset = queryset.filter(project_type=project_type)
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == 'true')
        if technology:
            queryset = queryset.filter(technologies__name__icontains=technology)
        
        return queryset.distinct()
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count"""
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Auto-generate slug if not provided"""
        if not serializer.validated_data.get('slug'):
            title = serializer.validated_data['title']
            base_slug = slugify(title)
            slug = base_slug
            counter = 1
            while Portfolio.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            serializer.validated_data['slug'] = slug
        
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured projects"""
        featured_projects = self.get_queryset().filter(is_featured=True, status='published')
        serializer = PortfolioListSerializer(featured_projects, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get portfolio statistics"""
        queryset = Portfolio.objects.all()
        
        stats = {
            'total_projects': queryset.count(),
            'published_projects': queryset.filter(status='published').count(),
            'featured_projects': queryset.filter(is_featured=True).count(),
            'total_views': queryset.aggregate(total=Sum('views_count'))['total'] or 0,
            'technologies_used': TechnologyTag.objects.count(),
            'avg_project_duration': queryset.exclude(duration_months__isnull=True)
                                           .aggregate(avg=Avg('duration_months'))['avg'] or 0,
            'latest_project': queryset.filter(status='published').first()
        }
        
        serializer = PortfolioStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_technology(self, request):
        """Get projects grouped by technology"""
        tech_slug = request.query_params.get('tech')
        if tech_slug:
            projects = self.get_queryset().filter(technologies__name__icontains=tech_slug)
            serializer = PortfolioListSerializer(projects, many=True)
            return Response(serializer.data)
        
        # Return all technologies with project counts
        technologies = TechnologyTag.objects.annotate(
            project_count=Count('portfolio', filter=Q(portfolio__status='published'))
        ).filter(project_count__gt=0)
        
        serializer = TechnologyTagSerializer(technologies, many=True)
        return Response(serializer.data)


class TechnologyTagViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing technology tags
    """
    queryset = TechnologyTag.objects.all()
    serializer_class = TechnologyTagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most used technologies"""
        popular_techs = self.get_queryset().annotate(
            usage_count=Count('portfolio')
        ).filter(usage_count__gt=0).order_by('-usage_count')[:10]
        
        serializer = self.get_serializer(popular_techs, many=True)
        return Response(serializer.data)


class ProjectTestimonialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing project testimonials
    """
    queryset = ProjectTestimonial.objects.all()
    serializer_class = ProjectTestimonialSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        project_slug = self.request.query_params.get('project')
        if project_slug:
            queryset = queryset.filter(project__slug=project_slug)
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured testimonials"""
        featured = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)
