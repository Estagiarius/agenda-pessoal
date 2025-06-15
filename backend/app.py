from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)

# Configure SQLAlchemy
# Use an absolute path for the database to avoid ambiguity with cwd
db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'site.db')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Suppress a warning

db = SQLAlchemy(app)

# Define UserCredentials Model
class UserCredentials(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False, default='default_user') # Placeholder user
    service_name = db.Column(db.String(50), nullable=False) # 'google' or 'outlook'
    access_token = db.Column(db.String(1000), nullable=False)
    refresh_token = db.Column(db.String(1000), nullable=True)
    # Store expiry as a Unix timestamp (integer)
    expires_at = db.Column(db.Integer, nullable=True)
    # Store the full token JSON for flexibility, e.g., if it contains extra fields like scope
    token_json = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<UserCredentials {self.user_id} {self.service_name}>"

@app.route('/')
def home():
    return "Hello from Flask Backend!"

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "Backend is healthy"})

# Example route to test DB (optional, can be removed later)
@app.route('/api/test_db_add')
def test_db_add():
    try:
        # Check if a default google token exists
        existing_token = UserCredentials.query.filter_by(user_id='default_user', service_name='google_test').first()
        if not existing_token:
            new_cred = UserCredentials(
                user_id='default_user',
                service_name='google_test',
                access_token='dummy_access_token_123',
                refresh_token='dummy_refresh_token_456',
                expires_at=1678886400 # Example timestamp
            )
            db.session.add(new_cred)
            db.session.commit()
            return jsonify({"message": "Dummy google_test credential added."}), 201
        return jsonify({"message": "Dummy google_test credential already exists."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all() # Create database tables if they don't exist
    app.run(host='0.0.0.0', port=5000, debug=True)
