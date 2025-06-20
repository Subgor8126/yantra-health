from api.models import User
from uuid import UUID

def create_user_service(user_id: UUID, email: str, full_name: str = None, role: str = None) -> User:
    user = User.objects.create(
        user_id=user_id,
        email=email,
        full_name=full_name,
        role=role
    )
    return user
