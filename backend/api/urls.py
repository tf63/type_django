from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    path("problem/", views.ProblemAPIView.as_view(), name="problem"),
    path("record/", views.RecordAPIView.as_view(), name="record"),
    path("", views.index, name="index"),
]
