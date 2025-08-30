from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, ProjectTagViewSet, UserListViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'project-tags', ProjectTagViewSet)
router.register(r'users', UserListViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]