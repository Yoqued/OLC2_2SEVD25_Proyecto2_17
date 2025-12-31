import os,json
import uuid
import pandas as pd
from django.conf import settings
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .limpieza import limpiar_df,entrenar_todo


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
    upload_id = request.data.get("upload_id")
    if not upload_id:
        return Response({"error": "Falta upload_id"}, status=status.HTTP_400_BAD_REQUEST)

    clean_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_clean.csv")
    if not os.path.exists(clean_path):
        return Response({"error": "No existe CSV limpio. Ejecuta preprocess primero."},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        df_clean = pd.read_csv(clean_path)

        # ✅ ENTRENAR TODO SIEMPRE DESDE limpieza.py
        df_trained, metrics = entrenar_todo(df_clean, request.data)

        trained_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_trained.csv")
        df_trained.to_csv(trained_path, index=False)

        metrics_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_metrics.json")
        with open(metrics_path, "w", encoding="utf-8") as f:
            json.dump(metrics, f, ensure_ascii=False, indent=2)

        return Response(
            {
                "message": "Entrenamiento completado (numérico + reseñas).",
                "upload_id": upload_id,
                "trained_file": f"{settings.MEDIA_URL}{upload_id}_trained.csv",
                "metrics_file": f"{settings.MEDIA_URL}{upload_id}_metrics.json",
                "metrics": metrics,  # opcional: también las devuelve directo
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response({"error": f"Error entrenando: {str(e)}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
    # 1) upload_id por query ?upload_id=...
    upload_id = request.query_params.get("upload_id")

    # 2) fallback: sesión
    if not upload_id:
        upload_id = request.session.get("upload_id")

    if not upload_id:
        return Response({"error": "Falta upload_id (?upload_id=...)"}, status=status.HTTP_400_BAD_REQUEST)

    metrics_path = os.path.join(settings.MEDIA_ROOT, f"{upload_id}_metrics.json")

    if not os.path.exists(metrics_path):
        return Response(
            {"error": "No hay métricas aún. Ejecuta /preprocess y luego /train."},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        with open(metrics_path, "r", encoding="utf-8") as f:
            metrics = json.load(f)

        # ✅ Tu limpieza.py debería retornar algo como:
        # metrics = { ...metrics_num..., ...metrics_text... }
        # o metrics = {"clientes": {...}, "reseñas": {...}}

        # Caso A: ya viene separado
        if "clientes" in metrics or "reseñas" in metrics:
            clientes = metrics.get("clientes", {})
            resenas = metrics.get("reseñas", {})
        else:
            # Caso B: viene plano (como tu metrics_num y metrics_text juntos)
            clientes = {
                "k_clientes": metrics.get("k_clientes"),
                "max_iter": metrics.get("max_iter"),
                "n_init": metrics.get("n_init"),
                "silhouette_clientes": metrics.get("silhouette_clientes"),
                "inercia_clientes": metrics.get("inercia_clientes"),
                "calinski_clientes": metrics.get("calinski_clientes"),
                "davies_clientes": metrics.get("davies_clientes"),
                "perfil_clientes": metrics.get("perfil_clientes"),
            }
            resenas = {
                "k_reseñas": metrics.get("k_reseñas"),
                "silhouette_reseñas": metrics.get("silhouette_reseñas"),
                "inercia_reseñas": metrics.get("inercia_reseñas"),
                "calinski_reseñas": metrics.get("calinski_reseñas"),
                "davies_reseñas": metrics.get("davies_reseñas"),
            }

        return Response(
            {
                "message": "evaluation OK",
                "upload_id": upload_id,
                "clientes": clientes,
                "reseñas": resenas,
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response({"error": f"Error leyendo métricas: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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