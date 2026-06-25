# creates db, migrations and bcrypt instances for use in the app
from flask_sqlalchemy import SQLAlchemy
from flask_migrate    import Migrate
from flask_bcrypt     import Bcrypt

db      = SQLAlchemy()
migrate = Migrate()
bcrypt  = Bcrypt()