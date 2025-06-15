import subprocess
import os
import signal
import sys
import time

# --- Configuration ---
FLASK_APP_HOST = "localhost"
FLASK_APP_PORT = 5000
BASE_DIR = os.path.dirname(os.path.realpath(__file__))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
FLASK_APP_SCRIPT = "app.py"
FLASK_APP_PATH = os.path.join(BACKEND_DIR, FLASK_APP_SCRIPT)
# Using system python3 as venv is not reliably visible across tool executions
PYTHON_EXECUTABLE = "python3"

flask_process = None

def start_flask_app():
    global flask_process
    print(f"--- Debug ---")
    print(f"BASE_DIR: {BASE_DIR}")
    print(f"BACKEND_DIR: {BACKEND_DIR}")
    print(f"FLASK_APP_PATH: {FLASK_APP_PATH}")
    print(f"Using Python executable: {PYTHON_EXECUTABLE}")
    print(f"--- End Debug ---")

    if not os.path.exists(FLASK_APP_PATH):
        print(f"Error: Flask app script not found at {FLASK_APP_PATH}")
        sys.exit(1)

    # Check if the chosen Python executable exists
    # This is a basic check, actual execution is the real test
    if not any(os.access(os.path.join(path, PYTHON_EXECUTABLE), os.X_OK) for path in os.environ["PATH"].split(os.pathsep)):
        print(f"Error: Python executable '{PYTHON_EXECUTABLE}' not found in PATH or not executable.")
        sys.exit(1)

    print(f"Starting Flask app '{FLASK_APP_PATH}' using interpreter '{PYTHON_EXECUTABLE}'...")

    cmd = [PYTHON_EXECUTABLE, FLASK_APP_SCRIPT]

    flask_process = subprocess.Popen(
        cmd,
        cwd=BACKEND_DIR
    )
    print(f"Flask app started with PID: {flask_process.pid} on http://{FLASK_APP_HOST}:{FLASK_APP_PORT}")
    print("The Flask development server will show its own logs.")
    print("Close this window or press Ctrl+C to stop the Flask server.")

def signal_handler(sig, frame):
    print('\nShutting down Flask server...')
    if flask_process and flask_process.poll() is None:
        flask_process.terminate()
        try:
            flask_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            print("Flask app did not terminate gracefully, sending SIGKILL.")
            flask_process.kill()
    print("Server stopped.")
    sys.exit(0)

if __name__ == "__main__":
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    start_flask_app()

    try:
        while True:
            if flask_process.poll() is not None:
                print("Flask process terminated unexpectedly.")
                signal_handler(signal.SIGINT, None)
                break
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(signal.SIGINT, None)
    except Exception as e:
        print(f"An unexpected error occurred in launch.py: {e}")
        signal_handler(signal.SIGINT, None)
