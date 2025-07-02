from rest_framework.permissions import BasePermission
from api.services import get_user_id_from_request_token

class TokenRequired(BasePermission):
    def has_permission(self, request, view):
        user_id, error_response = get_user_id_from_request_token(request)
        if error_response:
            return False
        
        # Store user_id on request for later use
        request.token_user_id = user_id
        return True