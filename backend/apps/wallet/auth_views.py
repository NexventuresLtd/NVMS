from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import UserSerializer


class CurrentUserView(APIView):
    """
    Get the current authenticated user's information
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        # Add permission flags
        data['is_admin'] = request.user.is_staff or request.user.is_superuser
        data['is_staff'] = request.user.is_staff
        data['is_superuser'] = request.user.is_superuser
        return Response(data)
