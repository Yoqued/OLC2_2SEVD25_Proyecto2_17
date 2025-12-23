from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def test_api(request):
    return JsonResponse({
        "message": "Django conectado correctamente con React"
    })

# Create your views here.
