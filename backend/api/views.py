import os
import uuid
import pandas as pd
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .limpieza import limpiar_df


@api_view(["GET"])
def health(request):
    return Response({"ok": True, "service": "insightcluster-backend"})


# 1) Carga masiva (recibir archivo)
@api_view(["POST"])
def upload_dataset(request):
    file = request.FILES.get("file")
    if not file:
        return Response({"error": "No se recibió 'file'."}, status=status.HTTP_400_BAD_REQUEST)

    if not file.name.lower().endswith(".csv"):
        return Response({"error": "El archivo debe ser .csv"}, status=status.HTTP_400_BAD_REQUEST)

    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)

    upload_id = str(uuid.uuid4())
    raw_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_raw.csv")

    # Guardar archivo tal cual
    with open(raw_path, "wb") as f:
        for chunk in file.chunks():
            f.write(chunk)

    # Validación rápida: intentar leer CSV
    try:
        df = pd.read_csv(raw_path)
    except Exception as e:
        return Response({"error": f"No se pudo leer CSV: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

    # Guardar el ID para el siguiente paso (preprocess)
    request.session["upload_id"] = upload_id

    return Response(
        {
            "message": "CSV subido correctamente.",
            "upload_id": upload_id,
            "rows": int(df.shape[0]),
            "cols": int(df.shape[1]),
            "columns": list(df.columns),
        },
        status=status.HTTP_200_OK
    )


# 2) Preprocesamiento / limpieza
@api_view(["POST"])
def preprocess(request):
    # 1) intentamos leer upload_id del JSON
    upload_id = request.data.get("upload_id")

    # 2) si no viene, intentamos del session (por compatibilidad)
    if not upload_id:
        upload_id = request.session.get("upload_id")

    if not upload_id:
        return Response(
            {"error": "No hay upload_id. Primero sube CSV o envía upload_id en el body."},
            status=status.HTTP_400_BAD_REQUEST
        )

    raw_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_raw.csv")

    if not os.path.exists(raw_path):
        return Response(
            {"error": f"No se encontró el archivo raw para upload_id={upload_id}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        df = pd.read_csv(raw_path)
        df_clean = limpiar_df(df)

        clean_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_clean.csv")
        df_clean.to_csv(clean_path, index=False)

        return Response(
            {
                "message": "Preprocesamiento completado.",
                "upload_id": upload_id,
                "rows_before": int(df.shape[0]),
                "rows_after": int(df_clean.shape[0]),
                "cols": int(df_clean.shape[1]),
                "clean_file": f"{settings.MEDIA_URL}{upload_id}_clean.csv",
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response({"error": f"Error en limpieza: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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