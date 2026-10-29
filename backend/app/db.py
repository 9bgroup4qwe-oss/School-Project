from typing import Optional
from supabase import create_client, Client
from app.config import settings

def get_supabase_client(user_jwt: Optional[str] = None) -> Client:
    """
    Returns a Supabase client. If a user_jwt is provided, applies it so
    Row Level Security (RLS) is strictly preserved for that user.
    """
    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)
    if user_jwt:
        client.postgrest.auth(user_jwt)
    return client

def get_service_client() -> Client:
    """
    Returns an admin client with service_role if configured (for system tasks).
    """
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    return create_client(settings.SUPABASE_URL, key)
