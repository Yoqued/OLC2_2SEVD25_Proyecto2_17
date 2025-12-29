from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status


@api_view(["GET"])
def health(request):
    return Response({"ok": True, "service": "insightcluster-backend"})


# 1) Carga masiva (recibir archivo)
@api_view(["POST"])
def upload_dataset(request):
    """
    Esperado: multipart/form-data con 'file'
    (Tú implementas: guardar archivo, validar columnas, etc.)
    """
    return Response(
        {"message": "upload_dataset OK (stub)", "detail": "Implementa guardado/validación aquí"},
        status=status.HTTP_200_OK
    )


# 2) Preprocesamiento / limpieza
@api_view(["POST"])
def preprocess(request):
    """
    Esperado: JSON con opciones de limpieza/normalización (si quieres)
    (Tú implementas)
    """
    return Response(
        {"message": "preprocess OK (stub)", "detail": "Implementa limpieza/transformaciones aquí"},
        status=status.HTTP_200_OK
    )


# 3) Entrenamiento (clustering)
@api_view(["POST"])
def train(request):
    """
    Esperado: JSON con parámetros (k, max_iter, algoritmo, etc.)
    (Tú implementas)
    """
    return Response(
        {"message": "train OK (stub)", "detail": "Implementa entrenamiento aquí"},
        status=status.HTTP_200_OK
    )


# 4) Resultados / Segmentos
@api_view(["GET"])
def results(request):
    """
    (Tú implementas: retornar clusters, perfiles, etc.)
    """
    return Response(
        {"message": "results OK (stub)", "data": []},
        status=status.HTTP_200_OK
    )


# 5) Evaluación / métricas internas
@api_view(["GET"])
def evaluation(request):
    """
    (Tú implementas: silhouette, calinski, davies-bouldin, inercia, etc.)
    """
    return Response(
        {
            "message": "evaluation OK (stub)",
            "metrics": {
                "inercia": None,
                "silhouette": None,
                "calinski_harabasz": None,
                "davies_bouldin": None,
            },
        },
        status=status.HTTP_200_OK
    )


# 6) Exportación de reportes/archivos
@api_view(["GET"])
def export_report(request):
    """
    (Tú implementas: generar CSV/JSON/PDF, etc.)
    """
    return Response(
        {"message": "export_report OK (stub)", "detail": "Implementa exportación aquí"},
        status=status.HTTP_200_OK
    )

@api_view(["POST"])
def query_client(request):
    return Response({"cluster": 0, "descripcion": "stub cliente"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def query_review(request):
    return Response({"cluster": 1, "descripcion": "stub reseña"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def export_clients(request):
    return Response({"message": "export_clients stub"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def export_reviews(request):
    return Response({"message": "export_reviews stub"}, status=status.HTTP_200_OK)


@api_view(["GET"])
def export_summary(request):
    return Response({"message": "export_summary stub"}, status=status.HTTP_200_OK)