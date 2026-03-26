from .views import home, about, contact


app_name = 'settings'
urlpatterns = [
    path('home/', home, name='home'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
]

