from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'aw4_rlxxynky)57k*!s-zingw945vbkw6j5zsbc@z!ir9!!0@@'

# SECURITY WARNING: define the correct hosts in production!
ALLOWED_HOSTS = ['*'] 

EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

INSTALLED_APPS = INSTALLED_APPS + [
    'debug_toolbar',
    'wagtail.contrib.styleguide',
]

MIDDLEWARE = MIDDLEWARE + [
    'debug_toolbar.middleware.DebugToolbarMiddleware',
]

INTERNAL_IPS = [
    '127.0.0.1',
    '172.17.0.1',
]


# ALLOW CORS FOR TESTING PURPOSES
CORS_ORIGIN_ALLOW_ALL = True

try:
    from .local import *
except ImportError:
    pass
