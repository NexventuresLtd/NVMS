from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth.models import User
from .models import Project, ProjectTag, ProjectNote, ProjectDocument, ProjectAssignment
from .serializers import (
    ProjectListSerializer,
    ProjectDetailSerializer,
    ProjectCreateSerializer,
    ProjectTagSerializer,
    ProjectNoteSerializer,
    ProjectDocumentSerializer,
    ProjectAssignmentSerializer,
    UserSerializer
)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.filter(is_active=True).select_related(
        'assigned_to', 'supervisor', 'created_by'
    ).prefetch_related('tag_assignments__tag', 'notes', 'documents', 'assignments__user')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'supervisor', 'created_by']
    search_fields = ['title', 'description', 'client_name']
    ordering_fields = ['created_at', 'updated_at', 'due_date', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProjectListSerializer
        elif self.action == 'create':
            return ProjectCreateSerializer
        return ProjectDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status if provided
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by overdue projects
        is_overdue = self.request.query_params.get('is_overdue')
        if is_overdue == 'true':
            from django.utils import timezone
            queryset = queryset.filter(
                due_date__lt=timezone.now().date(),
                status__in=['planning', 'in_progress', 'testing']
            )
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """Add a note to the project"""
        project = self.get_object()
        serializer = ProjectNoteSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(project=project, author=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        """Upload a document to the project"""
        project = self.get_object()
        serializer = ProjectDocumentSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(project=project, uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def documents(self, request, pk=None):
        """Get all documents for a project"""
        project = self.get_object()
        documents = project.documents.all()
        serializer = ProjectDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_user(self, request, pk=None):
        """Assign a user to the project with a specific role"""
        project = self.get_object()
        serializer = ProjectAssignmentSerializer(data=request.data)
        
        if serializer.is_valid():
            user_id = serializer.validated_data['user_id']
            try:
                user = User.objects.get(id=user_id)
                serializer.save(project=project, user=user, assigned_by=request.user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except User.DoesNotExist:
                return Response(
                    {'error': 'User not found'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def assignments(self, request, pk=None):
        """Get all assignments for a project"""
        project = self.get_object()
        assignments = project.assignments.filter(is_active=True)
        serializer = ProjectAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['delete'])
    def remove_assignment(self, request, pk=None):
        """Remove a user assignment from the project"""
        project = self.get_object()
        assignment_id = request.data.get('assignment_id')
        
        try:
            assignment = ProjectAssignment.objects.get(
                id=assignment_id, 
                project=project
            )
            assignment.is_active = False
            assignment.save()
            return Response({'message': 'Assignment removed'})
        except ProjectAssignment.DoesNotExist:
            return Response(
                {'error': 'Assignment not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update project status"""
        project = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Project._meta.get_field('status').choices]:
            return Response(
                {'error': 'Invalid status'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Auto-set completion date if status is completed
        if new_status == 'completed' and project.status != 'completed':
            from django.utils import timezone
            project.completed_date = timezone.now().date()
        
        project.status = new_status
        project.save()
        
        serializer = self.get_serializer(project)
        return Response(serializer.data)
    
    @action(detail=False)
    def my_projects(self, request):
        """Get projects assigned to the current user"""
        queryset = self.filter_queryset(
            self.get_queryset().filter(assigned_to=request.user)
        )
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def create_portfolio_entry(self, request, pk=None):
        """Create a portfolio entry from this project"""
        project = self.get_object()
        
        if not project.can_create_portfolio_entry:
            return Response(
                {'error': 'Cannot create portfolio entry for this project'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            portfolio_entry = project.create_portfolio_entry()
            return Response(
                {
                    'message': 'Portfolio entry created successfully',
                    'portfolio_id': portfolio_entry.id,
                    'portfolio_slug': portfolio_entry.slug
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False)
    def stats(self, request):
        """Get project statistics"""
        queryset = self.get_queryset()
        
        stats = {
            'total': queryset.count(),
            'by_status': {},
            'by_priority': {},
            'overdue': 0,
            'completed_this_month': 0,
        }
        
        # Count by status
        for status_choice in Project._meta.get_field('status').choices:
            stats['by_status'][status_choice[0]] = queryset.filter(
                status=status_choice[0]
            ).count()
        
        # Count by priority
        for priority_choice in Project._meta.get_field('priority').choices:
            stats['by_priority'][priority_choice[0]] = queryset.filter(
                priority=priority_choice[0]
            ).count()
        
        # Count overdue projects
        from django.utils import timezone
        stats['overdue'] = queryset.filter(
            due_date__lt=timezone.now().date(),
            status__in=['planning', 'in_progress', 'testing']
        ).count()
        
        # Count completed this month
        current_month = timezone.now().replace(day=1)
        stats['completed_this_month'] = queryset.filter(
            status='completed',
            completed_date__gte=current_month
        ).count()
        
        return Response(stats)


class ProjectTagViewSet(viewsets.ModelViewSet):
    queryset = ProjectTag.objects.all()
    serializer_class = ProjectTagSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['name']


class UserListViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only viewset for users (for assignment dropdown)"""
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    ordering = ['username']


class ProjectDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing project documents"""
    serializer_class = ProjectDocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_queryset(self):
        return ProjectDocument.objects.filter(
            project_id=self.kwargs['project_pk']
        )
    
    def perform_create(self, serializer):
        project = Project.objects.get(pk=self.kwargs['project_pk'])
        serializer.save(project=project, uploaded_by=self.request.user)


class ProjectAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing project assignments"""
    serializer_class = ProjectAssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProjectAssignment.objects.filter(
            project_id=self.kwargs['project_pk'],
            is_active=True
        )
    
    def perform_create(self, serializer):
        project = Project.objects.get(pk=self.kwargs['project_pk'])
        user_id = serializer.validated_data['user_id']
        user = User.objects.get(id=user_id)
        serializer.save(
            project=project, 
            user=user, 
            assigned_by=self.request.user
        )