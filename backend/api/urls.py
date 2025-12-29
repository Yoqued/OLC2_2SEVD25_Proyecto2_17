from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),

    path("dataset/upload/", views.upload_dataset, name="upload_dataset"),
    path("dataset/preprocess/", views.preprocess, name="preprocess"),

    path("model/train/", views.train, name="train"),
    path("model/results/", views.results, name="results"),
    path("model/evaluation/", views.evaluation, name="evaluation"),

    path("report/export/", views.export_report, name="export_report"),

    path("query/client/", views.query_client, name="query_client"),
    path("query/review/", views.query_review, name="query_review"),

    path("export/clients/", views.export_clients, name="export_clients"),
    path("export/reviews/", views.export_reviews, name="export_reviews"),
    path("export/summary/", views.export_summary, name="export_summary"),
]
