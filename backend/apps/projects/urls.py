from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import (
    ProjectViewSet, ProjectTagViewSet, UserListViewSet,
    ProjectDocumentViewSet, ProjectAssignmentViewSet
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'project-tags', ProjectTagViewSet)
router.register(r'users', UserListViewSet)

# Nested routers for project documents and assignments
project_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
project_router.register(r'documents', ProjectDocumentViewSet, basename='project-documents')
project_router.register(r'assignments', ProjectAssignmentViewSet, basename='project-assignments')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/', include(project_router.urls)),
]