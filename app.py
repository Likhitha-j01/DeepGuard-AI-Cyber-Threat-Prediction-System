import os
from flask import Flask, Response, render_template, send_from_directory
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Serve Firebase config dynamically from .env
@app.route("/firebase-config.js")
def firebase_config():
    js = f"""
export const firebaseConfig = {{
  apiKey: "{os.environ.get('FIREBASE_API_KEY')}",
  authDomain: "{os.environ.get('FIREBASE_AUTH_DOMAIN')}",
  databaseURL: "{os.environ.get('FIREBASE_DATABASE_URL')}",
  projectId: "{os.environ.get('FIREBASE_PROJECT_ID')}",
  storageBucket: "{os.environ.get('FIREBASE_STORAGE_BUCKET')}",
  messagingSenderId: "{os.environ.get('FIREBASE_MESSAGING_SENDER_ID')}",
  appId: "{os.environ.get('FIREBASE_APP_ID')}"
}};
"""
    return Response(js, mimetype="application/javascript")

# Serve style.css from the project root
@app.route("/style.css")
def serve_css():
    return send_from_directory(".", "style.css")

# Serve files from the js/ folder
@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory("js", filename)

# Serve files from the image/ folder
@app.route("/image/<path:filename>")
def serve_image(filename):
    return send_from_directory("image", filename)

# Page routes
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/home")
def home():
    return render_template("home.html")


@app.route("/login")
def login_page():
    return render_template("login.html")

@app.route("/signup")
def signup_page():
    return render_template("signup.html")

@app.route("/dashboard")
def dashboard_page():
    return render_template("dashboard.html")

@app.route("/forgot-password")
def forgot_password_page():
    return render_template("forgot-password.html")

@app.route("/about")
def about_page():
    return render_template("about.html")

@app.route("/alerts")
def alerts_page():
    return render_template("alerts.html")

@app.route("/chatbot")
def chatbot_page():
    return render_template("chatbot.html")

@app.route("/contact")
def contact_page():
    return render_template("contact.html")

@app.route("/help")
def help_page():
    return render_template("help.html")

@app.route("/live-monitoring")
def live_monitoring_page():
    return render_template("live-monitoring.html")

@app.route("/logout")
def logout_page():
    return render_template("logout.html")

@app.route("/notification")
def notification_page():
    return render_template("notifications.html")

@app.route("/prediction")
def prediction_page():
    return render_template("prediction.html")

@app.route("/profile")
def profile_page():
    return render_template("profile.html")

@app.route("/reports")
def reports_page():
    return render_template("reports.html")

@app.route("/settings")
def settings_page():
    return render_template("settings.html")

@app.route("/threat-analysis")
def threat_analysis_page():
    return render_template("threat-analysis.html")

@app.route("/threat-details")
def threat_details_page():
    return render_template("threat-details.html")

@app.route("/threat-history")
def threat_history_page():
    return render_template("threat-history.html")

@app.route("/threat-map")
def threat_map_page():
    return render_template("threat-map.html")

@app.route("/usermanagement")
def usermanagement_page():
    return render_template("usermanagement.html")

@app.route("/systemlogs")
def systemlogs_page():
    return render_template("systemlogs.html")

if __name__ == "__main__":
    app.run(debug=True)