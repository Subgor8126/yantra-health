from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from api.models import User
from api.serializers import UserSerializer
from .TokenRequired import TokenRequired

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [TokenRequired]  # ALL endpoints require valid token
    
    # DISABLE dangerous default endpoints
    def list(self, request, *args, **kwargs):
        """GET /api/users/ - Completely disabled for security"""
        return Response(
            {"detail": "Endpoint disabled for security"}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    def retrieve(self, request, *args, **kwargs):
        """GET /api/users/{id}/ - Disabled, use /me/ instead"""
        return Response(
            {"detail": "Use /api/users/me/ to get your own data"}, 
            status=status.HTTP_405_METHOD_NOT_ALLOWED
        )
    
    # SAFE endpoints using token
    @action(detail=False, methods=['get'])
    def me(self, request):
        """GET /api/users/me/ - Get current user's data from token"""
        # TokenRequired already validated token and set request.token_user_id
        print("printprintprintprintplease")
        user_id = request.token_user_id
        
        try:
            user_obj = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(user_obj)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_me(self, request):
        """PATCH /api/users/update_me/ - Update current user's data"""
        user_id = request.token_user_id
        
        try:
            user_obj = User.objects.get(user_id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "User not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(user_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def create(self, request, *args, **kwargs):
        """POST /api/users/ - Create new user (for registration)"""
        # You might want to customize this for your onboarding flow
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            # Set default values during creation
            serializer.save(onboarding_complete=False)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # # Optional: Admin-only search (if needed)
    # @action(detail=False, methods=['get'])
    # def search(self, request):
    #     """GET /api/users/search/?q=name - Admin search for users"""
    #     user_id = request.token_user_id
        
    #     # Check if current user is admin
    #     try:
    #         current_user = User.objects.get(user_id=user_id)
    #         if not current_user.is_admin:  # Assuming you have this field
    #             return Response(
    #                 {"error": "Admin access required"}, 
    #                 status=status.HTTP_403_FORBIDDEN
    #             )
    #     except User.DoesNotExist:
    #         return Response(
    #             {"error": "User not found"}, 
    #             status=status.HTTP_404_NOT_FOUND
    #         )
        
    #     query = request.query_params.get('q')
    #     if not query:
    #         return Response(
    #             {"error": "Search query required"}, 
    #             status=status.HTTP_400_BAD_REQUEST
    #         )
        
    #     users = User.objects.filter(full_name__icontains=query)
    #     serializer = self.get_serializer(users, many=True)
    #     return Response(serializer.data)