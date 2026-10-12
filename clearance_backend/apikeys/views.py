from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import APIKey
from .serializers import APIKeySerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_keys(request):
    keys = APIKey.objects.filter(user=request.user)
    return Response(APIKeySerializer(keys, many=True).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_key(request):
    name = (request.data.get('name') or 'Default Key').strip()
    if not name:
        return Response({'detail': 'Name is required.'}, status=400)

    obj, raw_key = APIKey.generate(request.user, name)
    data = APIKeySerializer(obj).data
    data['key'] = raw_key        # returned ONCE only — never stored plaintext
    return Response(data, status=201)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def revoke_key(request, key_id):
    try:
        obj = APIKey.objects.get(id=key_id, user=request.user)
    except APIKey.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)
    obj.is_active = False
    obj.save(update_fields=['is_active'])
    return Response({'message': 'API key revoked.'})


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_key(request, key_id):
    try:
        obj = APIKey.objects.get(id=key_id, user=request.user)
    except APIKey.DoesNotExist:
        return Response({'detail': 'Not found.'}, status=404)
    obj.delete()
    return Response({'message': 'API key deleted.'})
