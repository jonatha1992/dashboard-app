import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import authentication, exceptions
from rest_framework.authentication import BaseAuthentication

User = get_user_model()


class JWTAuthentication(BaseAuthentication):
    """
    Custom JWT Authentication class compatible with the Node.js backend tokens
    """
    authentication_header_prefix = 'Bearer'

    def authenticate(self, request):
        """
        The `authenticate` method is called on every request, regardless of
        whether the endpoint requires authentication.
        """
        request.user = None

        # Get the authorization header
        auth_header = authentication.get_authorization_header(request).split()
        auth_header_prefix = self.authentication_header_prefix.lower()

        if not auth_header:
            return None

        if len(auth_header) == 1:
            # Invalid token header. No credentials provided.
            return None
        elif len(auth_header) > 2:
            # Invalid token header. Credentials string contains spaces.
            return None

        # The JWT library we're using can't handle the `byte` type, which is
        # commonly used by standard libraries in Python 3. To get around this,
        # we simply have to decode `prefix` and `token`.
        prefix = auth_header[0].decode('utf-8')
        token = auth_header[1].decode('utf-8')

        if prefix.lower() != auth_header_prefix:
            # The auth header prefix is not what we expected. Do not attempt to
            # authenticate.
            return None

        # By now, we are sure there is a *chance* that authentication will
        # succeed. We delegate the actual credentials authentication to the
        # method below.
        return self._authenticate_credentials(request, token)

    def _authenticate_credentials(self, request, token):
        """
        Try to authenticate the given credentials. If authentication is
        successful, return the user and token. If not, throw an error.
        """
        try:
            payload = jwt.decode(
                token, 
                settings.JWT_SECRET_KEY, 
                algorithms=['HS256']
            )
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid authentication. Could not decode token.')

        try:
            user = User.objects.get(pk=payload['id'])
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('No user matching this token was found.')

        if not user.is_active:
            raise exceptions.AuthenticationFailed('This user has been deactivated.')

        return (user, token)


def generate_jwt_token(user):
    """
    Generate JWT token for a user (equivalent to Node.js backend)
    """
    from datetime import datetime, timedelta
    
    payload = {
        'id': user.id,
        'username': user.username,
        'role': user.role,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm='HS256'
    )
    
    return token