from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView
from .views import SignupView, LoginView, RefreshCookieView, LogoutView, ChangePasswordView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshCookieView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('password/change/', ChangePasswordView.as_view(), name='password-change'),
    # Optional: standard pair view for testing
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
]
