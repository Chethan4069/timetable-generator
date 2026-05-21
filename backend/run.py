from app import create_app, db
import time
import psycopg2
import os

app = create_app()

def wait_for_db():
    print("Waiting for database to be ready...")
    retries = 10
    while retries > 0:
        try:
            conn = psycopg2.connect(
                host     = os.getenv("DB_HOST",     "localhost"),
                port     = os.getenv("DB_PORT",     "5432"),
                dbname   = os.getenv("DB_NAME",     "timetable_db"),
                user     = os.getenv("DB_USER",     "postgres"),
                password = os.getenv("DB_PASSWORD", "")
            )
            conn.close()
            print("Database is ready!")
            return
        except Exception:
            print(f"DB not ready, retrying... ({retries} left)")
            retries -= 1
            time.sleep(3)
    print("Could not connect. Starting anyway...")


def seed_default_data():
    """
    Auto-create default config if none exists.
    This runs every startup — safe because it checks before inserting.
    """
    from app.models.global_config import GlobalConfig

    if not GlobalConfig.query.first():
        config = GlobalConfig(
            school_start_time     = "09:00",
            lecture_duration_mins = 50,
            lectures_per_day      = 6,
            break_after_lecture   = 3,
            break_duration_mins   = 15,
            working_days          = "Mon,Tue,Wed,Thu,Fri"
        )
        db.session.add(config)
        db.session.commit()
        print("✅ Default global config created automatically.")
    else:
        print("✅ Global config already exists.")


if __name__ == "__main__":
    wait_for_db()
    with app.app_context():
        db.create_all()
        print("Tables created successfully.")
        seed_default_data()
    app.run(debug=True, host="0.0.0.0", port=5000)