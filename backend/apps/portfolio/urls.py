from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.PortfolioViewSet)
router.register(r'technologies', views.TechnologyTagViewSet)
router.register(r'testimonials', views.ProjectTestimonialViewSet)

app_name = 'portfolio'

urlpatterns = [
    path('api/portfolio/', include(router.urls)),
]
