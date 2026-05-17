from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS

db     = SQLAlchemy()
jwt    = JWTManager()
bcrypt = Bcrypt()

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth        import auth_bp
    from app.routes.config      import config_bp
    from app.routes.teachers    import teachers_bp
    from app.routes.classes     import classes_bp
    from app.routes.subjects    import subjects_bp
    from app.routes.assignments import assignments_bp
    from app.routes.rooms       import rooms_bp
    from app.routes.generate    import generate_bp
    from app.routes.timetables  import timetables_bp
    from app.routes.electives import electives_bp

    app.register_blueprint(auth_bp,        url_prefix="/api/auth")
    app.register_blueprint(config_bp,      url_prefix="/api/config")
    app.register_blueprint(teachers_bp,    url_prefix="/api/teachers")
    app.register_blueprint(classes_bp,     url_prefix="/api/classes")
    app.register_blueprint(subjects_bp,    url_prefix="/api/subjects")
    app.register_blueprint(assignments_bp, url_prefix="/api/assignments")
    app.register_blueprint(rooms_bp,       url_prefix="/api/rooms")
    app.register_blueprint(generate_bp,    url_prefix="/api/generate")
    app.register_blueprint(timetables_bp,  url_prefix="/api/timetables")
    app.register_blueprint(electives_bp, url_prefix="/api/electives")

    return app