# Import necessary modules
import webbrowser
import os
import http.server
import socketserver
import threading
import socket

# --- Configuration ---
DEFAULT_PORT = 8000
HOST_NAME = "localhost" # Or "127.0.0.1"

def find_available_port(start_port):
    """
    Finds an available network port, starting from start_port and incrementing.
    """
    port = start_port
    while True:
        try:
            # Attempt to create a socket and bind it to the port
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.bind((HOST_NAME, port))
            # If bind was successful, the port is available
            return port
        except OSError:
            # Port is already in use, try the next one
            print(f"Port {port} is in use, trying next port...")
            port += 1
        except Exception as e:
            # Other unexpected error
            print(f"Error checking port {port}: {e}")
            port +=1 # Try next port anyway

def start_server_and_open_browser():
    """
    Starts a simple HTTP server in a separate thread and opens the browser.
    """
    # Get the absolute path to the directory where this script is located
    script_dir = os.path.abspath(os.path.dirname(__file__))

    # Change the current working directory to the script's directory
    # This is so SimpleHTTPRequestHandler serves files from this location
    os.chdir(script_dir)
    print(f"Serving files from: {script_dir}")

    # Find an available port
    port = find_available_port(DEFAULT_PORT)

    # Set up the HTTP server
    handler = http.server.SimpleHTTPRequestHandler

    # Using socketserver.TCPServer for more robust port handling
    # and to allow address reuse quickly after script restart (though not strictly necessary for this script)
    # httpd = socketserver.TCPServer(("", port), handler)
    # Binding to HOST_NAME instead of "" to be specific, though "" often works for localhost.
    try:
        httpd = socketserver.TCPServer((HOST_NAME, port), handler)
    except OSError as e:
        print(f"Fatal Error: Could not bind to {HOST_NAME}:{port}. Error: {e}")
        print("This might be due to the address not being available or permission issues.")
        return # Exit if server cannot be created

    print(f"Starting HTTP server on {HOST_NAME}:{port}...")

    # Start the server in a separate daemon thread
    # Daemon threads automatically exit when the main program exits
    server_thread = threading.Thread(target=httpd.serve_forever)
    server_thread.daemon = True
    server_thread.start()

    # Construct the URL to open (index.html is the default for SimpleHTTPRequestHandler)
    # Using HOST_NAME ensures consistency with what the server is bound to.
    url_to_open = f"http://{HOST_NAME}:{port}/"

    # Give the server a moment to start (optional, but can be helpful)
    # import time
    # time.sleep(0.5)

    print(f"Attempting to open in browser: {url_to_open}")
    try:
        webbrowser.open(url_to_open)
        print("Browser launch attempted. The server will run in the background.")
        print("Close this window or press Ctrl+C to stop the server.")
    except Exception as e:
        print(f"An error occurred while trying to open the web browser: {e}")

    # Keep the main thread alive until interrupted (e.g., by Ctrl+C)
    # This is necessary because the server is in a daemon thread.
    # If the main thread exits, daemon threads are also terminated.
    try:
        while True:
            pass # Keep main thread alive
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        httpd.shutdown() # Properly shut down the server
        httpd.server_close() # Close the server socket
        print("Server stopped.")

if __name__ == "__main__":
    # Create a dummy index.html if it doesn't exist for testing
    # In a real scenario, index.html should already exist.
    html_file_name = "index.html"
    if not os.path.exists(html_file_name): # Checks in current dir due to os.chdir()
        print(f"Creating dummy {html_file_name} for testing purposes in {os.getcwd()}.")
        with open(html_file_name, "w") as f:
            f.write("<h1>Hello World from HTTP Server!</h1><p>This is a test page served locally.</p>")
        print(f"{html_file_name} created.")
    else:
        print(f"{html_file_name} already exists in {os.getcwd()}.")

    start_server_and_open_browser()
